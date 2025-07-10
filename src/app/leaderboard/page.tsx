import { FiAward, FiClock, FiStar } from 'react-icons/fi';

// Mock data - in a real app, this would come from an API
type LeaderboardEntry = {
  id: string;
  game: string;
  player: string;
  score: number;
  date: string;
};

const leaderboardData: LeaderboardEntry[] = [
  { id: '1', game: '2048', player: 'Player1', score: 4096, date: '2023-06-15' },
  { id: '2', game: 'Snake', player: 'Gamer123', score: 250, date: '2023-06-14' },
  { id: '3', game: 'Tic Tac Toe', player: 'XOXO', score: 15, date: '2023-06-13' },
  { id: '4', game: 'Memory', player: 'BrainMaster', score: 28, date: '2023-06-12' },
  { id: '5', game: 'Wordle', player: 'WordWizard', score: 42, date: '2023-06-11' },
  { id: '6', game: 'Breakout', player: 'BrickBreaker', score: 12500, date: '2023-06-10' },
  { id: '7', game: 'Math Quiz', player: 'Einstein', score: 95, date: '2023-06-09' },
  { id: '8', game: 'Reaction Time', player: 'QuickDraw', score: 125, date: '2023-06-08' },
];

export default function LeaderboardPage() {
  // Group by game
  const games = [...new Set(leaderboardData.map(entry => entry.game))];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Top scores from all games</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-700 p-4 font-medium text-gray-700 dark:text-gray-200">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Game</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-3 text-right">Score</div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {leaderboardData.map((entry, index) => (
            <div key={entry.id} className="grid grid-cols-12 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="col-span-1 font-medium text-gray-500 dark:text-gray-400">
                {index === 0 ? (
                  <span className="text-yellow-500"><FiStar className="inline-block" /></span>
                ) : (
                  index + 1
                )}
              </div>
              <div className="col-span-5 font-medium text-gray-900 dark:text-white">{entry.game}</div>
              <div className="col-span-3 text-gray-600 dark:text-gray-300">{entry.player}</div>
              <div className="col-span-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                {entry.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Top Players</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Player1', 'Gamer123', 'WordWizard'].map((player, index) => (
            <div key={player} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{player}</h3>
              <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center">
                <FiAward className="mr-1 text-yellow-500" />
                {index * 3 + 5} wins
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 text-center">
        <FiAward className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Play to Get on the Leaderboard!</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
          Challenge yourself and compete with players from around the world. The top scores will be displayed here.
        </p>
        <a
          href="/games"
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Play Now
        </a>
      </div>
    </div>
  );
}
