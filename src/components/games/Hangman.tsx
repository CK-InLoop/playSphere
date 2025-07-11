'use client';

import { useState, useEffect, useCallback } from 'react';
import GameLayout from './GameLayout';
import { motion } from 'framer-motion';

// List of words for the game
const WORDS = [
  'REACT', 'JAVASCRIPT', 'TYPESCRIPT', 'DEVELOPER', 'PROGRAMMING',
  'HANGMAN', 'KEYBOARD', 'MONITOR', 'COMPUTER', 'ALGORITHM',
  'FUNCTION', 'VARIABLE', 'COMPONENT', 'INTERFACE', 'PROPERTIES'
];

// Maximum number of incorrect guesses allowed
const MAX_WRONG_GUESSES = 6;

// Hangman drawing parts in order of appearance
const HANGMAN_PARTS = [
  // Base
  <line key="base" x1="60" y1="180" x2="240" y2="180" stroke="currentColor" strokeWidth="4" />,
  // Pole
  <line key="pole" x1="100" y1="180" x2="100" y2="20" stroke="currentColor" strokeWidth="4" />,
  // Top
  <line key="top" x1="100" y1="20" x2="200" y2="20" stroke="currentColor" strokeWidth="4" />,
  // Rope
  <line key="rope" x1="200" y1="20" x2="200" y2="40" stroke="currentColor" strokeWidth="2" />,
  // Head
  <circle key="head" cx="200" cy="60" r="20" stroke="currentColor" strokeWidth="2" fill="none" />,
  // Body
  <line key="body" x1="200" y1="80" x2="200" y2="130" stroke="currentColor" strokeWidth="2" />,
  // Left arm
  <line key="left-arm" x1="200" y1="100" x2="170" y2="90" stroke="currentColor" strokeWidth="2" />,
  // Right arm
  <line key="right-arm" x1="200" y1="100" x2="230" y2="90" stroke="currentColor" strokeWidth="2" />,
  // Left leg
  <line key="left-leg" x1="200" y1="130" x2="170" y2="160" stroke="currentColor" strokeWidth="2" />,
  // Right leg
  <line key="right-leg" x1="200" y1="130" x2="230" y2="160" stroke="currentColor" strokeWidth="2" />,
];

export default function Hangman() {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  // Initialize or reset the game
  const initGame = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(randomWord);
    setGuessedLetters([]);
    setGameStatus('playing');
  }, []);

  // Initialize game on component mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Calculate game state
  const wrongGuesses = guessedLetters.filter(letter => !word.includes(letter));
  const remainingGuesses = MAX_WRONG_GUESSES - wrongGuesses.length;
  const isGameOver = gameStatus !== 'playing';

  // Check win/lose conditions
  useEffect(() => {
    if (gameStatus === 'playing') {
      // Check for win
      const isWon = word.split('').every(letter => guessedLetters.includes(letter));
      if (isWon) {
        setGameStatus('won');
        return;
      }

      // Check for loss
      if (remainingGuesses <= 0) {
        setGameStatus('lost');
      }
    }
  }, [guessedLetters, word, gameStatus, remainingGuesses]);

  // Handle letter guess
  const handleGuess = (letter: string) => {
    if (isGameOver || guessedLetters.includes(letter)) return;
    
    setGuessedLetters([...guessedLetters, letter]);
  };

  // Render the word with blanks for unguessed letters
  const renderWord = () => {
    return word.split('').map((letter, index) => (
      <span 
        key={index} 
        className="inline-block w-8 h-10 mx-1 text-2xl font-bold text-center border-b-2 border-gray-300 dark:border-gray-600"
      >
        {guessedLetters.includes(letter) ? letter : ''}
      </span>
    ));
  };

  // Render keyboard
  const renderKeyboard = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-md mx-auto">
        {letters.map(letter => {
          const isGuessed = guessedLetters.includes(letter);
          const isWrong = isGuessed && !word.includes(letter);
          const isCorrect = isGuessed && word.includes(letter);
          
          let buttonClass = 'w-10 h-10 rounded-md flex items-center justify-center font-medium ';
          
          if (isWrong) {
            buttonClass += 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
          } else if (isCorrect) {
            buttonClass += 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
          } else if (isGameOver) {
            buttonClass += 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed';
          } else {
            buttonClass += 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
          }
          
          return (
            <button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={isGuessed || isGameOver}
              className={buttonClass}
            >
              {letter}
            </button>
          );
        })}
      </div>
    );
  };

  // Render hangman figure
  const renderHangman = () => {
    const partsToShow = HANGMAN_PARTS.slice(0, 
      MAX_WRONG_GUESSES - remainingGuesses + 4
    );
    
    return (
      <div className="w-full max-w-xs mx-auto my-6">
        <svg 
          viewBox="0 0 260 200" 
          className="w-full h-auto"
          style={{ maxHeight: '200px' }}
        >
          {partsToShow}
        </svg>
        <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
          {remainingGuesses} {remainingGuesses === 1 ? 'guess' : 'guesses'} remaining
        </div>
      </div>
    );
  };

  // Game over message
  const renderGameOver = () => {
    if (gameStatus === 'won') {
      return (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center"
        >
          <h3 className="text-xl font-bold mb-2">Congratulations! You won! 🎉</h3>
          <p>The word was: <span className="font-bold">{word}</span></p>
          <button
            onClick={initGame}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      );
    }
    
    if (gameStatus === 'lost') {
      return (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-center"
        >
          <h3 className="text-xl font-bold mb-2">Game Over! 😢</h3>
          <p>The word was: <span className="font-bold">{word}</span></p>
          <button
            onClick={initGame}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      );
    }
    
    return null;
  };

  return (
    <GameLayout
      title="Hangman"
      description="Guess the hidden word before the hangman is complete!"
      instructions="Type letters or click the on-screen keyboard to guess the word. You have 6 incorrect guesses before the game is over."
    >
      <div className="text-center">
        {renderHangman()}
        
        <div className="my-8 min-h-12 flex justify-center items-center">
          {word && renderWord()}
        </div>
        
        {renderKeyboard()}
        {renderGameOver()}
        
        {!isGameOver && (
          <button
            onClick={initGame}
            className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            New Game
          </button>
        )}
      </div>
    </GameLayout>
  );
}
