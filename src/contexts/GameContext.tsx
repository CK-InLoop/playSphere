'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type GameScore = {
  score: number;
  highScore: number;
  wins: number;
  losses: number;
};

type GameContextType = {
  scores: Record<string, GameScore>;
  updateScore: (gameId: string, value: number, type: 'score' | 'win' | 'loss' | 'highScore') => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [scores, setScores] = useState<Record<string, GameScore>>({});

  // Load scores from localStorage on mount
  useEffect(() => {
    const savedScores = localStorage.getItem('gameScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  // Save scores to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(scores).length > 0) {
      localStorage.setItem('gameScores', JSON.stringify(scores));
    }
  }, [scores]);

  const updateScore = (gameId: string, value: number, type: 'score' | 'win' | 'loss' | 'highScore') => {
    setScores(prevScores => {
      const currentGame = prevScores[gameId] || { score: 0, highScore: 0, wins: 0, losses: 0 };
      
      const updatedGame = { ...currentGame };
      
      switch (type) {
        case 'score':
          updatedGame.score = value;
          if (value > (currentGame.highScore || 0)) {
            updatedGame.highScore = value;
          }
          break;
        case 'highScore':
          updatedGame.highScore = Math.max(currentGame.highScore || 0, value);
          break;
        case 'win':
          updatedGame.wins = (currentGame.wins || 0) + value;
          break;
        case 'loss':
          updatedGame.losses = (currentGame.losses || 0) + value;
          break;
      }
      
      return {
        ...prevScores,
        [gameId]: updatedGame
      };
    });
  };

  return (
    <GameContext.Provider value={{ scores, updateScore }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
