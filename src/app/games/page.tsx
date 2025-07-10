'use client';

import { FiSearch } from 'react-icons/fi';
import GameCard from '@/components/GameCard';
import { Game } from '@/types';

// This would typically come from an API or data file
const allGames: Game[] = [
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    description: 'Classic two-player strategy game on a 3x3 grid',
    icon: '⭕',
    color: 'bg-blue-500',
    category: 'board',
    path: '/games/tic-tac-toe',
  },
  {
    id: '2048',
    title: '2048',
    description: 'Slide tiles to combine them and reach 2048!',
    icon: '🔢',
    color: 'bg-yellow-500',
    category: 'puzzle',
    path: '/games/2048',
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'Grow your snake by eating food, but don\'t hit the walls!',
    icon: '🐍',
    color: 'bg-green-500',
    category: 'arcade',
    path: '/games/snake',
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    description: 'Navigate a bird through pipes without hitting them',
    icon: '🐦',
    color: 'bg-red-500',
    category: 'arcade',
    path: '/games/flappy-bird',
  },
  {
    id: 'memory',
    title: 'Memory Game',
    description: 'Find all matching pairs of cards',
    icon: '🎴',
    color: 'bg-purple-500',
    category: 'puzzle',
    path: '/games/memory',
  },
  {
    id: 'wordle',
    title: 'Wordle',
    description: 'Guess the hidden word in six tries',
    icon: '📝',
    color: 'bg-indigo-500',
    category: 'word',
    path: '/games/wordle',
  },
  {
    id: 'hangman',
    title: 'Hangman',
    description: 'Guess the word before the hangman is complete',
    icon: '🪢',
    color: 'bg-pink-500',
    category: 'word',
    path: '/games/hangman',
  },
  {
    id: 'reaction',
    title: 'Reaction Time',
    description: 'Test your reaction speed',
    icon: '⏱️',
    color: 'bg-cyan-500',
    category: 'action',
    path: '/games/reaction',
  },
  {
    id: 'math-quiz',
    title: 'Math Quiz',
    description: 'Solve math problems under time pressure',
    icon: '🧮',
    color: 'bg-amber-500',
    category: 'puzzle',
    path: '/games/math-quiz',
  },
  {
    id: 'breakout',
    title: 'Breakout',
    description: 'Destroy all bricks with a bouncing ball',
    icon: '🎾',
    color: 'bg-teal-500',
    category: 'arcade',
    path: '/games/breakout',
  },
];

export default function GamesPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search games..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
