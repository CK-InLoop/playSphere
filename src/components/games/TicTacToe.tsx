'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

type Player = 'X' | 'O';
type Board = (Player | null)[];
type GameResult = Player | 'tie' | null;

const TicTacToe = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'tie' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState({ X: 0, O: 0, ties: 0 });

  const checkWinner = (board: Board): GameResult => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      const cellA = board[a];
      if (cellA && cellA === board[b] && cellA === board[c]) {
        return cellA;
      }
    }

    return board.includes(null) ? null : 'tie';
  };

  const handleClick = (index: number) => {
    if (board[index] !== null || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    
    if (gameResult === 'tie') {
      setWinner('tie');
      setGameOver(true);
      setScore(prev => ({ ...prev, ties: prev.ties + 1 }));
      toast('Game ended in a tie!', { icon: '🤝' });
    } else if (gameResult) {
      setWinner(gameResult);
      setGameOver(true);
      setScore(prev => ({
        ...prev,
        [gameResult]: prev[gameResult] + 1
      }));
      toast.success(`Player ${gameResult} wins!`, { icon: '🎉' });
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameOver(false);
  };

  const resetScore = () => {
    setScore({ X: 0, O: 0, ties: 0 });
    resetGame();
  };

  const renderCell = (index: number) => {
    const value = board[index];
    return (
      <motion.button
        key={index}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-3xl font-bold rounded-lg transition-colors
          ${!value && !gameOver ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer' : ''}
          ${value === 'X' ? 'text-blue-500' : 'text-pink-500'}
          bg-white dark:bg-gray-800 shadow-md`}
        onClick={() => handleClick(index)}
        disabled={!!value || gameOver}
      >
        {value === 'X' ? (
          <FaTimes className="w-8 h-8 md:w-10 md:h-10" />
        ) : value === 'O' ? (
          <FaCircle className="w-6 h-6 md:w-8 md:h-8" />
        ) : null}
      </motion.button>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Player X</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{score.X}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Ties</p>
          <p className="text-xl font-bold">{score.ties}</p>
        </div>
        <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Player O</p>
          <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{score.O}</p>
        </div>
      </div>

      {/* Game Status */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {gameOver 
            ? winner 
              ? `Player ${winner} Wins!` 
              : 'Game Tied!'
            : `Player ${currentPlayer}'s Turn`}
        </h2>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-200 dark:bg-gray-700 p-3 rounded-xl">
        {Array(9).fill(null).map((_, index) => renderCell(index))}
      </div>

      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {gameOver ? 'Play Again' : 'Reset Game'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetScore}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Reset Score
        </motion.button>
      </div>
    </div>
  );
};

export default TicTacToe;
