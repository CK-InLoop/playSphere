import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

type GameLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  instructions?: string;
  onBack?: () => void;
  score?: number;
  highScore?: number;
  onRestart?: () => void;
  isPaused?: boolean;
  onPauseToggle?: () => void;
};

export default function GameLayout({
  title,
  description,
  children,
  instructions,
  onBack,
  score,
  highScore,
  onRestart,
  isPaused,
  onPauseToggle,
}: GameLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            {onBack ? (
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Back to games"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link 
                href="/" 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Back to home"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            
            {(typeof score !== 'undefined' || typeof highScore !== 'undefined') && (
              <div className="ml-auto flex gap-4">
                {typeof score !== 'undefined' && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Score</div>
                    <div className="font-bold">{score}</div>
                  </div>
                )}
                {typeof highScore !== 'undefined' && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">High Score</div>
                    <div className="font-bold">{highScore}</div>
                  </div>
                )}
              </div>
            )}
            
            {(onRestart || onPauseToggle) && (
              <div className="flex gap-2 ml-4">
                {onPauseToggle && (
                  <button
                    onClick={onPauseToggle}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                )}
                {onRestart && (
                  <button
                    onClick={onRestart}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    Restart
                  </button>
                )}
              </div>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300">
            {description}
          </p>
          
          {instructions && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                How to Play
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {instructions}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
