export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  category: string;
  component: React.ComponentType;
}

export type GameCategory = 'puzzle' | 'arcade' | 'board' | 'word' | 'action' | 'all';
