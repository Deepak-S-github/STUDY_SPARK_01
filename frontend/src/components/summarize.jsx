import React, { useState } from 'react';

const Summarize = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');

  const handleSummarize = async () => {
    // Simulate summarization
    setSummary(`Summary: ${text.slice(0, 100)}...`);
  };

  return (
    <div className="summarize-container">
      <h2>Text Summarizer</h2>
      <textarea
        rows="6"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here..."
      />
      <button onClick={handleSummarize}>Summarize</button>
      {summary && <p className="summary">{summary}</p>}
    </div>
  );
};

export default Summarize;
