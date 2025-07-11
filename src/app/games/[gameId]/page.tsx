import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// This would typically fetch the game data from an API or data file
const getGame = (id: string) => {
  const games = [
    {
      id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description: 'Classic two-player strategy game on a 3x3 grid',
      instructions: 'Players take turns marking a square with their symbol (X or O). The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner.',
      category: 'board',
      component: 'TicTacToe',
    },
    {
      id: 'sudoku',
      title: 'Sudoku',
      description: 'Classic number placement puzzle',
      instructions: 'Fill the grid so that every row, column, and 3×3 box contains the digits 1-9 without repeating. Click a cell to select it, then click a number to fill it in. Use the X button to clear a cell. You can also use the number keys (1-9) and arrow keys to navigate.',
      category: 'puzzle',
      component: 'Sudoku',
    },
    {
      id: 'color-match',
      title: 'Color Match',
      description: 'Find and match pairs of colored cards',
      instructions: 'Click on cards to flip them over. Find all matching pairs of colors to win. Try to complete the game in as few moves as possible!',
      category: 'puzzle',
      component: 'ColorMatch',
    },
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Test your memory by matching pairs of cards',
      instructions: 'Flip over two cards at a time to find matching pairs. Try to find all pairs in the fewest moves possible!',
      category: 'puzzle',
      component: 'MemoryMatch',
    },
    {
      id: 'number-drop',
      title: 'Number Drop',
      description: 'Drop and combine matching numbers',
      instructions: 'Drop number blocks and combine matching numbers. Use arrow keys to move and space to drop. Combine numbers to score points!',
      category: 'puzzle',
      component: 'NumberDrop',
    },
    {
      id: 'snake',
      title: 'Snake',
      description: 'Classic snake game - eat the food and grow longer!',
      instructions: 'Use arrow keys to move the snake. Eat the red food to grow longer. The snake will wrap around the screen edges. Game ends only if the snake hits itself!',
      category: 'arcade',
      component: 'Snake',
    },
    {
      id: 'whack-a-mole',
      title: 'Whack-a-Mole',
      description: 'Test your reflexes by whacking moles as they pop up!',
      instructions: 'Click the moles as they appear to score points. Be quick - they won\'t stay up for long! Game lasts for 30 seconds.',
      category: 'arcade',
      component: 'WhackAMole',
    },
    {
      id: '2048',
      title: '2048',
      description: 'Slide tiles to combine them and reach the 2048 tile!',
      instructions: 'Use arrow keys or WASD to move all tiles in one direction. When two tiles with the same number touch, they merge into one!',
      category: 'puzzle',
      component: 'Game2048',
    },
    // Add other games here...
  ];

  return games.find(game => game.id === id);
};

// Dynamically import game components with no SSR
const GameComponent = ({ gameId }: { gameId: string }) => {
  const Game = dynamic(
    () => import(`@/components/games/${gameId}`),
    { ssr: false }
  );
  return <Game />;
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          {game.component ? (
            <GameComponent gameId={game.component} />
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-6 text-center">
              <p className="text-blue-800 dark:text-blue-200">
                This game is coming soon! Check back later to play {game.title}.
              </p>
              <Link 
                href="/games" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Browse other games
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate static params for pre-rendering
export async function generateStaticParams() {
  return [
    { gameId: 'tic-tac-toe' },
    { gameId: 'memory-match' },
    { gameId: '2048' },
    { gameId: 'snake' },
    { gameId: 'flappy-bird' },
    { gameId: 'wordle' },
    { gameId: 'hangman' },
    { gameId: 'reaction' },
    { gameId: 'math-quiz' },
    { gameId: 'breakout' },
  ];
}
