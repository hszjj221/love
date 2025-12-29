import { Theme } from './types';

export const THEMES: readonly Theme[] = [
  {
    id: 'love',
    name: '浪漫粉红',
    nameEn: 'Romantic Pink',
    colors: ['#8b0000', '#ff0000', '#ff99cc', '#ea4c89', '#ffffff'],
    bgColor: '#000000',
  },
  {
    id: 'ocean',
    name: '深邃星空',
    nameEn: 'Starry Night',
    colors: ['#0a1628', '#1e3a5f', '#2563eb', '#60a5fa', '#ffffff', '#fbbf24'],
    bgColor: '#050a14',
  },
  {
    id: 'forest',
    name: '森林秘境',
    nameEn: 'Forest Magic',
    colors: ['#14532d', '#166534', '#22c55e', '#86efac', '#ffffff', '#fde047'],
    bgColor: '#0a1f0f',
  },
  {
    id: 'sunset',
    name: '落日余晖',
    nameEn: 'Sunset Glow',
    colors: ['#7c2d12', '#ea580c', '#f97316', '#fbbf24', '#ffffff', '#fcd34d'],
    bgColor: '#1a0a05',
  },
  {
    id: 'lavender',
    name: '薰衣草',
    nameEn: 'Lavender Dream',
    colors: ['#4c1d95', '#7c3aed', '#a78bfa', '#c4b5fd', '#ffffff', '#f0abfc'],
    bgColor: '#0f0518',
  },
  {
    id: 'rainbow',
    name: '彩虹渐变',
    nameEn: 'Rainbow',
    colors: [
      '#ef4444',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#06b6d4',
      '#3b82f6',
      '#a855f7',
      '#ffffff',
    ],
    bgColor: '#000000',
  },
  {
    id: 'gold',
    name: '金色流光',
    nameEn: 'Golden Flow',
    colors: ['#78350f', '#b45309', '#d97706', '#fbbf24', '#fde68a', '#ffffff'],
    bgColor: '#0f0a05',
  },
  {
    id: 'mint',
    name: '薄荷清新',
    nameEn: 'Mint Fresh',
    colors: ['#064e3b', '#059669', '#10b981', '#6ee7b7', '#ffffff', '#ccfbf1'],
    bgColor: '#021c15',
  },
] as const;
