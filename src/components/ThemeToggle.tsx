'use client';

import { useTheme } from './ThemeProvider';
import { FiSun, FiMoon } from 'react-icons/fi';
import { MotionDiv } from './motion/MotionDiv';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <MotionDiv
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? (
          <FiSun className="h-5 w-5" />
        ) : (
          <FiMoon className="h-5 w-5" />
        )}
      </button>
    </MotionDiv>
  );
}
