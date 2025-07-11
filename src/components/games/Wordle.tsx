'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import GameLayout from './GameLayout';

// List of 5-letter words for the game
const WORDS = [
  'REACT', 'WORLD', 'HELLO', 'GAMES', 'LEARN', 'CRANE', 'ADIEU', 'AUDIO',
  'ABOUT', 'ABOVE', 'AGENT', 'AGREE', 'ALERT', 'AMONG', 'ANGER', 'ANGLE',
  'APPLE', 'AWARD', 'BEACH', 'BEGIN', 'BLACK', 'BLAME', 'BLIND', 'BLOCK',
  'BLOOD', 'BOARD', 'BRAIN', 'BRAND', 'BREAD', 'BREAK', 'BRICK', 'BROWN',
  'BUYER', 'CARRY', 'CATCH', 'CHAIR', 'CHART', 'CHEAP', 'CHECK', 'CHEST',
  'CHIEF', 'CHILD', 'CHINA', 'CLEAN', 'CLEAR', 'CLOCK', 'CLOSE', 'COACH'
];

type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'active';

interface TileProps {
  letter: string;
  state: LetterState;
  position?: number;
  isActive?: boolean;
}

const Tile = ({ letter, state, position, isActive = false }: TileProps) => {
  const baseStyles = 'w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-md border-2 transition-all duration-200';
  
  const stateStyles = {
    empty: 'border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600',
    active: 'border-blue-500 bg-white dark:bg-gray-800',
    correct: 'bg-green-500 text-white border-green-500',
    present: 'bg-yellow-500 text-white border-yellow-500',
    absent: 'bg-gray-500 text-white border-gray-500 dark:bg-gray-600 dark:border-gray-600',
  };

  return (
    <motion.div
      className={`${baseStyles} ${stateStyles[state]} ${isActive ? 'scale-105' : ''}`}
      initial={false}
      animate={{
        scale: isActive ? [1, 1.1, 1] : 1,
        rotate: state === 'correct' ? [0, 10, -10, 0] : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      {letter}
    </motion.div>
  );
};
const Wordle = () => {
  const { updateScore } = useGame();
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState('');
  const [shakeRow, setShakeRow] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize the game
  const initGame = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomWord);
    setGuesses(Array(6).fill(''));
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
    setMessage('');
    setShakeRow(-1);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initGame();
    // Focus the hidden input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [initGame]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;

    const key = e.key.toUpperCase();
    
    // Handle letter input
    if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
      // Update the current guess in the guesses array
      setGuesses(prevGuesses => {
        const currentRow = prevGuesses.findIndex(g => g === '');
        if (currentRow === -1) return prevGuesses;
        const newGuesses = [...prevGuesses];
        newGuesses[currentRow] = currentGuess + key;
        return newGuesses;
      });
      return;
    }

    // Handle backspace
    if ((key === 'BACKSPACE' || key === 'DELETE') && currentGuess.length > 0) {
      const newGuess = currentGuess.slice(0, -1);
      setCurrentGuess(newGuess);
      // Update the current guess in the guesses array
      setGuesses(prevGuesses => {
        const currentRow = prevGuesses.findIndex(g => g === '');
        if (currentRow === -1) return prevGuesses;
        const newGuesses = [...prevGuesses];
        newGuesses[currentRow] = newGuess;
        return newGuesses;
      });
      return;
    }

    // Handle enter
    if (key === 'ENTER' && currentGuess.length === 5) {
      submitGuess();
      return;
    }
  }, [currentGuess, gameOver]);

  // Submit the current guess
  const submitGuess = useCallback(() => {
    if (currentGuess.length !== 5) {
      // Shake animation for invalid guess
      setShakeRow(guesses.findIndex(g => g === ''));
      setTimeout(() => setShakeRow(-1), 500);
      setMessage('Word must be 5 letters');
      return;
    }

    if (!WORDS.includes(currentGuess)) {
      // Shake animation for invalid word
      setShakeRow(guesses.findIndex(g => g === ''));
      setTimeout(() => setShakeRow(-1), 500);
      setMessage('Not in word list');
      return;
    }

    const newGuesses = [...guesses];
    const currentRow = newGuesses.findIndex(g => g === '');
    
    if (currentRow === -1) return; // Shouldn't happen

    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);
    setCurrentGuess('');
    setMessage('');

    // Check for win/lose
    if (currentGuess === targetWord) {
      setGameOver(true);
      setGameWon(true);
      updateScore('wordle', 100 * (6 - currentRow), 'highScore');
      setMessage(`You won! The word was ${targetWord}`);
    } else if (currentRow === 5) {
      setGameOver(true);
      updateScore('wordle', 0, 'highScore');
      setMessage(`Game Over! The word was ${targetWord}`);
    }
  }, [currentGuess, guesses, targetWord, updateScore]);

  // Get the state of a letter in a guess
  const getLetterState = (rowIndex: number, colIndex: number): LetterState => {
    const guess = guesses[rowIndex];
    if (!guess) return 'empty';
    if (colIndex >= guess.length) return 'empty';

    const letter = guess[colIndex];
    const isCorrect = targetWord[colIndex] === letter;
    const isPresent = !isCorrect && targetWord.includes(letter);
    
    if (isCorrect) return 'correct';
    if (isPresent) return 'present';
    return 'absent';
  };

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDownWrapper = (e: KeyboardEvent) => {
      // Prevent default only for keys we handle
      if (['Backspace', 'Delete', 'Enter', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')].includes(e.key)) {
        e.preventDefault();
      }
      handleKeyDown(e);
    };
    
    window.addEventListener('keydown', handleKeyDownWrapper);
    return () => window.removeEventListener('keydown', handleKeyDownWrapper);
  }, [handleKeyDown]);

  // Render the game board
  return (
    <GameLayout
      title="Wordle"
      description="Guess the 5-letter word"
      instructions="Type a 5-letter word and press Enter. Green = correct letter & position, Yellow = correct letter wrong position, Gray = letter not in word."
    >
      <div 
        className="flex flex-col items-center"
        onClick={() => {
          // Focus the hidden input when clicking anywhere in the game area
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        {/* Hidden input for mobile keyboard support */}
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className="opacity-0 absolute h-0 w-0"
          value={currentGuess}
          onChange={(e) => {
            // Handle mobile keyboard input
            const value = e.target.value.toUpperCase();
            if (/^[A-Z]*$/.test(value) && value.length <= 5) {
              setCurrentGuess(value);
              // Update the current guess in the guesses array
              setGuesses(prevGuesses => {
                const currentRow = prevGuesses.findIndex(g => g === '');
                if (currentRow === -1) return prevGuesses;
                const newGuesses = [...prevGuesses];
                newGuesses[currentRow] = value;
                return newGuesses;
              });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentGuess.length === 5) {
              e.preventDefault();
              submitGuess();
            } else if (e.key === 'Backspace' && currentGuess.length > 0) {
              const newGuess = currentGuess.slice(0, -1);
              setCurrentGuess(newGuess);
              // Update the current guess in the guesses array
              setGuesses(prevGuesses => {
                const currentRow = prevGuesses.findIndex(g => g === '');
                if (currentRow === -1) return prevGuesses;
                const newGuesses = [...prevGuesses];
                newGuesses[currentRow] = newGuess;
                return newGuesses;
              });
            }
          }}
        />

        {/* Game board */}
        <div className="grid grid-rows-6 gap-2 mb-6">
          {Array(6).fill(0).map((_, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.findIndex(g => g === '') && !gameOver;
            const isShaking = shakeRow === rowIndex;
            
            return (
              <motion.div 
                key={rowIndex} 
                className="grid grid-cols-5 gap-2"
                animate={isShaking ? { x: [0, -10, 10, -10, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {Array(5).fill(0).map((_, colIndex) => {
                  const isCurrentRow = rowIndex === guesses.findIndex(g => g === '');
                  const isActive = isCurrentRow && colIndex === currentGuess.length;
                  const letter = isCurrentRow && colIndex < currentGuess.length 
                    ? currentGuess[colIndex] 
                    : guesses[rowIndex]?.[colIndex] || '';
                  
                  // Determine the state of the tile
                  let state: LetterState = 'empty';
                  if (isCurrentRow) {
                    state = colIndex < currentGuess.length ? 'active' : 'empty';
                  } else if (guesses[rowIndex]) {
                    state = getLetterState(rowIndex, colIndex);
                  }
                  
                  return (
                    <Tile
                      key={colIndex}
                      letter={letter}
                      state={state}
                      position={colIndex}
                      isActive={isActive}
                    />
                  );
                })}
              </motion.div>
            );
          })}
        </div>

        {/* Message display */}
        {message && (
          <motion.p 
            className={`text-lg font-medium mb-4 ${gameWon ? 'text-green-500' : 'text-red-500'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message}
          </motion.p>
        )}

        {/* Keyboard */}
        <div className="mt-4 flex flex-col gap-2">
          {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {rowIndex === 2 && <div className="w-6" />}
              {row.split('').map((key) => {
                // Check if the key is in the correct position in any guess
                const isCorrect = guesses.some(guess => {
                  const index = guess.indexOf(key);
                  return index !== -1 && targetWord[index] === key;
                });
                
                // Check if the key is present but in wrong position
                const isPresent = !isCorrect && guesses.some(guess => 
                  guess.includes(key) && targetWord.includes(key)
                );
                
                // Check if the key is absent in all guesses
                const isAbsent = guesses.some(guess => 
                  guess.includes(key) && !targetWord.includes(key)
                );
                
                let state: LetterState = 'empty';
                if (isCorrect) state = 'correct';
                else if (isPresent) state = 'present';
                else if (isAbsent) state = 'absent';
                
                return (
                  <motion.button
                    key={key}
                    className={`w-8 h-10 flex items-center justify-center rounded-md font-medium ${
                      state === 'correct' ? 'bg-green-500 text-white' :
                      state === 'present' ? 'bg-yellow-500 text-white' :
                      state === 'absent' ? 'bg-gray-500 text-white dark:bg-gray-600' :
                      'bg-gray-200 dark:bg-gray-700'
                    }`}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (gameOver) return;
                      if (key === 'ENTER') {
                        submitGuess();
                      } else if (key === '⌫') {
                        setCurrentGuess(prev => prev.slice(0, -1));
                      } else if (currentGuess.length < 5) {
                        setCurrentGuess(prev => prev + key);
                      }
                    }}
                  >
                    {key === '⌫' ? '⌫' : key}
                  </motion.button>
                );
              })}
              {rowIndex === 2 && (
                <motion.button
                  className="w-16 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md font-medium"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (gameOver) return;
                    setCurrentGuess(prev => prev.slice(0, -1));
                  }}
                >
                  ⌫
                </motion.button>
              )}
            </div>
          ))}
          <div className="flex justify-center mt-2">
            <motion.button
              className="px-6 py-2 bg-blue-500 text-white rounded-md font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (gameOver) {
                  initGame();
                } else {
                  submitGuess();
                }
              }}
            >
              {gameOver ? 'New Game' : 'Enter'}
            </motion.button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default Wordle;
