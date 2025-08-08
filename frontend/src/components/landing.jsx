import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

const Landing = () => {
  const features = [
    {
      name: "Summarize",
      color: "text-blue-600",
      img: "/images/summarize.gif", // Replace with your custom animated image
      link: "/summarize",
    },
    {
      name: "Flashcard",
      color: "text-pink-600",
      img: "/images/flashcard.gif",
      link: "/flashcard",
    },
    {
      name: "Mindmap",
      color: "text-purple-600",
      img: "/images/mindmap.gif",
      link: "/mindmap",
    },
    {
      name: "Q/A",
      color: "text-green-600",
      img: "/images/qa.gif",
      link: "/qa",
    },
    {
      name: "Chatbot 🤖",
      color: "text-yellow-600",
      img: "/images/chatbot.gif",
      link: "/chatbot",
    },
  ];

  return (
    <div className="font-sans bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-14 px-6 border-b border-gray-200">
        <h1 className="text-4xl font-bold mb-4">Welcome to Study Spark 🔥</h1>
        <p className="text-lg max-w-3xl mx-auto text-gray-600">
          Your one-stop AI-powered learning platform to summarize textbooks,
          generate flashcards, build mind maps, ask questions, and chat with
          your learning assistant!
        </p>
      </section>

      {/* Feature Cards */}
      <section className="py-14 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              to={feature.link}
              className="w-56 h-56 bg-white rounded-xl shadow hover:shadow-2xl flex flex-col items-center justify-center transition transform hover:-translate-y-2 hover:scale-105 p-4"
            >
              <img
                src={feature.img}
                alt={feature.name}
                className="w-24 h-24 object-contain mb-4"
              />
              <span
                className={`text-lg font-semibold ${feature.color} text-center`}
              >
                {feature.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-white py-14 px-6 border-t border-b border-gray-200 text-center">
        <blockquote className="italic text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
          “Education is the passport to the future, for tomorrow belongs to
          those who prepare for it today.”
        </blockquote>
      </section>

      {/* FAQs */}
      <section className="py-14 px-6 text-center">
        <h3 className="text-2xl font-bold mb-6">FAQs</h3>
        <div className="max-w-2xl mx-auto text-left space-y-6 text-gray-700">
          <div>
            <p className="font-semibold">Q: What can Study Spark do?</p>
            <p>
              A: It summarizes notes, creates flashcards, mind maps, Q/A, and
              offers an AI chatbot assistant.
            </p>
          </div>
          <div>
            <p className="font-semibold">Q: Is it free?</p>
            <p>
              A: Basic features are free. Premium tools may be added later.
            </p>
          </div>
          <div>
            <p className="font-semibold">Q: Do I need to sign in?</p>
            <p>
              A: Yes, login is required to access personalized features and
              history.
            </p>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="bg-gray-100 py-14 px-6 text-center">
        <h3 className="text-2xl font-bold mb-6">About Us</h3>
        <p className="max-w-3xl mx-auto text-gray-700 text-lg leading-relaxed">
          Study Spark is a student-focused project built to make learning fun,
          fast, and effective using artificial intelligence. We're a passionate
          team aiming to empower learners with tools that think and adapt just
          like a human tutor!
        </p>
      </section>
    </div>
  );
};

export default Landing;
