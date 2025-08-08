import React, { useState, useRef, useEffect } from 'react';

const TeachBackChat = () => {
  const [concept, setConcept] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('ask');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const api = 'http://localhost:3001';

  const addBotMessage = (text) =>
    setMessages((m) => [...m, { type: 'bot', text, id: Date.now() }]);
  const addUserMessage = (text) =>
    setMessages((m) => [...m, { type: 'user', text, id: Date.now() }]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    addUserMessage(userText);
    setLoading(true);

    try {
      if (step === 'ask') {
        setConcept(userText);
        const res = await fetch(`${api}/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concept: userText }),
        });
        const data = await res.json();
        addBotMessage(data.response);
        setStep('explain');
      } else if (step === 'explain') {
        const res = await fetch(`${api}/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concept, userAnswer: userText }),
        });
        const data = await res.json();
        addBotMessage(data.response);
        setStep('feedback');
      }
    } catch (err) {
      addBotMessage('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setConcept('');
    setMessages([]);
    setInput('');
    setStep('ask');
  };

  const handleUnderstood = async () => {
    try {
      await fetch(`${api}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept }),
      });
      addBotMessage('Conversation saved. Great job!');
    } catch (err) {
      console.error('Failed to save conversation:', err);
    }
  };

  return (
    <div className="w-full min-h-screen pt-20 bg-gradient-to-br from-[#f2f3f7] to-[#e8edf5] font-poppi flex flex-col">
      
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'bot' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[75%] whitespace-pre-wrap text-sm sm:text-base shadow-md animate-fadeIn ${
                msg.type === 'bot'
                  ? 'bg-white text-gray-900 border border-gray-200'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/90 text-gray-500 px-4 py-2 rounded-xl animate-pulse shadow">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Feedback buttons */}
      {step === 'feedback' && (
        <div className="px-4 py-3 flex flex-wrap gap-3 justify-center bg-white border-t shadow-inner">
          <button
            onClick={() => {
              setStep('explain');
              addBotMessage('Try explaining it again:');
            }}
            className="px-5 py-2 rounded-full bg-yellow-400 text-white hover:bg-yellow-500 transition transform hover:scale-105 shadow"
          >
            Need More Practice
          </button>
          <button
            onClick={handleUnderstood}
            className="px-5 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition transform hover:scale-105 shadow"
          >
            I Understood
          </button>
          <button
            onClick={handleStartOver}
            className="px-5 py-2 rounded-full bg-gray-400 text-white hover:bg-gray-500 transition transform hover:scale-105 shadow"
          >
            Start New Concept
          </button>
        </div>
      )}

      {/* Input box */}
      {step !== 'feedback' && (
        <div className="sticky bottom-0 z-10 bg-white border-t shadow-inner px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            placeholder={
              step === 'ask'
                ? 'Enter a concept to learn...'
                : 'Explain it in your words...'
            }
            className="flex-1 p-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-2 rounded-full text-white font-semibold bg-blue-600 hover:bg-blue-700 transition duration-200 shadow hover:scale-105"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default TeachBackChat;
