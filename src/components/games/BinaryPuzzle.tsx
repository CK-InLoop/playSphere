'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import GameLayout from './GameLayout';

type CellValue = 0 | 1 | null;
type Board = CellValue[][];

const GRID_SIZES = [6, 8, 10];
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;
type Difficulty = typeof DIFFICULTY_LEVELS[number];

const HINT_DURATION = 2000; // 2 seconds

export default function BinaryPuzzle() {
  const { updateScore } = useGame();
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [size, setSize] = useState<number>(6);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedValue, setSelectedValue] = useState<0 | 1>(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  // Generate a valid binary puzzle solution
  const generateSolution = useCallback((size: number): Board => {
    // Start with an empty board
    const newBoard: Board = Array(size).fill(null).map(() => Array(size).fill(null));
    
    // Helper function to check if a value can be placed at a position
    const isValid = (board: Board, row: number, col: number, value: 0 | 1): boolean => {
      // Check row for three in a row
      if (col >= 2) {
        if (board[row][col-1] === value && board[row][col-2] === value) return false;
      }
      if (col <= size - 3) {
        if (board[row][col+1] === value && board[row][col+2] === value) return false;
      }
      if (col > 0 && col < size - 1) {
        if (board[row][col-1] === value && board[row][col+1] === value) return false;
      }
      
      // Check column for three in a row
      if (row >= 2) {
        if (board[row-1][col] === value && board[row-2][col] === value) return false;
      }
      if (row <= size - 3) {
        if (board[row+1][col] === value && board[row+2][col] === value) return false;
      }
      if (row > 0 && row < size - 1) {
        if (board[row-1][col] === value && board[row+1][col] === value) return false;
      }
      
      // Count values in row and column
      const rowCount = board[row].filter(v => v === value).length;
      const colCount = board.map(r => r[col]).filter(v => v === value).length;
      
      // Check if we've exceeded the allowed count for this value (half the size)
      if (rowCount >= size / 2 || colCount >= size / 2) {
        return false;
      }
      
      return true;
    };
    
    // Backtracking function to fill the board
    const fillBoard = (board: Board, row: number, col: number): boolean => {
      // If we've filled all cells, check if the board is valid
      if (row === size) {
        return validateBoard(board);
      }
      
      // Calculate next cell position
      let nextRow = row;
      let nextCol = col + 1;
      if (nextCol === size) {
        nextRow++;
        nextCol = 0;
      }
      
      // Skip cells that are already filled
      if (board[row][col] !== null) {
        return fillBoard(board, nextRow, nextCol);
      }
      
      // Try both 0 and 1 in random order
      const values: (0 | 1)[] = [0, 1];
      if (Math.random() > 0.5) values.reverse();
      
      for (const value of values) {
        if (isValid(board, row, col, value)) {
          board[row][col] = value;
          
          if (fillBoard(board, nextRow, nextCol)) {
            return true;
          }
          
          // Backtrack
          board[row][col] = null;
        }
      }
      
      return false;
    };
    
    // Start with some random values to speed up the process
    const initialFills = Math.floor((size * size) * 0.3);
    for (let f = 0; f < initialFills; f++) {
      const i = Math.floor(Math.random() * size);
      const j = Math.floor(Math.random() * size);
      if (newBoard[i][j] === null) {
        const value = Math.random() > 0.5 ? 1 : 0;
        if (isValid(newBoard, i, j, value)) {
          newBoard[i][j] = value;
        }
      }
    }
    
    // Fill the rest of the board
    fillBoard(newBoard, 0, 0);
    
    return newBoard;
  }, []);

  // Create a puzzle from the solution based on difficulty
  const createPuzzle = useCallback((solution: Board, difficulty: Difficulty): Board => {
    const size = solution.length;
    const puzzle: Board = [];
    
    // Make a deep copy of the solution
    for (let i = 0; i < size; i++) {
      puzzle[i] = [];
      for (let j = 0; j < size; j++) {
        puzzle[i][j] = solution[i][j];
      }
    }
    
    // Determine how many cells to remove based on difficulty
    let cellsToRemove = 0;
    if (difficulty === 'easy') cellsToRemove = Math.floor(size * size * 0.4);
    else if (difficulty === 'medium') cellsToRemove = Math.floor(size * size * 0.6);
    else cellsToRemove = Math.floor(size * size * 0.75);
    
    // Remove cells to create the puzzle
    let removed = 0;
    while (removed < cellsToRemove) {
      const i = Math.floor(Math.random() * size);
      const j = Math.floor(Math.random() * size);
      
      if (puzzle[i][j] !== null) {
        puzzle[i][j] = null;
        removed++;
      }
    }
    
    return puzzle;
  }, []);

  // Check if the current board follows all binary puzzle rules
  const validateBoard = (board: Board): boolean => {
    const size = board.length;
    
    // Check rows
    for (let i = 0; i < size; i++) {
      // Check for three consecutive same numbers
      for (let j = 0; j < size - 2; j++) {
        if (board[i][j] !== null && board[i][j] === board[i][j + 1] && board[i][j] === board[i][j + 2]) {
          return false;
        }
      }
      
      // Check count of 0s and 1s
      const count0 = board[i].filter(cell => cell === 0).length;
      const count1 = board[i].filter(cell => cell === 1).length;
      
      if (count0 > size / 2 || count1 > size / 2) {
        return false;
      }
    }
    
    // Check columns
    for (let j = 0; j < size; j++) {
      // Check for three consecutive same numbers
      for (let i = 0; i < size - 2; i++) {
        if (board[i][j] !== null && board[i][j] === board[i + 1][j] && board[i][j] === board[i + 2][j]) {
          return false;
        }
      }
      
      // Check count of 0s and 1s
      const count0 = board.map(row => row[j]).filter(cell => cell === 0).length;
      const count1 = board.map(row => row[j]).filter(cell => cell === 1).length;
      
      if (count0 > size / 2 || count1 > size / 2) {
        return false;
      }
    }
    
    // Check for duplicate rows and columns (only if all cells are filled)
    const isComplete = board.every(row => row.every(cell => cell !== null));
    if (isComplete) {
      // Check for duplicate rows
      const rows = new Set<string>();
      for (const row of board) {
        const rowStr = row.join('');
        if (rows.has(rowStr)) return false;
        rows.add(rowStr);
      }
      
      // Check for duplicate columns
      const cols = new Set<string>();
      for (let j = 0; j < size; j++) {
        const colStr = board.map(row => row[j]).join('');
        if (cols.has(colStr)) return false;
        cols.add(colStr);
      }
    }
    
    return true;
  };

  // Check if the board is completely filled
  const isBoardComplete = (board: Board): boolean => {
    return board.every(row => row.every(cell => cell !== null));
  };

  // Initialize a new game
  const initializeGame = useCallback(() => {
    const sol = generateSolution(size);
    const puzzle = createPuzzle(sol, difficulty);
    
    setSolution(sol);
    setBoard(JSON.parse(JSON.stringify(puzzle)));
    setIsComplete(false);
    setMistakes(0);
    setHint(null);
  }, [size, difficulty, generateSolution, createPuzzle]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // Allow clicking only on empty cells when game is not complete
    if (isComplete || board[row][col] !== null) return;
    
    const newBoard = board.map(r => [...r]);
    
    // Place the selected value (0 or 1)
    newBoard[row][col] = selectedValue;
    setBoard(newBoard);
    
    // Check if the move is correct
    if (newBoard[row][col] !== solution[row][col]) {
      setMistakes(prev => {
        const newMistakes = prev + 1;
        if (newMistakes >= 3) {
          setHint('Too many mistakes! Try again.');
          setTimeout(initializeGame, HINT_DURATION);
        } else {
          setHint('Incorrect move!');
          setTimeout(() => setHint(null), HINT_DURATION);
        }
        return newMistakes;
      });
      return;
    }
    
    // Check if the board is complete and valid
    if (isBoardComplete(newBoard) && validateBoard(newBoard)) {
      const pointsEarned = calculatePoints();
      const newScore = score + pointsEarned;
      setScore(newScore);
      
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('binaryPuzzleHighScore', newScore.toString());
        updateScore('binary-puzzle', newScore, 'highScore');
      }
      
      updateScore('binary-puzzle', pointsEarned, 'score');
      setIsComplete(true);
      setHint('Puzzle complete! Well done!');
    }
  };

  // Calculate points based on size and difficulty
  const calculatePoints = (): number => {
    let basePoints = size * 10; // More points for larger grids
    
    // Adjust for difficulty
    if (difficulty === 'easy') basePoints *= 1;
    else if (difficulty === 'medium') basePoints *= 1.5;
    else basePoints *= 2;
    
    // Penalty for mistakes
    const penalty = mistakes * 5;
    
    return Math.max(10, Math.floor(basePoints - penalty));
  };

  // Get a hint for the player
  const getHint = () => {
    // Find an empty cell and show its correct value
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j] === null) {
          setHint(`Try ${solution[i][j]} at row ${i + 1}, column ${j + 1}`);
          setTimeout(() => setHint(null), HINT_DURATION);
          return;
        }
      }
    }
    
    setHint('No empty cells to hint!');
    setTimeout(() => setHint(null), HINT_DURATION);
  };

  // Toggle showing the solution
  const toggleSolution = () => {
    setShowSolution(prev => !prev);
  };

  // Initialize the game on mount and when settings change
  useEffect(() => {
    initializeGame();
    
    // Load high score
    const savedHighScore = localStorage.getItem('binaryPuzzleHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, [initializeGame]);

  // Render the game board
  const renderBoard = () => {
    const currentBoard = showSolution ? solution : board;
    
    return (
      <div 
        className={`grid gap-1 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg`}
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto'
        }}
      >
        {currentBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <motion.button
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square flex items-center justify-center text-xl font-bold
                ${rowIndex % 2 === colIndex % 2 
                  ? 'bg-white dark:bg-gray-600' 
                  : 'bg-gray-100 dark:bg-gray-700'}
                ${board[rowIndex][colIndex] === null ? 'cursor-pointer' : 'cursor-default'}
                ${showSolution ? 'opacity-70' : ''}
                border border-gray-300 dark:border-gray-600
                transition-colors duration-200
                ${!showSolution && board[rowIndex][colIndex] === 0 ? 'text-blue-600 dark:text-blue-300' : ''}
                ${!showSolution && board[rowIndex][colIndex] === 1 ? 'text-red-600 dark:text-red-300' : ''}
              `}
              onClick={() => !showSolution && handleCellClick(rowIndex, colIndex)}
              whileHover={{ scale: showSolution ? 1 : 1.05 }}
              whileTap={{ scale: showSolution ? 1 : 0.95 }}
              disabled={showSolution || board[rowIndex][colIndex] !== null}
            >
              {cell !== null ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {cell}
                </motion.span>
              ) : null}
            </motion.button>
          ))
        )}
      </div>
    );
  };

  // Render the control panel
  const renderControls = () => (
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            selectedValue === 0 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setSelectedValue(0)}
        >
          0
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            selectedValue === 1 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setSelectedValue(1)}
        >
          1
        </button>
      </div>
      
      <div className="flex gap-2">
        <select
          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          disabled={!isComplete}
        >
          {GRID_SIZES.map(s => (
            <option key={s} value={s}>{s}x{s} Grid</option>
          ))}
        </select>
        
        <select
          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          disabled={!isComplete}
        >
          {DIFFICULTY_LEVELS.map(d => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          onClick={getHint}
          disabled={isComplete || showSolution}
        >
          Hint
        </button>
        
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          onClick={initializeGame}
        >
          New Game
        </button>
        
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            showSolution 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={toggleSolution}
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
      </div>
    </div>
  );

  return (
    <GameLayout
      title="Binary Puzzle"
      description="Fill the grid with 0s and 1s following the rules"
      score={score}
      highScore={highScore}
      onRestart={initializeGame}
    >
      <div className="w-full max-w-4xl mx-auto">
        {/* Game Info */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <div className="text-lg font-semibold">
            Difficulty: <span className="capitalize">{difficulty}</span>
          </div>
          <div className="text-lg">
            Mistakes: {mistakes}/3
          </div>
          <div className="text-lg">
            Selected: <span className="font-bold">{selectedValue}</span>
          </div>
        </div>
        
        {/* Controls */}
        {renderControls()}
        
        {/* Game Board */}
        <div className="mb-6">
          {renderBoard()}
        </div>
        
        {/* Hint */}
        {hint && (
          <motion.div 
            className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {hint}
          </motion.div>
        )}
        
        {/* Game Rules */}
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">How to Play:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Fill the grid with 0s and 1s</li>
            <li>Each row and column must have an equal number of 0s and 1s</li>
            <li>No more than two identical numbers next to or below each other</li>
            <li>Each row and column must be unique</li>
            <li>Select 0 or 1, then click on an empty cell to place it</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}