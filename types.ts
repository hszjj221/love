export type DisplayMode = 'heart' | 'text' | 'image';

export interface Theme {
  id: string;
  name: string;
  nameEn: string;
  colors: readonly string[];
  bgColor: string;
}

export interface ParticleConfig {
  mode: DisplayMode;
  theme: Theme;
  text?: string;
  imageUrl?: string;
  vibrationIntensity?: number;
}

export interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  angle: number;
}
