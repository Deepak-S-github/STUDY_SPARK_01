 const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const serviceAccount = require('./auth.json');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
// ✅ Firebase Init
console.log('[Firebase] Initializing...');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
console.log('[Firebase] Firestore connected.');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// 🧠 Temporary in-memory store for concept session
const memoryStore = {};

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('Teach-Back Chatbot Backend is running ✅');
});

// 🔐 Registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await usersRef.add({ name, email, password: hashedPassword });

    res.json({ message: 'User registered successfully ✅' });
  } catch (err) {
    console.error('❌ Register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 🔐 Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({
      message: 'Login successful ✅',
      user: { name: userData.name, email: userData.email },
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 🔁 Reusable generator function
const generate = async (prompt, max_tokens = 300) => {
  const response = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false,
      temperature: 0.4,
      top_p: 0.9,
      max_tokens,
    }),
  });

  const data = await response.json();
  return (data?.response || '').trim();
};


// 📝 Route: Summarise Concept
app.post('/summarise', async (req, res) => {
  const { concept } = req.body;
  console.log(`\n[SUMMARISE] Concept: "${concept}"`);

  const prompt = `Summarize the concept of "${concept}" in 5-6 short sentences using simple language. Avoid unnecessary details.`;

  try {
    const summary = await generate(prompt);
    if (!summary) throw new Error('Empty summary response');

    await db.collection('teachback').add({
      type: 'summary',
      concept,
      summary,
      timestamp: new Date(),
    });

    console.log('[SUMMARISE] ✅ Summary:', summary.slice(0, 100), '...');
    res.json({ response: summary });
  } catch (error) {
    console.error('❌ [SUMMARISE] Error:', error.message);
    res.status(500).json({ response: 'Failed to get summary.' });
  }
});

// 🧾 Route: Generate Flashcards
app.post('/flashcards', async (req, res) => {
  const { concept } = req.body;
  console.log(`\n[FLASHCARDS] Concept: "${concept}"`);

  const prompt = `Create 6 flashcards about "${concept}". Each flashcard should have a "title" and a short "explanation". Return the result as a JSON array like this: [{"title": "...", "explanation": "..."}, ...]`;

  try {
    const flashcardRaw = await generate(prompt, 300);
    if (!flashcardRaw) throw new Error('Empty flashcard response');

    let flashcards;
    try {
      flashcards = JSON.parse(flashcardRaw);
      if (!Array.isArray(flashcards)) throw new Error('Invalid flashcard format');
    } catch (parseError) {
      console.warn('[FLASHCARDS] ⚠ JSON parsing failed:', flashcardRaw);
      throw new Error('Failed to parse flashcards.');
    }

    await db.collection('teachback').add({
      type: 'flashcards',
      concept,
      flashcards,
      timestamp: new Date(),
    });

    console.log('[FLASHCARDS] ✅ Flashcards generated:', flashcards.length);
    res.json({ response: flashcards });
  } catch (error) {
    console.error('❌ [FLASHCARDS] Error:', error.message);
    res.status(500).json({ response: 'Failed to generate flashcards.' });
  }
});
app.post('/ask', async (req, res) => {
  let { concept } = req.body;
  console.log(`\n[ASK] Raw concept received: "${concept}"`);

  if (!concept || !concept.trim()) {
    return res.status(400).json({ response: 'Concept is required.' });
  }

  concept = concept.trim().toLowerCase().replace(/^about\s+|^what\s+is\s+|\?$/g, '');
  const conceptKey = concept.charAt(0).toUpperCase() + concept.slice(1);
  const prompt = `You are a teacher. Clearly explain the concept of "${conceptKey}" in one short, beginner-friendly paragraph. Do not answer unrelated questions. Only explain the concept itself as if teaching a student. Avoid repetition or vague terms.`;

  try {
    const explanation = await generate(prompt, 120);
    if (!explanation) throw new Error('Empty model response');

    if (!memoryStore[conceptKey]) {
      memoryStore[conceptKey] = {
        concept: conceptKey,
        history: [],
      };
    }

    memoryStore[conceptKey].history.push({
      explanation,
      userAnswer: null,
      feedback: null,
    });

    console.log('[ASK] ✅ Explanation:', explanation.slice(0, 100), '...');
    res.json({ response: explanation });
  } catch (error) {
    console.error('❌ [ASK] Error:', error.message);
    res.status(500).json({ response: 'Failed to get explanation.' });
  }
});

// ✅ Route: Evaluate Student Answer (Enhanced)
// 🛠 Helper: Normalize concept consistently
function normalizeConcept(text) {
  if (!text) return '';
  text = text.trim().toLowerCase();
  text = text.replace(/^about\s+/, '');
  text = text.replace(/^what\s+is\s+/, '');
  text = text.replace(/\?$/, '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ✅ Route: Evaluate Student Answer (Fixed + Enhanced)
app.post('/check', async (req, res) => {
  let { concept, userAnswer } = req.body;
  if (!concept || !userAnswer) {
    return res.status(400).json({ response: 'Missing data' });
  }

  concept = concept.trim().toLowerCase().replace(/^about\s+|^what\s+is\s+|\?$/g, '');
  const conceptKey = concept.charAt(0).toUpperCase() + concept.slice(1);

  const session = memoryStore[conceptKey];
  if (!session || !session.history || session.history.length === 0) {
    return res.status(400).json({ response: 'Explanation not available yet. Please call /ask first.' });
  }

  const latestExplanation = session.history[session.history.length - 1].explanation;

 const prompt = `
You are a friendly and helpful AI tutor talking to a student.

Concept: "${conceptKey}"
Explanation you gave earlier: "${latestExplanation}"
Student's answer: "${userAnswer}"

Respond naturally, like you're chatting with the student. Here's how:

- Let them know casually if their answer is correct, partially correct, or incorrect.
- If they missed anything, explain only that part clearly and simply.
- Do not repeat the full explanation.
- Do not use section headers, bolded phrases, bullet points, or emojis.
- Do not include click options or action buttons at the end.
- End with a friendly, casual question like "Want to try that again?" or "Would you like to go over it once more?"

Keep the tone human, kind, and conversational — like a real tutor helping one-on-one.
`.trim();


  try {
    const feedback = await generate(prompt, 200);
    if (!feedback) throw new Error('Empty feedback from model.');

    // ✅ Instead of updating the latest history entry, add a NEW one:
    session.history.push({
      explanation: latestExplanation,
      userAnswer,
      feedback,
    });

    console.log('[CHECK] ✅ Feedback stored:', feedback.slice(0, 100), '...');
    res.json({ response: feedback });
  } catch (error) {
    console.error('❌ [CHECK] Error:', error.message);
    res.status(500).json({ response: 'Failed to evaluate answer.' });
  }
});
// ✅ Route: Complete Session
// This endpoint saves the session data to Firestore and cleans up the in-memory store
app.post('/complete', async (req, res) => {
  let { concept } = req.body;
  if (!concept || !concept.trim()) {
    return res.status(400).json({ response: 'Concept is required.' });
  }

  concept = concept.trim().toLowerCase().replace(/^about\s+|^what\s+is\s+|\?$/g, '');
  const conceptKey = concept.charAt(0).toUpperCase() + concept.slice(1);

  const session = memoryStore[conceptKey];
  if (!session || !session.history || session.history.length === 0) {
    return res.status(400).json({ response: 'No session found to complete.' });
  }

  try {
    await db.collection('history').add({
      type: 'completed-session',
      concept: conceptKey,
      conversation: session.history,
      timestamp: new Date(),
    });

    delete memoryStore[conceptKey]; // cleanup after saving
    console.log(`[COMPLETE] ✅ Session saved for: "${conceptKey}"`);
    res.json({ response: 'Session saved successfully ✅' });
  } catch (error) {
    console.error('❌ [COMPLETE] Error:', error.message);
    res.status(500).json({ response: 'Failed to save session.' });
  }
});

app.get('/history_chatbot', async (req, res) => {
  try {
    const snapshot = await db.collection('history').orderBy('timestamp', 'desc').get();
    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ sessions });
  } catch (err) {
    console.error('❌ Failed to fetch history:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

const upload = multer({ dest: 'uploads/' });
async function extractTextFromPDF(buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let textContent = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    textContent += pageText + '\n';
  }
  return textContent;
}
app.post('/process', upload.single('file'), async (req, res) => {
  console.log(`\n🛠️ [PROCESS] Request received: task=${req.query.task || 'summary'}`);

  const file = req.file;
  const task = req.query.task || 'summary';
  const model = req.query.model || 'llama3'; // You can change default model here

  if (!file) {
    console.warn('⚠️ No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  console.log(`📄 Uploaded file: ${file.originalname}`);
  console.log(`   - Temp path: ${file.path}`);
  console.log(`   - Size: ${(file.size / 1024).toFixed(2)} KB`);

  const filePath = path.resolve(file.path);
  const ext = path.extname(file.originalname).toLowerCase();
  let textContent = '';

  try {
    // ====== Extract Text ======
    console.log(`🔍 Extracting text from ${ext}...`);
    if (ext === '.pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      textContent = data.text;
    } 
    else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      textContent = result.value;
    } 
    else if (ext === '.txt') {
      textContent = fs.readFileSync(filePath, 'utf8');
    } 
    else if (ext === '.mp3' || ext === '.wav' || ext === '.m4a') {
      console.log('🎙️ Transcribing audio file...');
      const transcript = await runPythonScript('transcribe.py', [file.path]);
      textContent = transcript.trim();
    } 
    else {
      console.error('❌ Unsupported file format:', ext);
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    console.log(`✅ Extracted text length: ${textContent.length} chars`);

    if (!textContent.trim()) {
      console.warn('⚠️ No text extracted from file');
      return res.status(400).json({ error: 'No text extracted from file' });
    }

    // ====== Build Prompt ======
    const prompt = buildPrompt(task, textContent);
    console.log(`📝 Prompt built (length: ${prompt.length} chars)`);
    console.log(`   Prompt preview: ${prompt.slice(0, 200)}...`);

    // ====== Call Local LLaMA / Mixtral Model ======
    console.log(`🤖 Sending request to model: ${model}`);
    const aiRes = await axios.post('http://127.0.0.1:11434/api/generate', {
      model,
      prompt,
      stream: false
    });

    console.log('📥 Raw AI output received:');
    console.log(aiRes.data.response.slice(0, 300) + '...');

    // ====== Parse Output ======
    let aiOutput = parseAIResponse(aiRes.data.response, task);
    console.log(`📦 Parsed AI output for task "${task}"`);

    res.json({
      task,
      model,
      inputType: ext,
      aiOutput
    });

  } catch (err) {
    console.error('❌ Error during processing:', err);
    res.status(500).json({ error: 'Processing failed', details: err.message });
  } finally {
    // Always delete the uploaded file
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted temp file: ${filePath}`);
    } catch {
      console.warn('⚠️ Failed to delete temp file');
    }
  }
});

// =======================
//  PROMPT GENERATOR
// =======================
function buildPrompt(task, inputText) {
  switch (task) {
    case 'summary':
      return `
You are an expert summarizer.
Summarize the following content in clear, concise bullet points.
Do not add extra commentary.

Content:
${inputText}
      `.trim();

case 'mindmap':
  return `
You are an expert in creating hierarchical mind maps.

Output the mind map in valid Mermaid format ONLY, using the syntax:
mindmap
  root((Root Topic))
    subtopic1
      child1
      child2
    subtopic2
      child3

STRICT RULES:
- Start with the word "mindmap" on the first line (no markdown, no \`\`\` fencing).
- Indent child nodes with two spaces per hierarchy level.
- Each node should be a short phrase (max 5 words).
- No explanations, no commentary — only the mind map code.

Topic:
${inputText}
  `.trim();


    case 'flashcards':
      return `
You are an expert at creating educational flashcards.
Generate exactly 10 flashcards in valid JSON format:
[
  { "question": "Question text here", "answer": "Answer text here" }
]

Rules:
- Output ONLY valid JSON.
- No markdown formatting or extra text.
- Keep questions short and clear.

Content:
${inputText}
      `.trim();

    case 'qa':
      return `
You are an expert question generator.
Generate exactly 5 Q&A pairs in valid JSON format:
[
  { "question": "Question text here", "answer": "Answer text here" }
]

Rules:
- Output ONLY valid JSON.
- No markdown formatting or extra text.
- Keep answers short and accurate.

Content:
${inputText}
      `.trim();

    default:
      return `
You are an expert summarizer.
Summarize the following content clearly and concisely.

Content:
${inputText}
      `.trim();
  }
}

// =======================
//  AI OUTPUT PARSER
// =======================
function parseAIResponse(output, task) {
  const cleaned = output.trim();

  if (task === 'mindmap') {
    try {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      return { error: 'Invalid mindmap JSON', raw: cleaned };
    }
    return { error: 'No valid JSON found for mindmap', raw: cleaned };
  }

  if (task === 'flashcards' || task === 'qa') {
    try {
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}
    return { error: 'Invalid JSON output', raw: cleaned };
  }

  return cleaned;
}

// =======================
//  PYTHON SCRIPT RUNNER
// =======================
function runPythonScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const cmd = `python ${scriptPath} ${args.join(' ')}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err);
      resolve(stdout);
    });
  });
}

// 📍 POST /mindmap endpoint
app.post('/mindmap', upload.single('pdf'), async (req, res) => {
  try {
    console.log('📥 Incoming request to /mindmap');

    if (!req.file) {
      console.warn('⚠️ No file uploaded');
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    console.log(`📄 Uploaded file path: ${req.file.path}`);

    const fileBuffer = fs.readFileSync(req.file.path);
    const uint8Array = new Uint8Array(fileBuffer);
    console.log('📑 PDF file read into buffer');

    const text = await extractTextFromPDF(uint8Array);
    console.log('📃 Extracted text from PDF');
    console.log(`📝 Extracted Text Preview: ${text.slice(0, 100)}...`);

    const prompt = `
Convert the following content into a valid JSON mind map in this format:

{
  "name": "Main Topic",
  "children": [
    { "name": "Subtopic 1" },
    { "name": "Subtopic 2", "children": [ { "name": "Detail A" }, { "name": "Detail B" } ] }
  ]
}

Only return valid JSON (no explanation or text). Here's the content:
${text.slice(0, 4000)}
    `.trim();

    console.log('📤 Sending prompt to Ollama...');

    let llamaResponse;
    try {
      llamaResponse = await axios.post('http://127.0.0.1:11434/api/generate', {
        model: 'mixtral',
        prompt,
        stream: false
      });
    } catch (err) {
      console.error('❌ Failed to get response from Ollama:', err);
      return res.status(500).json({ error: 'Ollama model request failed.' });
    }

    const responseText = llamaResponse.data.response;
    console.log(`🧠 Raw response (first 100 chars): ${responseText.slice(0, 100)}...`);

    let parsedMap;
    try {
      parsedMap = JSON.parse(responseText);
      console.log('✅ Successfully parsed mind map JSON');
    } catch (err) {
      console.error('❌ JSON parse failed:', err);
      return res.status(500).json({ error: 'Failed to parse JSON from model output.', raw: responseText });
    }

    res.setHeader('Content-Type', 'application/json');
    res.json({ map: parsedMap });

  } catch (err) {
    console.error('❌ Mind map generation failed:', err);
    res.status(500).json({ error: 'Mind map generation failed.' });
  } finally {
    // Clean up the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, () => {
        console.log(`🧹 Cleaned up file: ${req.file.path}`);
      });
    }
  }
});
    
// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running at http://localhost:${PORT}`);
});
