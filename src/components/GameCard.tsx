import Link from 'next/link';
import { motion } from 'framer-motion';
import { Game } from '@/types';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      transition={{ duration: 0.2 }}
      className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg"
    >
      <div className="p-6">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl ${game.color}`}>
          {game.icon}
        </div>
        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
          {game.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-4">
          {game.description}
        </p>
        <Link
          href={`/games/${game.id}`}
          className={`block w-full py-2 px-4 text-center rounded-lg font-medium ${game.color.replace('bg-', 'bg-opacity-10 hover:bg-opacity-20 text-')} transition-colors`}
        >
          Play Now
        </Link>
      </div>
    </motion.div>
  );
}
