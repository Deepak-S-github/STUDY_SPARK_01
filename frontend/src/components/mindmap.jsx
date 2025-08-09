import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { FaProjectDiagram, FaBolt, FaBrain, FaLightbulb } from "react-icons/fa";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
});

// Recursively convert JSON → Mermaid mindmap syntax
function jsonToMindmap(node, depth = 0) {
  let output = "  ".repeat(depth) + node.title + "\n";
  if (node.children) {
    for (let child of node.children) {
      output += jsonToMindmap(child, depth + 1);
    }
  }
  return output;
}

function jsonToMermaid(jsonData) {
  try {
    if (typeof jsonData === "string") {
      jsonData = JSON.parse(jsonData);
    }
    return "mindmap\n" + jsonToMindmap(jsonData);
  } catch (err) {
    console.error("Invalid JSON for mindmap:", err);
    return null;
  }
}

const Mindmap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mindmapCode, setMindmapCode] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [generated, setGenerated] = useState(false);
  const mermaidRef = useRef(null);

  // Load from navigation state (if passed from another page)
  useEffect(() => {
    if (location.state?.mindmap) {
      const code = jsonToMermaid(location.state.mindmap);
      if (code) {
        setMindmapCode(code);
        setGenerated(true);
      }
    }
  }, [location.state]);

  // Render Mermaid diagram
  useEffect(() => {
    if (mindmapCode && mermaidRef.current) {
      mermaidRef.current.innerHTML = "";
      try {
        mermaid.render("generatedDiagram", mindmapCode, (svgCode) => {
          mermaidRef.current.innerHTML = svgCode;
        });
      } catch (err) {
        mermaidRef.current.innerHTML = `<pre style="color:red;">Error rendering diagram:\n${err.message}</pre>`;
        console.error("Mermaid render error:", err);
      }
    }
  }, [mindmapCode]);

  // Backend API URL (local or hosted)
  const API_URL = "http://localhost:3001/mindmap";
  // If hosted: const API_URL = "https://your-backend.com/process?task=mindmap";

  // Handle file upload
  const handleFile = (file) => {
    setUploadedFile(file);
    setGenerated(false);

    const formData = new FormData();
    formData.append("file", file);

    fetch(API_URL, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (data.aiOutput) {
          const code = jsonToMermaid(data.aiOutput);
          if (code) {
            setMindmapCode(code);
            setGenerated(true);
          }
        } else {
          throw new Error("No mindmap data returned");
        }
      })
      .catch((err) => {
        alert("Error processing file: " + err.message);
      });
  };

  // Drag-and-drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Generate from typed text
  const handleGenerateFromText = () => {
    if (!typedText.trim()) return;
    setGenerated(false);

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: typedText }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (data.aiOutput) {
          const code = jsonToMermaid(data.aiOutput);
          if (code) {
            setMindmapCode(code);
            setGenerated(true);
          }
        } else {
          throw new Error("No mindmap data returned");
        }
      })
      .catch((err) => {
        alert("Error generating mindmap: " + err.message);
      });
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 px-8 py-12 overflow-hidden">
      {/* Generated Mindmap */}
      {generated && (
        <motion.div
          className="bg-white text-black rounded-xl p-6 shadow-lg mb-12 border border-gray-200"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <FaProjectDiagram className="text-orange-500" />
            </motion.div>
            Generated Mindmap
          </h2>

          <motion.div
            ref={mermaidRef}
            className="w-full min-h-[24rem] border rounded-lg overflow-auto bg-gray-100 p-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {!mindmapCode && (
              <p className="text-lg font-medium">🗺 Your Mindmap Visualization Here</p>
            )}
          </motion.div>

          <div className="flex gap-4 mt-6">
            {[
              { label: "Summarize", color: "bg-orange-500", hover: "hover:bg-orange-600", to: "/summarize" },
              { label: "Flashcards", color: "bg-blue-500", hover: "hover:bg-blue-600", to: "/flashcards" },
              { label: "Q&A", color: "bg-green-500", hover: "hover:bg-green-600", to: "/qa" },
            ].map((btn, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(btn.to, { state: { file: uploadedFile, text: typedText } })}
                className={`px-4 py-2 ${btn.color} text-white rounded-lg shadow ${btn.hover} transition-all`}
              >
                {btn.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* File & Text Input */}
      <motion.div
        className="flex flex-col md:flex-row items-center gap-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex-1">
          <motion.div
            className="text-orange-500 text-6xl mb-4"
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <FaProjectDiagram />
          </motion.div>
          <h2 className="text-4xl font-bold text-orange-500 mb-4">Efficient Generation</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Visualize information effortlessly.{" "}
            <span className="text-gray-900 font-semibold">Study Spark AI</span> converts your files or text into mind maps in seconds.
          </p>
        </div>

        <motion.div
          className={`flex-1 rounded-2xl p-6 shadow-lg border-2 border-dashed ${
            dragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"
          } relative`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <input type="file" id="fileUpload" className="hidden" onChange={handleChange} />
          <label
            htmlFor="fileUpload"
            className="flex flex-col items-center justify-center h-32 cursor-pointer text-gray-500"
          >
            {uploadedFile ? (
              <>
                <p className="text-gray-800 font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">File ready to process</p>
              </>
            ) : (
              <>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  📂
                </motion.div>
                <p className="text-lg">Choose a file or drag it here</p>
                <span className="text-xs text-gray-400">Supported: pdf, doc, docx, pptx</span>
              </>
            )}
          </label>

          <div className="my-4 text-center text-gray-400">OR</div>

          <textarea
            placeholder="Type or paste your text here to generate a mindmap..."
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            className="w-full border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 h-32"
          ></textarea>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
            onClick={handleGenerateFromText}
          >
            Generate Mindmap
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {[
          {
            icon: <FaBolt className="text-orange-500 text-4xl" />,
            title: "Fast Processing",
            desc: "Generate mindmaps instantly from files or text with optimized AI algorithms.",
          },
          {
            icon: <FaBrain className="text-orange-500 text-4xl" />,
            title: "Smart Structuring",
            desc: "Organizes your content logically for better understanding and retention.",
          },
          {
            icon: <FaLightbulb className="text-orange-500 text-4xl" />,
            title: "Enhanced Learning",
            desc: "Helps visualize complex ideas clearly to improve study efficiency.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mb-4"
            >
              {feature.icon}
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Mindmap;
