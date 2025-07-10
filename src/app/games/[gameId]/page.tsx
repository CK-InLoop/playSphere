import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

// This would typically fetch the game data from an API or data file
const getGame = (id: string) => {
  const games = [
    {
      id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description: 'Classic two-player strategy game on a 3x3 grid',
      instructions: 'Players take turns marking a square with their symbol (X or O). The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner.',
      category: 'board',
    },
    // Add other games here...
  ];

  return games.find(game => game.id === id);
};

export default function GamePage({ params }: { params: { gameId: string } }) {
  const game = getGame(params.gameId);

  if (!game) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/games" 
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to all games
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{game.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{game.description}</p>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">How to Play</h2>
          <p className="text-gray-700 dark:text-gray-300">{game.instructions}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-6 text-center">
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            This game is coming soon! Check back later to play {game.title}.
          </p>
          <Link 
            href="/games" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Browse other games
          </Link>
        </div>
      </div>
    </div>
  );
}

// Generate static params for pre-rendering
export async function generateStaticParams() {
  return [
    { gameId: 'tic-tac-toe' },
    { gameId: '2048' },
    { gameId: 'snake' },
    { gameId: 'flappy-bird' },
    { gameId: 'memory' },
    { gameId: 'wordle' },
    { gameId: 'hangman' },
    { gameId: 'reaction' },
    { gameId: 'math-quiz' },
    { gameId: 'breakout' },
  ];
}
