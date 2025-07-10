'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

type Cell = {
  value: number;
  id: string;
  isNew?: boolean;
};

type Position = {
  x: number;
  y: number;
};

const GRID_WIDTH = 5;
const GRID_HEIGHT = 10;
const CELL_SIZE = 60;
const GRAVITY_INTERVAL = 1000; // 1 second
const POSSIBLE_VALUES = [2, 4, 8, 16];

export default function NumberDrop() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [currentBlock, setCurrentBlock] = useState<{value: number, x: number, y: number} | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const gridRef = useRef<Cell[][]>([]);

  // Initialize the grid
  const initializeGrid = useCallback(() => {
    const newGrid = Array(GRID_HEIGHT).fill(null).map(() => 
      Array(GRID_WIDTH).fill(null).map(() => ({
        value: 0,
        id: Math.random().toString(36).substr(2, 9),
        isNew: false
      }))
    );
    setGrid(newGrid);
    gridRef.current = newGrid;
    setGameOver(false);
    setScore(0);
  }, []);

  // Generate a new random block at the top
  const generateNewBlock = useCallback(() => {
    if (gameOver || isPaused) return null;

    const value = POSSIBLE_VALUES[Math.floor(Math.random() * POSSIBLE_VALUES.length)];
    const x = Math.floor(Math.random() * GRID_WIDTH);
    
    // Check if the top cell is empty
    if (gridRef.current[0][x].value !== 0) {
      setGameOver(true);
      return null;
    }

    const newBlock = { value, x, y: 0 };
    setCurrentBlock(newBlock);
    return newBlock;
  }, [gameOver, isPaused]);

  // Move the current block down
  const moveBlockDown = useCallback(() => {
    if (!currentBlock || gameOver || isPaused) return;

    const { x, y, value } = currentBlock;
    const newY = y + 1;

    // Check if we've hit the bottom or another block
    if (newY >= GRID_HEIGHT || (gridRef.current[newY] && gridRef.current[newY][x].value !== 0)) {
      // Place the block
      const newGrid = [...gridRef.current];
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = { ...newGrid[y][x], value, isNew: true };
      
      // Check for matches
      checkMatches(newGrid, x, y);
      
      // Generate new block
      setCurrentBlock(null);
      setTimeout(() => generateNewBlock(), 0);
    } else {
      // Move down
      setCurrentBlock({ ...currentBlock, y: newY });
    }
  }, [currentBlock, gameOver, isPaused, generateNewBlock]);

  // Check for matching numbers when a block lands
  const checkMatches = (grid: Cell[][], x: number, y: number) => {
    const value = grid[y][x].value;
    let matches: Position[] = [];
    
    // Check adjacent cells (up, down, left, right)
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 1, dy: 0 },  // right
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }  // left
    ];

    // Check each direction for matching values
    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;
      
      if (
        newX >= 0 && newX < GRID_WIDTH &&
        newY >= 0 && newY < GRID_HEIGHT &&
        grid[newY][newX].value === value
      ) {
        matches.push({ x: newX, y: newY });
      }
    }

    // If we found matches, combine them
    if (matches.length > 0) {
      const newGrid = [...grid];
      
      // Double the value of the current cell
      newGrid[y] = [...newGrid[y]];
      newGrid[y][x] = { ...newGrid[y][x], value: value * 2, isNew: true };
      
      // Remove the matched cells
      matches.forEach(({ x: matchX, y: matchY }) => {
        newGrid[matchY] = [...newGrid[matchY]];
        newGrid[matchY][matchX] = { ...newGrid[matchY][matchX], value: 0 };
      });
      
      // Update score
      setScore(prev => prev + (value * 2 * matches.length));
      
      // Update the grid
      setGrid(newGrid);
      gridRef.current = newGrid;
      
      // Check for new matches after combining
      setTimeout(() => checkMatches(newGrid, x, y), 100);
      
      return true;
    }
    
    return false;
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentBlock || gameOver || isPaused) return;
      
      const { x, y } = currentBlock;
      let newX = x;
      
      switch (e.key) {
        case 'ArrowLeft':
          newX = Math.max(0, x - 1);
          if (gridRef.current[y][newX].value === 0) {
            setCurrentBlock({ ...currentBlock, x: newX });
          }
          break;
          
        case 'ArrowRight':
          newX = Math.min(GRID_WIDTH - 1, x + 1);
          if (gridRef.current[y][newX].value === 0) {
            setCurrentBlock({ ...currentBlock, x: newX });
          }
          break;
          
        case 'ArrowDown':
          moveBlockDown();
          break;
          
        case ' ':
          // Drop the block to the bottom
          if (currentBlock) {
            let dropY = currentBlock.y;
            while (dropY < GRID_HEIGHT - 1 && gridRef.current[dropY + 1][currentBlock.x].value === 0) {
              dropY++;
            }
            setCurrentBlock({ ...currentBlock, y: dropY });
          }
          break;
          
        case 'p':
          setIsPaused(prev => !prev);
          break;
          
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentBlock, gameOver, isPaused, moveBlockDown]);

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused) return;
    
    gameLoopRef.current = setInterval(() => {
      moveBlockDown();
    }, GRAVITY_INTERVAL);
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveBlockDown, gameOver, isPaused]);

  // Initialize game on mount
  useEffect(() => {
    initializeGrid();
    generateNewBlock();
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [initializeGrid, generateNewBlock]);

  // Reset the game
  const resetGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    initializeGrid();
    generateNewBlock();
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Number Drop</h1>
      
      <div className="mb-4 flex gap-4">
        <div className="text-xl font-semibold">Score: {score}</div>
        <button 
          onClick={togglePause}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button 
          onClick={resetGame}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          New Game
        </button>
      </div>
      
      <div 
        className="relative bg-white border-2 border-gray-300 rounded-md overflow-hidden shadow-lg"
        style={{
          width: `${GRID_WIDTH * CELL_SIZE}px`,
          height: `${GRID_HEIGHT * CELL_SIZE}px`,
        }}
      >
        {/* Grid cells */}
        <div className="grid grid-cols-5 gap-0">
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div 
                key={`${y}-${x}`}
                className={`
                  flex items-center justify-center font-bold text-lg
                  ${cell.value === 0 ? 'bg-gray-100' : 
                    cell.value === 2 ? 'bg-blue-100 text-blue-800' :
                    cell.value === 4 ? 'bg-blue-200 text-blue-900' :
                    cell.value === 8 ? 'bg-green-100 text-green-900' :
                    'bg-yellow-100 text-yellow-900'}
                  border border-gray-200
                  transition-colors duration-200
                `}
                style={{
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                }}
              >
                {cell.value !== 0 && (
                  <motion.div
                    key={cell.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {cell.value}
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Current falling block */}
        <AnimatePresence>
          {currentBlock && (
            <motion.div
              key={`block-${currentBlock.x}-${currentBlock.y}`}
              className={`
                absolute flex items-center justify-center font-bold text-lg
                ${currentBlock.value === 2 ? 'bg-blue-100 text-blue-800' :
                  currentBlock.value === 4 ? 'bg-blue-200 text-blue-900' :
                  currentBlock.value === 8 ? 'bg-green-100 text-green-900' :
                  'bg-yellow-100 text-yellow-900'}
                border border-gray-200 rounded-md
              `}
              style={{
                width: `${CELL_SIZE - 4}px`,
                height: `${CELL_SIZE - 4}px`,
                left: `${currentBlock.x * CELL_SIZE + 2}px`,
                top: `${currentBlock.y * CELL_SIZE + 2}px`,
                transition: 'top 0.1s ease-out, left 0.1s ease-out',
              }}
            >
              {currentBlock.value}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="mb-4">Your score: {score}</p>
              <button 
                onClick={resetGame}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
        
        {/* Pause overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-2xl font-bold">Paused</h2>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-gray-600 text-sm">
        <p className="mb-2"><strong>How to play:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>← → : Move block left/right</li>
          <li>↓ : Move block down faster</li>
          <li>Space : Drop block to bottom</li>
          <li>P : Pause/Resume game</li>
        </ul>
      </div>
    </div>
  );
}
