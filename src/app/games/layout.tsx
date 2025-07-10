import { ReactNode } from 'react';

export default function GamesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        All Games
      </h1>
      {children}
    </div>
  );
}
