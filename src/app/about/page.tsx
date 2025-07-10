import { FiCode, FiHeart, FiUsers, FiZap } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About PlaySphere</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Bringing fun and engaging games to players of all ages
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-4">
            PlaySphere was born out of a passion for classic games and modern web technologies. 
            Our mission is to create a collection of fun, engaging, and accessible games that 
            anyone can enjoy for free, right in their web browser.
          </p>
          <p>
            Whether you're looking to kill some time, challenge your brain, or compete with friends, 
            PlaySphere has something for everyone. Our games are designed to be simple to learn 
            but hard to master, providing endless hours of entertainment.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
            <FiZap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Instant Play</h3>
          <p className="text-gray-600 dark:text-gray-300">
            No downloads or installations required. Play instantly in your browser on any device.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
            <FiUsers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">For Everyone</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Games for all ages and skill levels. Simple enough for kids, challenging enough for adults.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
            <FiCode className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Open Source</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Built with modern web technologies. Check out our code and contribute on GitHub.
          </p>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Join Our Community</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect with other players, suggest new games, and stay updated on the latest features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Follow on Twitter
            </a>
            <a
              href="#"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Made with <FiHeart className="inline text-red-500" /> by the PlaySphere Team
        </p>
        <p className="text-sm text-gray-400 mt-2">
          © {new Date().getFullYear()} PlaySphere. All rights reserved.
        </p>
      </div>
    </div>
  );
}
