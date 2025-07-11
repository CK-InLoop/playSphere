'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { toast } from 'react-hot-toast';
import GameLayout from './GameLayout';

type Mole = {
  id: number;
  isUp: boolean;
  isHit: boolean;
};

const GRID_SIZE = 3; // 3x3 grid
const GAME_DURATION = 30000; // 30 seconds
const MOLE_UP_TIME = 1500; // Time a mole stays up
const MOLE_DELAY_MIN = 300; // Min time between moles appearing
const MOLE_DELAY_MAX = 1000; // Max time between moles appearing

export default function WhackAMole() {
  const { updateScore } = useGame();
  const [moles, setMoles] = useState<Mole[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const moleTimerRef = useRef<NodeJS.Timeout>();

  // Initialize moles
  useEffect(() => {
    const initialMoles = Array(GRID_SIZE * GRID_SIZE)
      .fill(null)
      .map((_, index) => ({
        id: index,
        isUp: false,
        isHit: false,
      }));
    setMoles(initialMoles);

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('whackAMoleHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // End the game
  const endGame = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('whackAMoleHighScore', score.toString());
      updateScore('whack-a-mole', score, 'highScore');
      toast.success(`New High Score: ${score}!`);
    }
    
    // Reset all moles
    setMoles(prev => prev.map(mole => ({
      ...mole,
      isUp: false,
      isHit: false,
    })));
  }, [score, highScore, updateScore]);

  // Start the game
  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION / 1000);
    setIsPlaying(true);
    setGameOver(false);
    
    // Initialize all moles as down
    const initialMoles = Array(GRID_SIZE * GRID_SIZE)
      .fill(null)
      .map((_, index) => ({
        id: index,
        isUp: false,
        isHit: false,
      }));
    setMoles(initialMoles);

    // Set game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Function to pop up a new mole
    const popMole = () => {
      if (!isPlaying) return;
      
      // First, bring down any mole that's currently up
      setMoles(prev => 
        prev.map(mole => ({
          ...mole,
          isUp: false,
          isHit: false
        }))
      );
      
      // Then, after a short delay, pop up a new mole
      setTimeout(() => {
        if (!isPlaying) return;
        
        const randomIndex = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
        
        setMoles(prev => 
          prev.map((mole, idx) => 
            idx === randomIndex 
              ? { ...mole, isUp: true, isHit: false }
              : { ...mole, isUp: false }
          )
        );

        // Schedule the mole to go down
        const moleTimer = setTimeout(() => {
          setMoles(prev => 
            prev.map(mole => 
              mole.isUp && !mole.isHit 
                ? { ...mole, isUp: false } 
                : mole
            )
          );
        }, MOLE_UP_TIME);
        
        // Schedule next mole
        if (isPlaying && timeLeft > 0) {
          const delay = Math.random() * (MOLE_DELAY_MAX - MOLE_DELAY_MIN) + MOLE_DELAY_MIN;
          moleTimerRef.current = setTimeout(popMole, delay + MOLE_UP_TIME);
        }
        
        return () => clearTimeout(moleTimer);
      }, 100);
    };

    // Start the mole popping sequence
    moleTimerRef.current = setTimeout(popMole, 1000);

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    };
  }, [isPlaying, timeLeft, endGame]);



  // Handle mole whack
  const whackMole = (id: number) => {
    if (!isPlaying || gameOver) return;
    
    setMoles(prev => 
      prev.map(mole => {
        if (mole.id === id && mole.isUp && !mole.isHit) {
          // Add points for hitting a mole
          const points = 10;
          setScore(prev => prev + points);
          updateScore('whack-a-mole', points, 'score');
          
          return { ...mole, isHit: true };
        }
        return mole;
      })
    );
  };

  // Render mole
  const renderMole = (mole: Mole) => {
    const moleUp = {
      y: -40,
      scale: 1.1,
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 15,
        mass: 0.5
      }
    };
    
    const moleDown = {
      y: 40,
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        mass: 0.5
      }
    };

    return (
      <motion.div
        key={mole.id}
        className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden cursor-pointer"
        onClick={() => whackMole(mole.id)}
      >
        {/* Hole */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-gray-800 rounded-full"></div>
        </div>
        
        {/* Mole - only visible when isUp is true */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={mole.isUp ? moleUp : moleDown}
          style={{ y: 40 }} // Start position (down)
        >
          <div className={`w-3/4 h-3/4 rounded-full flex items-center justify-center ${
            mole.isHit ? 'bg-green-600' : 'bg-amber-800'
          }`}>
            {mole.isHit ? (
              <span className="text-3xl">😵</span>
            ) : (
              <span className="text-3xl">🐭</span>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <GameLayout
      title="Whack-a-Mole"
      description={`Score: ${score} | Time: ${timeLeft}s | High Score: ${highScore}`}
      instructions="Click the moles as they pop up! Score points for each mole you hit. Game lasts for 30 seconds."
    >
      <div className="flex flex-col items-center">
        {/* Game Board */}
        <div 
          className="grid gap-4 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-2xl"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {moles.map(mole => renderMole(mole))}
        </div>
        
        {/* Game Controls */}
        <div className="mt-8 flex gap-4">
          {!isPlaying ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold"
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={endGame}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold"
            >
              End Game
            </motion.button>
          )}
        </div>
        
        {/* Game Over Message */}
        {gameOver && (
          <motion.div 
            className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold mb-2">Game Over!</h3>
            <p>Your score: {score}</p>
            <p>High score: {highScore}</p>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
}
