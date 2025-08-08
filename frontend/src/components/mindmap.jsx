import React, { useState } from 'react';

const MindMap = () => {
  const [topic, setTopic] = useState('');
  const [nodes, setNodes] = useState([]);

  const handleGenerate = () => {
    // Dummy data
    setNodes([
      `${topic} - Subtopic 1`,
      `${topic} - Subtopic 2`,
      `${topic} - Subtopic 3`
    ]);
  };

  return (
    <div className="mindmap-container">
      <h2>Mind Map Generator</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic"
      />
      <button onClick={handleGenerate}>Generate</button>
      <ul>
        {nodes.map((node, i) => (
          <li key={i}>{node}</li>
        ))}
      </ul>
    </div>
  );
};

export default MindMap;
