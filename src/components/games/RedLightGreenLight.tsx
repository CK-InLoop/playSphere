'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import GameLayout from './GameLayout';

type GameState = 'waiting' | 'countdown' | 'greenlight' | 'redlight' | 'won' | 'lost';

export default function RedLightGreenLight() {
  const { updateScore } = useGame();
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [position, setPosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [message, setMessage] = useState('Press SPACE to start');
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const isMovingRef = useRef(false);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('redlightHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
    const delta = timestamp - lastUpdateRef.current;

    if (delta > 16) { // ~60fps
      if (gameState === 'greenlight' && isMovingRef.current) {
        setPosition(prev => {
          const newPosition = prev + (0.5 * level);
          if (newPosition >= 100) {
            setGameState('won');
            return 100;
          }
          return newPosition;
        });
      }
      lastUpdateRef.current = timestamp;
    }
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, level]);

  // Game state management
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    switch (gameState) {
      case 'countdown':
        setMessage('Get ready...');
        timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setGameState('greenlight');
              return 3;
            }
            return prev - 1;
          });
        }, 1000);
        break;
        
      case 'greenlight':
        setMessage('GREEN LIGHT! (Hold SPACE to move)');
        const greenTime = Math.max(1000, 3000 - (level * 200));
        timer = setTimeout(() => {
          setGameState('redlight');
        }, greenTime);
        break;
        
      case 'redlight':
        setMessage('RED LIGHT! (Release SPACE)');
        const redTime = 1000 + Math.random() * 2000;
        timer = setTimeout(() => {
          if (isMovingRef.current) {
            setGameState('lost');
          } else {
            setGameState('greenlight');
          }
        }, redTime);
        break;
        
      case 'won':
        const points = level * 10;
        setScore(prev => prev + points);
        setLevel(prev => prev + 1);
        setMessage(`Level ${level + 1}! +${points} points`);
        
        // Update high score if needed
        if (score + points > highScore) {
          const newHighScore = score + points;
          setHighScore(newHighScore);
          localStorage.setItem('redlightHighScore', newHighScore.toString());
          updateScore('redlight', newHighScore, 'highScore');
        }
        
        updateScore('redlight', points, 'score');
        
        timer = setTimeout(() => {
          setPosition(0);
          setGameState('countdown');
        }, 2000);
        break;
        
      case 'lost':
        setMessage('Eliminated! Press SPACE to try again');
        break;
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, level, score, highScore, updateScore]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        if (gameState === 'waiting' || gameState === 'lost') {
          setPosition(0);
          setScore(0);
          setLevel(1);
          setGameState('countdown');
          return;
        }
        
        if (gameState === 'greenlight') {
          isMovingRef.current = true;
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isMovingRef.current = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  // Start game loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  // Calculate progress bar color based on position
  const getProgressBarColor = () => {
    if (position < 30) return 'bg-red-500';
    if (position < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <GameLayout
      title="Red Light, Green Light"
      description="Move on green light, stop on red light!"
      score={score}
      highScore={highScore}
      onRestart={() => {
        setPosition(0);
        setScore(0);
        setLevel(1);
        setGameState('countdown');
      }}
    >
      <div 
        ref={gameAreaRef}
        className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex flex-col items-center justify-center"
        onClick={() => gameAreaRef.current?.focus()}
        tabIndex={0}
      >
        {/* Game area */}
        <div className="w-full h-full relative">
          {/* Finish line */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-yellow-400 z-10"></div>
          
          {/* Player */}
          <motion.div
            className="absolute left-4 bottom-4 w-12 h-12 bg-red-600 rounded-full z-20 flex items-center justify-center text-white font-bold"
            style={{ x: `calc(${position}% - 1.5rem)` }}
            animate={{
              y: [0, -10, 0],
              scale: isMovingRef.current ? [1, 1.1, 1] : 1,
            }}
            transition={{
              y: {
                duration: 0.5,
                repeat: isMovingRef.current ? Infinity : 0,
                repeatType: "reverse"
              },
              scale: {
                duration: 0.3,
                repeat: isMovingRef.current ? Infinity : 0,
                repeatType: "reverse"
              }
            }}
          >
            {isMovingRef.current ? '🏃' : '🧍'}
          </motion.div>
          
          {/* Doll */}
          <div className="absolute right-1/2 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-6xl">
            <AnimatePresence mode="wait">
              {gameState === 'redlight' ? (
                <motion.div
                  key="red"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-red-600"
                >
                  🔴
                </motion.div>
              ) : (
                <motion.div
                  key="green"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-green-600"
                >
                  🟢
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
          <motion.div
            className={`h-full ${getProgressBarColor()} rounded-full`}
            initial={{ width: '0%' }}
            animate={{ width: `${position}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>
        
        {/* Game message */}
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold mb-2">{message}</p>
          {gameState === 'countdown' && (
            <div className="text-3xl font-bold text-indigo-600">{countdown}</div>
          )}
          {gameState === 'waiting' || gameState === 'lost' ? (
            <p className="text-sm text-gray-500 mt-2">Press SPACE to {gameState === 'lost' ? 'try again' : 'start'}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              Level {level} • {isMovingRef.current ? 'Moving!' : 'Stopped'}
            </p>
          )}
        </div>
      </div>
    </GameLayout>
  );
}