import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaClipboardList, FaSyncAlt, FaStar, FaLightbulb } from "react-icons/fa";
import axios from "axios";

const Flashcards = () => {
  const location = useLocation();
  const [flashcardsData, setFlashcardsData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flipped, setFlipped] = useState({});

  // Parse backend output into [{ question: "...", answer: "..." }]
  const parseFlashcards = (data) => {
    if (!data) return [];

    let parsed = data;

    if (typeof data === "string") {
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = [String(data)];
      }
    }

    if (!Array.isArray(parsed)) {
      parsed = [String(parsed)];
    }

    // If backend only sends text, make it Q/A identical for now
    return parsed.map((item) => {
      if (typeof item === "object" && item.question && item.answer) {
        return { question: String(item.question), answer: String(item.answer) };
      }
      return { question: String(item), answer: "No answer provided" };
    });
  };

  useEffect(() => {
    if (location.state?.flashcards) {
      setFlashcardsData(parseFlashcards(location.state.flashcards));
      setGenerated(true);
    }
  }, [location.state]);

  const handleFile = async (file) => {
    setUploadedFile(file);
    setError(null);
    setLoading(true);
    setGenerated(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:3001/process?task=flashcards",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setFlashcardsData(parseFlashcards(res.data.aiOutput));
      setGenerated(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate flashcards");
      setFlashcardsData([]);
    } finally {
      setLoading(false);
    }
  };

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
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleGenerateFromText = async () => {
    if (!typedText.trim()) return;
    setError(null);
    setLoading(true);
    setGenerated(false);

    try {
      const formData = new FormData();
      const blob = new Blob([typedText], { type: "text/plain" });
      formData.append("file", blob, "input.txt");

      const res = await axios.post(
        "http://localhost:3001/process?task=flashcards",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setFlashcardsData(parseFlashcards(res.data.aiOutput));
      setGenerated(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate flashcards");
      setFlashcardsData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (index) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 px-8 py-12">
      <style>{`
        .flip-card {
          perspective: 1000px;
          width: 100%;
          height: 150px;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          cursor: pointer;
        }
        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .flip-card-front {
          background-color: #ffffff;
          color: #333;
        }
        .flip-card-back {
          background-color: #ff7f50;
          color: white;
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Loading */}
      {loading && (
        <motion.div
          className="bg-white text-black rounded-xl p-6 shadow-lg mb-12 border border-gray-200 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-orange-500 font-semibold">
            Generating flashcards... Please wait.
          </p>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          className="bg-red-100 text-red-700 rounded-xl p-4 mb-6 border border-red-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Error: {error}
        </motion.div>
      )}

      {/* Flashcards Output */}
      {generated && flashcardsData.length > 0 && (
        <motion.div
          className="bg-white text-black rounded-xl p-6 shadow-lg mb-12 border border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaClipboardList className="text-orange-500" /> Generated Flashcards
          </h2>
          <div className="w-full max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-100">
            {flashcardsData.map((card, i) => (
              <div
                key={i}
                className={`flip-card mb-4 ${flipped[i] ? "flipped" : ""}`}
                onClick={() => toggleFlip(i)}
              >
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <p className="text-lg font-medium">{card.question}</p>
                  </div>
                  <div className="flip-card-back">
                    <p className="text-lg">{card.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upload & Text Input */}
      <motion.div
        className="flex flex-col md:flex-row items-center gap-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Info Section */}
        <div className="flex-1">
          <motion.div
            className="text-orange-500 text-6xl mb-4"
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <FaClipboardList />
          </motion.div>
          <h2 className="text-4xl font-bold text-orange-500 mb-4">
            Efficient Flashcards Generation
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Convert your documents or notes into interactive flashcards instantly.{" "}
            <span className="text-gray-900 font-semibold">Study Spark AI</span>{" "}
            helps you boost your memory retention and study smarter.
          </p>
        </div>

        {/* Upload Box */}
        <motion.div
          className={`flex-1 rounded-2xl p-6 shadow-lg border-2 border-dashed ${
            dragActive
              ? "border-orange-500 bg-orange-50"
              : "border-gray-300 bg-white"
          } relative`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            onChange={handleChange}
          />
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
                <p className="text-lg">Choose a file or drag it here</p>
                <span className="text-xs text-gray-400">
                  Supported: pdf, doc, docx, pptx
                </span>
              </>
            )}
          </label>

          <div className="my-4 text-center text-gray-400">OR</div>

          <textarea
            placeholder="Type or paste your notes here to generate flashcards..."
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            className="w-full border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 h-32"
          ></textarea>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
            onClick={handleGenerateFromText}
            disabled={loading}
          >
            Generate Flashcards
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {[
          {
            icon: <FaSyncAlt className="text-orange-500 text-4xl" />,
            title: "Quick Creation",
            desc: "Create flashcards instantly from files or text with AI-powered algorithms.",
          },
          {
            icon: <FaStar className="text-orange-500 text-4xl" />,
            title: "Customizable",
            desc: "Tailor your flashcards for any subject or learning style.",
          },
          {
            icon: <FaLightbulb className="text-orange-500 text-4xl" />,
            title: "Effective Learning",
            desc: "Enhances memory retention and helps you review smarter.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Flashcards;
