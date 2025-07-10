'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaRegStar, FaRedo } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const emojis = [
  '🎮', '🎲', '🎯', '🎳',
  '🎨', '🧩', '🎭', '🎪',
  '🚀', '🎢', '🎡', '🎠',
  '🎪', '🎭', '🧩', '🎨',
  '🎳', '🎯', '🎲', '🎮',
];

const MemoryMatch = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize the game
  const initializeGame = useCallback(() => {
    // Shuffle emojis and create card pairs
    const shuffledEmojis = [...emojis]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10); // Use 5 pairs (10 cards)
    
    const cardPairs = [...shuffledEmojis, ...shuffledEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(cardPairs);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
  }, []);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedIndices.length === 2) {
      setIsProcessing(true);
      const [firstIndex, secondIndex] = flippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setCards(prevCards =>
          prevCards.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          )
        );
        setMatches(prev => prev + 1);
        
        if (matches + 1 === cards.length / 2) {
          setGameOver(true);
          toast.success(`You won in ${moves + 1} moves!`, { icon: '🏆' });
        } else {
          toast.success('Match found!', { icon: '🎉' });
        }
      } else {
        // No match, flip cards back after a delay
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map((card, index) =>
              index === firstIndex || index === secondIndex
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }, 1000);
      }

      setMoves(prev => prev + 1);
      setFlippedIndices([]);
      setTimeout(() => setIsProcessing(false), 1000);
    }
  }, [flippedIndices, cards, matches, moves]);

  const handleCardClick = (index: number) => {
    // Don't allow clicking if the card is already flipped, matched, or if we're processing
    if (
      isProcessing ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedIndices.length >= 2
    ) {
      return;
    }

    // Flip the card
    setCards(prevCards =>
      prevCards.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedIndices(prev => [...prev, index]);
  };

  const getStars = () => {
    if (moves < 15) return 3;
    if (moves < 25) return 2;
    return 1;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Game Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold">Moves: {moves}</div>
        <div className="flex items-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="text-yellow-400">
              {i < getStars() ? <FaStar /> : <FaRegStar />}
            </span>
          ))}
        </div>
        <button
          onClick={initializeGame}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <FaRedo className="mr-2" /> New Game
        </button>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className={`aspect-square rounded-xl flex items-center justify-center text-3xl cursor-pointer transition-all duration-300 ${card.isMatched ? 'opacity-75' : ''}`}
              onClick={() => handleCardClick(index)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateY: card.isFlipped ? 180 : 0,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{
                background: card.isFlipped
                  ? 'linear-gradient(145deg, #ffffff, #e6e6e6)'
                  : 'linear-gradient(145deg, #4f46e5, #4338ca)',
                transformStyle: 'preserve-3d',
                transform: `rotateY(${card.isFlipped ? '180deg' : '0'})`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            >
              <motion.div
                className="w-full h-full flex items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: card.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                }}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '?'}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-sm w-full mx-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              You completed the game in {moves} moves!
            </p>
            <div className="flex justify-center mb-6">
              {[...Array(3)].map((_, i) => (
                <span key={i} className="text-3xl text-yellow-400 mx-1">
                  {i < getStars() ? '★' : '☆'}
                </span>
              ))}
            </div>
            <button
              onClick={initializeGame}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Play Again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
