import Link from 'next/link';
import { FiArrowRight, FiAward, FiClock, FiGamepad, FiGlobe, FiUsers } from 'react-icons/fi';
import GameCard from '@/components/GameCard';

export default function Home() {
  const featuredGames = [
    {
      id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description: 'Classic two-player strategy game on a 3x3 grid',
      icon: '⭕',
      color: 'bg-blue-500',
      category: 'board',
      component: null as any,
    },
    {
      id: '2048',
      title: '2048',
      description: 'Slide tiles to combine them and reach 2048!',
      icon: '🔢',
      color: 'bg-yellow-500',
      category: 'puzzle',
      component: null as any,
    },
    {
      id: 'snake',
      title: 'Snake',
      description: 'Grow your snake by eating food, but don\'t hit the walls!',
      icon: '🐍',
      color: 'bg-green-500',
      category: 'arcade',
      component: null as any,
    },
  ];

  const features = [
    {
      icon: <FiGamepad className="w-8 h-8 text-indigo-500" />,
      title: '10+ Games',
      description: 'Wide variety of games to choose from',
    },
    {
      icon: <FiUsers className="w-8 h-8 text-indigo-500" />,
      title: 'Multiplayer',
      description: 'Play with friends on the same device',
    },
    {
      icon: <FiAward className="w-8 h-8 text-indigo-500" />,
      title: 'Leaderboards',
      description: 'Compete for the highest scores',
    },
    {
      icon: <FiGlobe className="w-8 h-8 text-indigo-500" />,
      title: 'Cross-platform',
      description: 'Play on any device',
    },
    {
      icon: <FiClock className="w-8 h-8 text-indigo-500" />,
      title: 'Quick Play',
      description: 'Jump right into the action',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          PlaySphere
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          A collection of fun and engaging games for all ages. Play, compete, and have fun!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/games"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 justify-center"
          >
            Play Now <FiArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#featured-games"
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Explore Games
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Games */}
      <section id="featured-games" className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Featured Games
          </h2>
          <Link
            href="/games"
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            View all games <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          Ready to Play?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of players enjoying our collection of fun and challenging games.
          No downloads required - play directly in your browser!
        </p>
        <Link
          href="/games"
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
        >
          Start Playing Now <FiArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
