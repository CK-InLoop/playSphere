'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Card = {
  id: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
];

export default function ColorMatch() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize the game
  const initializeGame = useCallback(() => {
    // Create pairs of colors
    const colorPairs = [...COLORS, ...COLORS];
    
    // Shuffle the colors
    const shuffled = [...colorPairs]
      .sort(() => Math.random() - 0.5)
      .map((color, index) => ({
        id: `${color}-${index}`,
        color,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setGameComplete(false);
  }, []);

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = flippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.color === secondCard.color) {
        // Match found
        setCards(prevCards =>
          prevCards.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedIndices([]);
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map((card, index) =>
              index === firstIndex || index === secondIndex
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedIndices([]);
        }, 1000);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flippedIndices, cards]);

  // Check if game is complete
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setGameComplete(true);
    }
  }, [cards]);

  // Handle card click
  const handleCardClick = (index: number) => {
    // Don't allow clicking if:
    // - The card is already flipped or matched
    // - Two cards are already flipped
    // - The game is complete
    if (
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedIndices.length >= 2 ||
      gameComplete
    ) {
      return;
    }

    // Flip the card
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], isFlipped: true };
    setCards(newCards);
    setFlippedIndices([...flippedIndices, index]);
  };

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Color Match</h2>
        <p className="text-gray-600">Moves: {moves}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg cursor-pointer ${card.isFlipped || card.isMatched ? card.color : 'bg-gray-300'}`}
            onClick={() => handleCardClick(index)}
            initial={false}
            animate={{
              rotateY: card.isFlipped || card.isMatched ? 180 : 0,
              scale: card.isMatched ? 0.9 : 1,
            }}
            transition={{ duration: 0.3 }}
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${card.isFlipped || card.isMatched ? 180 : 0}deg)`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              {card.isFlipped || card.isMatched ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {card.color.split('-')[1]}
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {gameComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
              <h3 className="text-2xl font-bold mb-4">Congratulations! 🎉</h3>
              <p className="mb-4">You completed the game in {moves} moves!</p>
              <button
                onClick={initializeGame}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={initializeGame}
        className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
      >
        New Game
      </button>
    </div>
  );
}
