import { useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    name: "Summarize",
    color: "text-blue-600",
    img: "/summary.jpeg",
    link: "/summarize",
  },
  {
    name: "Flashcard",
    color: "text-pink-600",
    img: "/flashjpg.jpg",
    link: "/flashcard",
  },
  {
    name: "Mindmap",
    color: "text-purple-600",
    img: "/mindmap.jpeg",
    link: "/mindmap",
  },
  {
    name: "Q/A",
    color: "text-green-600",
    img: "/qa.jpeg",
    link: "/qa",
  },
  {
    name: "Chatbot 🤖",
    color: "text-yellow-600",
    img: "/bot.jpg",
    link: "/chatbot",
  },
];

const faqs = [
  {
    question: "What can Study Spark do?",
    answer:
      "It summarizes notes, creates flashcards, mind maps, Q/A, and offers an AI chatbot assistant.",
  },
  {
    question: "Is it free?",
    answer: "Basic features are free. Premium tools may be added later.",
  },
  {
    question: "Do I need to sign in?",
    answer:
      "Yes, login is required to access personalized features and history.",
  },
];

const Landing = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div
      className="bg-gray-50 text-gray-900 min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Import Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@700&display=swap');

          /* Animations */
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }

          /* Apply animation classes */
          .fade-in-up {
            animation: fadeInUp 0.8s ease forwards;
          }

          .fade-in {
            animation: fadeIn 1s ease forwards;
          }

          /* Heading font */
          .heading-font {
            font-family: 'Merriweather', serif;
          }

          /* Body font */
          .body-font {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>

      {/* Hero Section */}
      <section className="text-center py-16 px-6 border-b border-gray-300 fade-in-up">
        <h1 className="heading-font text-5xl font-extrabold mb-6 tracking-tight leading-tight">
          Welcome to Study Spark 🔥
        </h1>
        <p className="body-font text-xl max-w-3xl mx-auto text-gray-700 leading-relaxed">
          Your one-stop AI-powered learning platform to summarize textbooks,
          generate flashcards, build mind maps, ask questions, and chat with
          your learning assistant!
        </p>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 flex flex-col items-center space-y-16 fade-in-up">
        {features.map((feature, idx) => {
          const slideLeft = idx % 2 === 0;

          const isLargeFeature = [
            "Summarize",
            "Flashcard",
            "Mindmap",
            "Q/A",
            "Chatbot 🤖",
          ].includes(feature.name);

          return (
            <div
              key={idx}
              className="relative w-full max-w-5xl overflow-visible fade-in-up"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div
                className={`group flex items-center transition-all duration-500 ${
                  slideLeft ? "justify-start" : "justify-end"
                }`}
              >
                {/* Image card */}
                <Link
                  to={feature.link}
                  className={`flex-shrink-0 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden
                    transition-transform duration-500 transform hover:scale-105 focus:scale-105
                    ${isLargeFeature ? "w-[400px] h-[240px]" : "w-24 h-24"}`}
                  tabIndex={0}
                  aria-label={`Go to ${feature.name}`}
                >
                  <img
                    src={feature.img}
                    alt={feature.name}
                    className={`object-contain transition-all duration-500
                      ${isLargeFeature ? "w-[400px] h-[240px]" : "w-24 h-24"}
                      group-hover:grayscale group-hover:blur-sm
                      ${
                        slideLeft
                          ? "group-hover:-translate-x-6"
                          : "group-hover:translate-x-6"
                      }`}
                    loading="lazy"
                  />
                </Link>

                {/* Description card with gradient and animation */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 z-30 opacity-0 pointer-events-none transition-all duration-500
                    ${
                      slideLeft ? "left-[45%]" : "right-[45%]"
                    }
                    group-hover:opacity-100 group-hover:pointer-events-auto`}
                >
                  <div
                    className={`rounded-2xl p-8 h-60 w-96 flex flex-col justify-center
                      transform transition-all duration-500 shadow-lg border border-transparent
                      bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100
                      opacity-80 group-hover:opacity-100
                      ${
                        slideLeft
                          ? "translate-x-6 group-hover:translate-x-0"
                          : "-translate-x-6 group-hover:translate-x-0"
                      }
                      group-hover:shadow-2xl group-hover:border-purple-300
                    `}
                  >
                    <span
                      className={`heading-font text-xl font-semibold tracking-wide ${feature.color}`}
                    >
                      {feature.name}
                    </span>
                    <p className="body-font text-gray-700 text-base mt-4 leading-relaxed">
                      {feature.name === "Summarize" &&
                        "Summarize helps you quickly grasp the main ideas of any text by condensing lengthy content into brief, clear summaries. It saves time, enhances understanding, and makes studying or reviewing easier by focusing only on key points."}
                      {feature.name === "Flashcard" &&
                        "Flashcards are interactive learning tools that use question-answer pairs to boost memory retention. They help reinforce concepts through repeated practice, making it easier to recall facts, definitions, or formulas during exams or daily learning."}
                      {feature.name === "Mindmap" &&
                        "Mindmaps visually organize information around a central topic, connecting related ideas with branches. This method enhances creativity, understanding, and memory by showing relationships between concepts in a clear, structured, and engaging way."}
                      {feature.name === "Q/A" &&
                        "Q/A provides instant answers to your questions by analyzing your input and delivering clear, relevant responses. It supports quick problem-solving, clarifies doubts, and deepens learning by enabling interactive knowledge exchange."}
                      {feature.name === "Chatbot 🤖" &&
                        "The chatbot is an AI-powered conversational assistant that interacts naturally with users. It answers queries, offers personalized support, and guides learning through friendly, real-time conversations, making complex topics more accessible and engaging."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quote Section */}
      <section className="bg-white py-16 px-6 border-t border-b border-gray-300 text-center fade-in">
        <blockquote className="italic heading-font text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed tracking-wide">
          “Education is the passport to the future, for tomorrow belongs to those
          who prepare for it today.”
        </blockquote>
      </section>

      {/* FAQs Section */}
      <section className="text-center py-20 px-6 max-w-5xl mx-auto mb-28 fade-in-up">
        <h3 className="heading-font text-4xl font-extrabold mb-12 tracking-tight leading-snug text-purple-700">
          FAQs <span className="ml-2">❓</span>
        </h3>

        <div className="max-w-3xl mx-auto text-left space-y-10 text-gray-800">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border-b border-gray-300 pb-6 cursor-pointer group"
              onClick={() => toggleFAQ(idx)}
              aria-expanded={openIndex === idx}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleFAQ(idx);
              }}
            >
              <p
                className={`heading-font font-extrabold text-xl flex justify-between items-center transition-colors duration-300 group-hover:text-pink-600 ${
                  openIndex === idx ? "text-yellow-600" : ""
                }`}
              >
                Q: {faq.question}
                <span
                  className={`transform transition-transform duration-300 text-lg ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </p>

              <div
                className={`mt-4 body-font text-lg leading-relaxed overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section
        className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 py-20 px-10 rounded-3xl shadow-xl max-w-5xl mx-auto mb-32 fade-in-up transform transition-transform duration-700 hover:scale-[1.02]"
        style={{ animationDelay: "1.2s" }}
      >
        <h3 className="heading-font text-4xl font-extrabold mb-10 text-center tracking-tight leading-snug text-purple-700">
          About Us <span className="ml-2">✨📚😊</span>
        </h3>
        <p className="body-font max-w-4xl mx-auto text-gray-800 text-lg leading-relaxed tracking-wide">
          Study Spark is a <span className="text-blue-600 font-semibold">student-focused</span> project built to make learning{" "}
          <span className="text-pink-600 font-semibold">fun</span>, <span className="text-purple-600 font-semibold">fast</span>, and{" "}
          <span className="text-green-600 font-semibold">effective</span> using artificial intelligence. We're a passionate team aiming to empower learners with tools that think and adapt just like a <span className="inline-block">🤖 human tutor!</span>
          <br />
          <br />
          Let's spark joy in learning and brighten your educational journey! <span className="text-yellow-500 text-2xl">🚀🎉📖</span>
        </p>
      </section>
    </div>
  );
};

export default Landing;
