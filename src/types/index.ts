import { ComponentType } from 'react';

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  category: string;
  component?: ComponentType;
}

export type GameCategory = 'puzzle' | 'arcade' | 'board' | 'word' | 'action' | 'all';
