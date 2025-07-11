import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

type GameLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  instructions?: string;
  onBack?: () => void;
};

export default function GameLayout({
  title,
  description,
  children,
  instructions,
  onBack,
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
                aria-label="Go back"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <Link 
                href="/games"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Back to games"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 ml-12">
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
