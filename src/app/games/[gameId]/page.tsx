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
      id: 'reaction-time',
      title: 'Reaction Time',
      description: 'Test your reflexes with this quick reaction game',
      instructions: 'Click as soon as you see the screen change color. Try to get the fastest reaction time!',
      category: 'reflex',
      component: 'ReactionTime',
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
      id: 'flappy-bird',
      title: 'Flappy Bird',
      description: 'Navigate the bird through the pipes!',
      instructions: 'Click or press SPACE to make the bird flap. Avoid the pipes and don\'t hit the ground or ceiling!',
      category: 'arcade',
      component: 'FlappyBird',
    },
    {
      id: 'wordle',
      title: 'Wordle',
      description: 'Guess the hidden word in 6 tries',
      instructions: 'Guess the 5-letter word. Green means correct letter in the correct position. Yellow means correct letter in the wrong position.',
      category: 'word',
      component: 'Wordle',
    },
    {
      id: 'breakout',
      title: 'Breakout',
      description: 'Destroy all the bricks with the ball!',
      instructions: 'Use arrow keys or mouse to move the paddle. Press SPACE to pause. Don\'t let the ball fall!',
      category: 'arcade',
      component: 'Breakout',
    },
    {
      id: '2048',
      title: '2048',
      description: 'Slide tiles to combine them and reach the 2048 tile!',
      instructions: 'Use arrow keys or WASD to move all tiles in one direction. When two tiles with the same number touch, they merge into one!',
      category: 'puzzle',
      component: 'Game2048',
    },
    {
      id: 'hangman',
      title: 'Hangman',
      description: 'Guess the hidden word before the hangman is complete!',
      instructions: 'Type letters or click the on-screen keyboard to guess the word. You have 6 incorrect guesses before the game is over.',
      category: 'word',
      component: 'Hangman',
    },
    {
      id: 'binary-puzzle',
      title: 'Binary Puzzle',
      description: 'Fill the grid with 0s and 1s following the rules',
      instructions: 'Fill the grid with 0s and 1s following these rules:\n1. Each row and column must have an equal number of 0s and 1s\n2. No more than two identical numbers next to or below each other\n3. Each row and column must be unique\n4. Select 0 or 1, then click on an empty cell to place it',
      category: 'puzzle',
      component: 'BinaryPuzzle',
    },
    {
      id: 'queens',
      title: 'Queens',
      description: 'Place queens on the board so none can attack each other',
      instructions: 'Place queens (👑) on the board so that no two queens threaten each other. Queens can move any number of squares vertically, horizontally, or diagonally. Complete the board to win!',
      category: 'puzzle',
      component: 'Queens',
    },
    {
      id: 'red-light-green-light',
      title: 'Red Light, Green Light',
      description: 'Test your reflexes in this Squid Game classic!',
      instructions: 'Press and hold SPACE to move when the light is green. Release SPACE when it turns red or you\'ll be eliminated! Reach the finish line to win.',
      category: 'arcade',
      component: 'RedLightGreenLight',
    },
    {
      id: 'math-quiz',
      title: 'Math Quiz',
      description: 'Test your math skills with this fast-paced arithmetic challenge!',
      instructions: 'Solve as many math problems as you can in 30 seconds. Choose the correct answer from the options. Each correct answer is worth 10 points!',
      category: 'puzzle',
      component: 'MathQuiz',
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
    { gameId: 'reaction-time' },
    { gameId: 'math-quiz' },
    { gameId: 'breakout' },
  ];
}
