'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { toast } from 'react-hot-toast';
import GameLayout from './GameLayout';

type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 100;

const Snake = () => {
  const { updateScore } = useGame();
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const directionRef = useRef<Direction>('RIGHT');

  // Generate random food position
  const generateFood = useCallback((): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    return { x, y };
  }, []);

  // Check if position is occupied by snake
  const isPositionOccupied = useCallback((pos: Position, snakeBody: Position[] = snake): boolean => {
    return snakeBody.some(segment => segment.x === pos.x && segment.y === pos.y);
  }, [snake]);

  // Generate new food position that's not on the snake
  const getNewFoodPosition = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = generateFood();
    } while (isPositionOccupied(newFood));
    return newFood;
  }, [generateFood, isPositionOccupied]);

  // Move snake
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      const dir = directionRef.current;

      // Move head with wrapping
      switch (dir) {
        case 'UP':
          head.y = head.y <= 0 ? GRID_SIZE - 1 : head.y - 1;
          break;
        case 'DOWN':
          head.y = head.y >= GRID_SIZE - 1 ? 0 : head.y + 1;
          break;
        case 'LEFT':
          head.x = head.x <= 0 ? GRID_SIZE - 1 : head.x - 1;
          break;
        case 'RIGHT':
          head.x = head.x >= GRID_SIZE - 1 ? 0 : head.x + 1;
          break;
      }

      // Check collision with self
      if (isPositionOccupied(head, prevSnake)) {
        setGameOver(true);
        toast.error('Game Over! Snake hit itself!');
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        setFood(getNewFoodPosition());
        setScore(prev => {
          const newScore = prev + 10;
          updateScore('snake', newScore, 'score');
          return newScore;
        });
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [food, getNewFoodPosition, isPositionOccupied, updateScore]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) {
        setGameStarted(true);
        return;
      }

      if (e.key === ' ') {
        setIsPaused(prev => !prev);
        return;
      }

      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') {
            directionRef.current = 'UP';
            setDirection('UP');
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') {
            directionRef.current = 'DOWN';
            setDirection('DOWN');
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') {
            directionRef.current = 'LEFT';
            setDirection('LEFT');
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') {
            directionRef.current = 'RIGHT';
            setDirection('RIGHT');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, gameStarted]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || isPaused || gameOver) return;

    gameLoopRef.current = setInterval(() => {
      moveSnake();
    }, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, isPaused, gameOver, moveSnake]);

  // Reset game
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(getNewFoodPosition());
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
    setIsPaused(false);
    
    // Update high score if needed
    if (score > 0) {
      updateScore('snake', score, 'highScore');
    }
  };

  // Render game board
  const renderBoard = () => {
    const board = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isHead = snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;

        let cellClass = 'border border-gray-100 dark:border-gray-700';
        if (isSnake) {
          cellClass = isHead 
            ? 'bg-green-700 dark:bg-green-600' 
            : 'bg-green-500 dark:bg-green-500/90';
        } else if (isFood) {
          cellClass = 'bg-red-500 dark:bg-red-600 rounded-full';
        }

        board.push(
          <div
            key={`${x}-${y}`}
            className={`w-5 h-5 ${cellClass}`}
            style={{
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
          />
        );
      }
    }
    return board;
  };

  return (
    <GameLayout
      title="Snake Game"
      description={gameOver 
        ? `Game Over! Final Score: ${score}` 
        : isPaused 
          ? 'Game Paused' 
          : `Score: ${score}`}
      instructions="Use arrow keys to move the snake. Eat the red food to grow longer. The snake will wrap around the screen edges. Game ends only if the snake hits itself!"
    >
      <div className="w-full max-w-md mx-auto">
        {!gameStarted && !gameOver && (
          <div className="text-center mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-6">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Use arrow keys to start the game. Eat the red food to grow longer!
            </p>
          </div>
        )}

      {/* Game Board */}
      <div className="flex justify-center mb-6">
        <div 
          className="grid bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            width: 'fit-content',
          }}
        >
          {renderBoard()}
        </div>
      </div>
      
      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPaused(!isPaused)}
          disabled={!gameStarted || gameOver}
          className={`px-6 py-2 rounded-lg transition-colors ${
            !gameStarted || gameOver
              ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {gameOver ? 'Play Again' : 'New Game'}
        </motion.button>
      </div>
      
      {/* Mobile Controls */}
      <div className="mt-8 grid grid-cols-3 gap-2 max-w-xs mx-auto">
        <div></div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (!gameStarted) setGameStarted(true);
            if (directionRef.current !== 'DOWN') {
              directionRef.current = 'UP';
              setDirection('UP');
            }
          }}
          className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
        >
          <span className="text-2xl">⬆️</span>
        </motion.button>
        <div></div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (!gameStarted) setGameStarted(true);
            if (directionRef.current !== 'RIGHT') {
              directionRef.current = 'LEFT';
              setDirection('LEFT');
            }
          }}
          className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
        >
          <span className="text-2xl">⬅️</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={resetGame}
          className="p-4 bg-indigo-600 text-white rounded-lg flex items-center justify-center"
        >
          <span className="text-sm font-medium">{gameOver ? 'Restart' : 'Start'}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (!gameStarted) setGameStarted(true);
            if (directionRef.current !== 'LEFT') {
              directionRef.current = 'RIGHT';
              setDirection('RIGHT');
            }
          }}
          className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
        >
          <span className="text-2xl">➡️</span>
        </motion.button>
        <div></div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (!gameStarted) setGameStarted(true);
            if (directionRef.current !== 'UP') {
              directionRef.current = 'DOWN';
              setDirection('DOWN');
            }
          }}
          className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
        >
          <span className="text-2xl">⬇️</span>
        </motion.button>
        <div></div>
      </div>
      </div>
    </GameLayout>
  );
};

export default Snake;
