import React, { useState } from 'react';

const QA = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async () => {
    // Simulate API call
    setAnswer(`Answer to: "${question}"`);
  };

  return (
    <div className="qa-container">
      <h2>Ask a Question</h2>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question..."
      />
      <button onClick={handleSubmit}>Get Answer</button>
      {answer && <p className="answer">{answer}</p>}
    </div>
  );
};

export default QA;
