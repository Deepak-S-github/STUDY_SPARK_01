import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

const Landing = () => {
  return (
    <div className="font-sans bg-gray-50 text-gray-800">

      {/* Description */}
      <section className="text-center py-10 px-4">
        <h2 className="text-3xl font-semibold mb-4">Welcome to Study Spark 🔥</h2>
        <p className="text-lg max-w-3xl mx-auto text-gray-600">
          Your one-stop AI-powered learning platform to summarize textbooks, generate flashcards, build mind maps, ask questions, and chat with your learning assistant!
        </p>
      </section>

      {/* Feature Cards */}
      <section className="py-10 px-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        <Link
          to="/summarize"
          className="w-52 h-40 bg-white rounded-xl shadow hover:shadow-xl cursor-pointer flex items-center justify-center text-lg text-blue-600 font-semibold hover:scale-105 transition"
        >
          Summarize
        </Link>
        <Link
          to="/flashcard"
          className="w-52 h-40 bg-white rounded-xl shadow hover:shadow-xl cursor-pointer flex items-center justify-center text-lg text-pink-600 font-semibold hover:scale-105 transition"
        >
          Flashcard
        </Link>
        <Link
          to="/mindmap"
          className="w-52 h-40 bg-white rounded-xl shadow hover:shadow-xl cursor-pointer flex items-center justify-center text-lg text-purple-600 font-semibold hover:scale-105 transition"
        >
          Mindmap
        </Link>
        <Link
          to="/qa"
          className="w-52 h-40 bg-white rounded-xl shadow hover:shadow-xl cursor-pointer flex items-center justify-center text-lg text-green-600 font-semibold hover:scale-105 transition"
        >
          Q/A
        </Link>
        <Link
          to="/chatbot"
          className="w-52 h-40 bg-white rounded-xl shadow hover:shadow-xl cursor-pointer flex items-center justify-center text-lg text-yellow-600 font-semibold hover:scale-105 transition"
        >
          Chatbot 🤖
        </Link>
      </section>

      {/* Quote & FAQs */}
      <section className="bg-white py-10 px-6 text-center">
        <blockquote className="italic text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
          “Education is the passport to the future, for tomorrow belongs to those who prepare for it today.”
        </blockquote>

        <h3 className="text-2xl font-bold mb-4">FAQs</h3>
        <div className="max-w-2xl mx-auto text-left space-y-4 text-gray-700">
          <div>
            <p className="font-semibold">Q: What can Study Spark do?</p>
            <p>A: It summarizes notes, creates flashcards, mind maps, Q/A, and offers an AI chatbot assistant.</p>
          </div>
          <div>
            <p className="font-semibold">Q: Is it free?</p>
            <p>A: Basic features are free. Premium tools may be added later.</p>
          </div>
          <div>
            <p className="font-semibold">Q: Do I need to sign in?</p>
            <p>A: Yes, login is required to access personalized features and history.</p>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="bg-gray-100 py-10 px-6 text-center">
        <h3 className="text-2xl font-bold mb-4">About Us</h3>
        <p className="max-w-3xl mx-auto text-gray-700 text-lg">
          Study Spark is a student-focused project built to make learning fun, fast, and effective using artificial intelligence. We're a passionate team aiming to empower learners with tools that think and adapt just like a human tutor!
        </p>
      </section>
    </div>
  );
};

export default Landing;
