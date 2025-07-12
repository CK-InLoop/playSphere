'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { toast } from 'react-hot-toast';
import GameLayout from './GameLayout';

const GAME_DURATION = 10000; // 10 seconds
const MIN_WAIT_TIME = 1000; // Minimum wait time between clicks
const MAX_WAIT_TIME = 3000; // Maximum wait time between clicks

export default function ReactionTime() {
  const { updateScore } = useGame();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [reactionTime, setReactionTime] = useState(0);
  const gameTimerRef = useRef<NodeJS.Timeout>();
  const waitTimerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('reactionTimeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(GAME_DURATION / 1000);
    setHighScore(prev => Math.max(prev, score));
    startWaitTimer();
    
    // Start game timer
    const startTime = Date.now();
    startTimeRef.current = startTime;
    
    gameTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTimeLeft(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        clearInterval(gameTimerRef.current);
        setIsPlaying(false);
        if (score > highScore) {
          localStorage.setItem('reactionTimeHighScore', score.toString());
          setHighScore(score);
          toast.success(`New High Score: ${score}`);
        }
      }
    }, 100);
  };

  const startWaitTimer = () => {
    const newWaitTime = Math.floor(Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME + 1)) + MIN_WAIT_TIME;
    setWaitTime(newWaitTime);
    setIsReady(false);
    
    waitTimerRef.current = setTimeout(() => {
      setIsReady(true);
    }, newWaitTime);
  };

  const handleClick = () => {
    if (!isPlaying) return;

    if (isReady) {
      const endTime = Date.now();
      const reactionTimeMs = endTime - (startTimeRef.current + waitTime);
      setReactionTime(reactionTimeMs);
      
      // Update score based on reaction time
      if (reactionTimeMs < 300) {
        setScore(prev => prev + 10);
        toast.success('Perfect!');
      } else if (reactionTimeMs < 500) {
        setScore(prev => prev + 5);
        toast.success('Good!');
      } else {
        toast.success('Too slow!');
      }

      startWaitTimer();
    } else {
      // Clicked too early
      toast.error('Too early!');
      startWaitTimer(); // Reset the wait timer
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(gameTimerRef.current);
      clearTimeout(waitTimerRef.current);
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <GameLayout
      title="Reaction Time"
      description="Test your reflexes! Click when the button turns green."
      instructions="Click the button when it turns green. The faster you click, the more points you get!"
      onBack={() => {
        setIsPlaying(false);
        clearTimeout(waitTimerRef.current);
        clearInterval(gameTimerRef.current);
      }}
    >
      <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
        {!isPlaying ? (
          <button
            onClick={startGame}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xl font-semibold"
          >
            {score > 0 ? 'Play Again' : 'Start Game'}
          </button>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-8 w-full max-w-md">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">Score</div>
                <div className="text-3xl font-bold">{score}</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 dark:text-gray-300">Time Left</div>
                <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-64 h-64 rounded-2xl flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-200 ${
                isReady 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
              onClick={handleClick}
            >
              {isReady ? 'CLICK NOW!' : 'Wait for green...'}
            </motion.div>
            
            {reactionTime > 0 && (
              <div className="text-lg text-center">
                <div className="text-gray-600 dark:text-gray-300">Last Reaction Time</div>
                <div className="text-2xl font-semibold">{reactionTime}ms</div>
                {reactionTime < 300 && (
                  <div className="text-green-500 text-sm mt-1">Amazing reaction time!</div>
                )}
              </div>
            )}
            
            {highScore > 0 && (
              <div className="mt-4 text-gray-500 dark:text-gray-400">
                High Score: {highScore}
              </div>
            )}
          </>
        )}
      </div>
    </GameLayout>
  );
}