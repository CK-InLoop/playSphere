'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface BaseTile {
  value: number;
  id: number;
  isNew: boolean;
}

interface MergedTile extends BaseTile {
  mergedFrom: number[];
}

interface RegularTile extends BaseTile {
  mergedFrom: null;
}

type Tile = RegularTile | MergedTile;

type Position = {
  x: number;
  y: number;
};

type Grid = Tile[][];

const GRID_SIZE = 4;
const WINNING_VALUE = 2048;

// Helper function to create a new empty grid
const createEmptyGrid = (): Grid => {
  return Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill(null).map((): RegularTile => ({
      value: 0,
      id: Math.random(),
      isNew: false,
      mergedFrom: null
    }))
  ) as Grid;
};

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);

  // Add a random tile (2 or 4) to an empty cell
  const addRandomTile = (grid: Grid): boolean => {
    const emptyCells: Position[] = [];
    
    // Find all empty cells
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x].value === 0) {
          emptyCells.push({ x, y });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      // Choose a random empty cell
      const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      // 90% chance for 2, 10% chance for 4
      const newTile: RegularTile = {
        value: Math.random() < 0.9 ? 2 : 4,
        id: Math.random(),
        isNew: true,
        mergedFrom: null,
      };
      grid[y][x] = newTile;
      return true;
    }
    return false;
  };

  // Initialize the game
  const initializeGame = useCallback(() => {
    const newGrid = createEmptyGrid();
    
    // Add two initial tiles
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    
    setGrid([...newGrid]);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    // Load best score from localStorage
    const savedBestScore = localStorage.getItem('bestScore2048');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10));
    }
  }, [initializeGame]);

  // Save best score to localStorage when it changes
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bestScore2048', score.toString());
    }
  }, [score, bestScore]);

  // Check if there are any moves left
  const hasAvailableMoves = (grid: Grid): boolean => {
    // Check for any empty cells
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x].value === 0) {
          return true;
        }
      }
    }
    
    // Check for any possible merges
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const value = grid[y][x].value;
        // Check right
        if (x < GRID_SIZE - 1 && grid[y][x + 1].value === value) return true;
        // Check down
        if (y < GRID_SIZE - 1 && grid[y + 1][x].value === value) return true;
      }
    }
    
    return false;
  };

  // Move tiles in the specified direction
  const moveTiles = (direction: 'up' | 'right' | 'down' | 'left') => {
    if (gameOver || (won && !keepPlaying)) return;

    // Create a deep copy of the grid
    const newGrid: Grid = grid.map(row => 
      row.map(cell => ({
        value: cell.value,
        id: cell.id,
        isNew: false,
        mergedFrom: null
      } as RegularTile))
    );
    
    let moved = false;
    let scoreIncrease = 0;
    
    // Process the grid based on direction
    const processCell = (x: number, y: number) => {
      let newX = x;
      let newY = y;
      let currentX = x;
      let currentY = y;
      
      // Determine the next position based on direction
      if (direction === 'left' && x > 0) newX = x - 1;
      else if (direction === 'right' && x < GRID_SIZE - 1) newX = x + 1;
      else if (direction === 'up' && y > 0) newY = y - 1;
      else if (direction === 'down' && y < GRID_SIZE - 1) newY = y + 1;
      
      // Skip if current cell is empty
      if (newGrid[currentY][currentX].value === 0) return false;
      
      // Move the tile as far as possible in the specified direction
      while (true) {
        const nextX = direction === 'left' ? newX - 1 : 
                     direction === 'right' ? newX + 1 : newX;
        const nextY = direction === 'up' ? newY - 1 : 
                     direction === 'down' ? newY + 1 : newY;
        
        // Check if next position is out of bounds
        if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
          break;
        }
        
        // If next cell is not empty, check if we can merge
        if (newGrid[nextY][nextX].value !== 0) {
          // If values are the same and not already merged, merge them
          if (newGrid[nextY][nextX].value === newGrid[currentY][currentX].value && 
              !newGrid[nextY][nextX].mergedFrom) {
            const newValue = newGrid[currentY][currentX].value * 2;
            scoreIncrease += newValue;
            
            // Check for win
            if (newValue === WINNING_VALUE && !won && !keepPlaying) {
              setWon(true);
              toast.success('You won! Keep playing to reach a higher score!', { icon: '🎉' });
            }
            
            // Merge the tiles
            const mergedTile: MergedTile = {
              value: newValue,
              id: Math.random(),
              isNew: false,
              mergedFrom: [newGrid[nextY][nextX].id, newGrid[currentY][currentX].id],
            };
            newGrid[nextY][nextX] = mergedTile;
            newGrid[currentY][currentX] = { 
              value: 0, 
              id: Math.random(),
              isNew: false,
              mergedFrom: null
            };
            moved = true;
          }
          break;
        }
        
        // Move the tile
        const movedTile: RegularTile = { 
          value: newGrid[currentY][currentX].value,
          id: newGrid[currentY][currentX].id,
          isNew: false,
          mergedFrom: null
        };
        newGrid[newY][newX] = movedTile;
        
        const emptyTile: RegularTile = { 
          value: 0, 
          id: Math.random(),
          isNew: false,
          mergedFrom: null
        };
        newGrid[currentY][currentX] = emptyTile;
        
        // Update positions
        currentX = newX;
        currentY = newY;
        newX = nextX;
        newY = nextY;
        moved = true;
      }
      
      return moved;
    };
    
    // Process cells in the correct order based on direction
    if (direction === 'left' || direction === 'up') {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          processCell(x, y);
        }
      }
    } else {
      for (let y = GRID_SIZE - 1; y >= 0; y--) {
        for (let x = GRID_SIZE - 1; x >= 0; x--) {
          processCell(x, y);
        }
      }
    }
    
    // If any tiles moved, add a new random tile
    if (moved) {
      addRandomTile(newGrid);
      setScore(prev => prev + scoreIncrease);
      
      // Check for game over
      if (!hasAvailableMoves(newGrid)) {
        setGameOver(true);
        toast('Game Over!', { icon: '😢' });
      }
    }
    
    setGrid(newGrid);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
        
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            moveTiles('up');
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            moveTiles('right');
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            moveTiles('down');
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            moveTiles('left');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, gameOver, won, keepPlaying]);

  // Get background color based on tile value
  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      0: 'bg-gray-200 dark:bg-gray-700',
      2: 'bg-yellow-100 dark:bg-yellow-900/50',
      4: 'bg-yellow-200 dark:bg-yellow-800/50',
      8: 'bg-orange-200 dark:bg-orange-800/50',
      16: 'bg-orange-300 dark:bg-orange-700/50',
      32: 'bg-red-200 dark:bg-red-800/50',
      64: 'bg-red-300 dark:bg-red-700/50',
      128: 'bg-amber-200 dark:bg-amber-700/50',
      256: 'bg-amber-300 dark:bg-amber-600/50',
      512: 'bg-amber-400 dark:bg-amber-500/50',
      1024: 'bg-yellow-400 dark:bg-yellow-500/50',
      2048: 'bg-yellow-500 dark:bg-yellow-400/50',
    };
    
    return colors[value] || 'bg-purple-500 dark:bg-purple-400/50';
  };

  // Get text color based on tile value (for better contrast)
  const getTextColor = (value: number) => {
    return value <= 4 ? 'text-gray-800 dark:text-gray-200' : 'text-white';
  };

  // Get font size based on value (to fit larger numbers)
  const getFontSize = (value: number) => {
    if (value < 100) return 'text-3xl md:text-4xl';
    if (value < 1000) return 'text-2xl md:text-3xl';
    return 'text-xl md:text-2xl';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">2048</h1>
          <p className="text-gray-600 dark:text-gray-300">Join the tiles, get to 2048!</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">SCORE</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{score}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">BEST</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{bestScore}</div>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-300">
          Use <span className="font-bold">arrow keys</span> or <span className="font-bold">WASD</span> to move
        </p>
        <button
          onClick={initializeGame}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          New Game
        </button>
      </div>

      {/* Game Board */}
      <div className="bg-gray-300 dark:bg-gray-600 p-2 rounded-lg mb-6">
        <div className="relative">
          {/* Grid Background */}
          <div className="grid grid-cols-4 gap-2">
            {Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, index) => (
              <div 
                key={`bg-${index}`} 
                className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md"
              />
            ))}
          </div>
          
          {/* Tiles */}
          <div className="absolute inset-0 grid grid-cols-4 gap-2">
            {grid.flat().map((tile, index) => {
              const y = Math.floor(index / GRID_SIZE);
              const x = index % GRID_SIZE;
              const value = tile.value;
              
              if (value === 0) return null;
              
              return (
                <motion.div
                  key={tile.id}
                  className={`flex items-center justify-center rounded-md font-bold ${getTileColor(value)} ${getTextColor(value)} ${getFontSize(value)}`}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: tile.isNew ? [0, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.15 }}
                  layout
                >
                  {value}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Over / Win Message */}
      <AnimatePresence>
        {(gameOver || (won && !keepPlaying)) && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl text-center max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {won ? '🎉 You Win! 🎉' : '😢 Game Over'}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {won 
                  ? 'You reached 2048! Keep going?'
                  : `Your score: ${score}`}
              </p>
              <div className="flex flex-col space-y-3">
                {won && (
                  <button
                    onClick={() => {
                      setKeepPlaying(true);
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium w-full"
                  >
                    Keep Playing
                  </button>
                )}
                <button
                  onClick={initializeGame}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium w-full"
                >
                  New Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Controls */}
      <div className="mt-8 md:hidden">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div></div>
          <button
            onClick={() => moveTiles('up')}
            className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-center"
          >
            <span className="text-2xl">⬆️</span>
          </button>
          <div></div>
          
          <button
            onClick={() => moveTiles('left')}
            className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-center"
          >
            <span className="text-2xl">⬅️</span>
          </button>
          <button
            onClick={() => moveTiles('down')}
            className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-center"
          >
            <span className="text-2xl">⬇️</span>
          </button>
          <button
            onClick={() => moveTiles('right')}
            className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-center"
          >
            <span className="text-2xl">➡️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
