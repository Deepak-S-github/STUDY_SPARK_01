import React, { useState } from 'react';

const Flashcard = () => {
  const cards = [
    { question: 'What is React?', answer: 'A JavaScript library for building UIs.' },
    { question: 'What is a component?', answer: 'Reusable pieces of UI in React.' }
  ];

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleNext = () => {
    setFlipped(false);
    setIndex((index + 1) % cards.length);
  };

  return (
    <div className="flashcard-container">
      <h2>Flashcards</h2>
      <div className="flashcard" onClick={() => setFlipped(!flipped)}>
        {flipped ? cards[index].answer : cards[index].question}
      </div>
      <button onClick={handleNext}>Next</button>
    </div>
  );
};

export default Flashcard;
