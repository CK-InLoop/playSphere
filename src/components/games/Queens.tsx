'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import GameLayout from './GameLayout';

type CellValue = 'queen' | 'blocked' | null;
type Board = CellValue[][];

const GRID_SIZE = 8;
const CROWN_EMOJI = '👑';
const BLOCKED_EMOJI = '❌';

export default function Queens() {
  const { updateScore } = useGame();
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  // Initialize the board
  const initializeBoard = useCallback(() => {
    const newBoard: Board = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null)
    );
    
    // Add some pre-placed queens (fewer as levels increase)
    const queensToPlace = Math.max(1, 4 - Math.floor(level / 3));
    let placedQueens = 0;
    
    while (placedQueens < queensToPlace) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      
      if (newBoard[row][col] === null && !isUnderAttack(newBoard, row, col)) {
        newBoard[row][col] = 'queen';
        placedQueens++;
      }
    }
    
    setBoard(newBoard);
    setMoves(0);
    setIsComplete(false);
    setHint(null);
  }, [level]);

  // Check if a cell is under attack
  const isUnderAttack = (board: Board, row: number, col: number): boolean => {
    // Check row and column
    for (let i = 0; i < GRID_SIZE; i++) {
      if ((board[row][i] === 'queen' && i !== col) || 
          (board[i][col] === 'queen' && i !== row)) {
        return true;
      }
    }
    
    // Check diagonals
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 'queen' && i !== row && j !== col && 
            (Math.abs(i - row) === Math.abs(j - col))) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (isComplete || board[row][col] === 'blocked') return;
    
    const newBoard = [...board];
    
    if (newBoard[row][col] === 'queen') {
      newBoard[row][col] = null;
    } else {
      // Check if placing a queen here would be valid
      if (isUnderAttack(newBoard, row, col)) {
        setHint('A queen here would be under attack!');
        setTimeout(() => setHint(null), 2000);
        return;
      }
      newBoard[row][col] = 'queen';
    }
    
    setBoard(newBoard);
    setMoves(prev => prev + 1);
    
    // Check if the board is complete
    if (isBoardComplete(newBoard)) {
      const pointsEarned = calculatePoints();
      const newScore = score + pointsEarned;
      setScore(newScore);
      
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('queensHighScore', newScore.toString());
        updateScore('queens', newScore, 'highScore');
      }
      
      updateScore('queens', pointsEarned, 'score');
      setIsComplete(true);
    }
  };

  // Check if the board is complete (all queens placed correctly)
  const isBoardComplete = (board: Board): boolean => {
    let queenCount = 0;
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 'queen') {
          queenCount++;
          if (isUnderAttack(board, i, j)) {
            return false;
          }
        }
      }
    }
    
    return queenCount === GRID_SIZE;
  };

  // Calculate points based on moves and level
  const calculatePoints = (): number => {
    const basePoints = 100 * level;
    const movePenalty = Math.min(50, moves * 5);
    return Math.max(10, basePoints - movePenalty);
  };

  // Get hint
  const getHint = () => {
    const emptyCells: [number, number][] = [];
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === null && !isUnderAttack(board, i, j)) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      setHint(`Try placing a queen at row ${row + 1}, column ${col + 1}`);
      setTimeout(() => setHint(null), 3000);
    } else {
      setHint('No safe moves! Try removing some queens.');
      setTimeout(() => setHint(null), 2000);
    }
  };

  // Start a new level
  const nextLevel = () => {
    setLevel(prev => prev + 1);
    initializeBoard();
  };

  // Reset the current level
  const resetLevel = () => {
    initializeBoard();
  };

  // Initialize the game
  useEffect(() => {
    initializeBoard();
    
    // Load high score
    const savedHighScore = localStorage.getItem('queensHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, [initializeBoard]);

  // Render the board
  const renderBoard = () => {
    return (
      <div className="grid grid-cols-8 gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xl cursor-pointer
                ${rowIndex % 2 === colIndex % 2 
                  ? 'bg-white dark:bg-gray-600' 
                  : 'bg-gray-100 dark:bg-gray-800'}
                ${cell === 'blocked' ? 'bg-red-100 dark:bg-red-900' : ''}
                rounded-sm select-none
              `}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {cell === 'queen' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="drop-shadow-sm"
                >
                  {CROWN_EMOJI}
                </motion.span>
              )}
              {cell === 'blocked' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="opacity-70"
                >
                  {BLOCKED_EMOJI}
                </motion.span>
              )}
            </motion.div>
          ))
        )}
      </div>
    );
  };

  return (
    <GameLayout
      title="Queens"
      description="Place queens so that none can attack each other"
      score={score}
      highScore={highScore}
      onRestart={resetLevel}
    >
      <div className="flex flex-col items-center">
        {/* Game Info */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="text-lg font-semibold">Level: {level}</div>
          <div className="text-lg">Moves: {moves}</div>
        </div>
        
        {/* Game Board */}
        <div className="mb-6">
          {renderBoard()}
        </div>
        
        {/* Hint */}
        {hint && (
          <motion.div 
            className="mb-4 p-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {hint}
          </motion.div>
        )}
        
        {/* Controls */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={getHint}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={isComplete}
          >
            Get Hint
          </button>
          <button
            onClick={resetLevel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset Level
          </button>
        </div>
        
        {/* Level Complete */}
        <AnimatePresence>
          {isComplete && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <h3 className="text-2xl font-bold mb-2">Level Complete!</h3>
                <p className="mb-4">You earned {calculatePoints()} points</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={nextLevel}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Next Level
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}