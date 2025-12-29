import { Particle } from '../types';

const random = (min: number, max: number): number => Math.random() * (max - min) + min;

// Heart shape particle generation
export const generateHeartParticles = (
  width: number,
  height: number,
  colors: readonly string[]
): Particle[] => {
  const particles: Particle[] = [];
  const isMobile = width < 768;
  const particleCount = isMobile ? 800 : 2000;
  const heartScale = Math.min(width, height) / (isMobile ? 35 : 45);

  for (let i = 0; i < particleCount; i++) {
    const t = Math.random() * Math.PI * 2;
    let dr = random(0.6, 1.2);

    if (Math.random() < 0.6) {
      dr = random(0.9, 1.1);
    }

    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

    const originX = x * heartScale * dr;
    const originY = y * heartScale * dr;

    const color = colors[Math.floor(Math.random() * colors.length)];

    particles.push({
      x: originX,
      y: originY,
      originX,
      originY,
      size: random(1, isMobile ? 2 : 3),
      color,
      angle: random(0, Math.PI * 2),
    });
  }

  return particles;
};

// Text shape particle generation
export const generateTextParticles = (
  text: string,
  width: number,
  height: number,
  colors: readonly string[]
): Particle[] => {
  const particles: Particle[] = [];
  const isMobile = width < 768;

  // Create offscreen canvas for text rendering
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return generateHeartParticles(width, height, colors);

  // Calculate font size based on screen size
  const fontSize = Math.min(width / (text.length * 0.6), isMobile ? 120 : 200);
  const font = `bold ${fontSize}px Arial, sans-serif`;

  // Set canvas size
  canvas.width = width;
  canvas.height = height;

  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Sample pixels to create particles
  const gap = isMobile ? 4 : 3; // Sampling gap
  const centerX = width / 2;
  const centerY = height / 2;

  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      // If pixel is visible (part of text)
      if (alpha > 128) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const originX = x - centerX;
        const originY = y - centerY;

        particles.push({
          x: originX,
          y: originY,
          originX,
          originY,
          size: random(1, isMobile ? 2 : 2.5),
          color,
          angle: random(0, Math.PI * 2),
        });
      }
    }
  }

  // Limit particle count for performance
  const maxParticles = isMobile ? 1500 : 3000;
  if (particles.length > maxParticles) {
    // Randomly sample to limit count
    const sampled: Particle[] = [];
    const step = particles.length / maxParticles;
    for (let i = 0; i < maxParticles; i++) {
      sampled.push(particles[Math.floor(i * step)]);
    }
    return sampled;
  }

  return particles;
};

// Image shape particle generation
export const generateImageParticles = async (
  imageUrl: string,
  width: number,
  height: number,
  colors: readonly string[]
): Promise<Particle[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const particles: Particle[] = [];
      const isMobile = width < 768;

      // Create canvas for image processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(generateHeartParticles(width, height, colors));
        return;
      }

      // Calculate image size to fit screen while maintaining aspect ratio
      const scale = Math.min((width * 0.7) / img.width, (height * 0.7) / img.height);
      const imgWidth = img.width * scale;
      const imgHeight = img.height * scale;

      canvas.width = width;
      canvas.height = height;

      // Draw image centered
      const startX = (width - imgWidth) / 2;
      const startY = (height - imgHeight) / 2;
      ctx.drawImage(img, startX, startY, imgWidth, imgHeight);

      // Get pixel data for the image area
      const imageData = ctx.getImageData(
        Math.floor(startX),
        Math.floor(startY),
        Math.floor(imgWidth),
        Math.floor(imgHeight)
      );
      const data = imageData.data;

      // Sample pixels to create particles
      const gap = isMobile ? 4 : 3;
      const centerX = width / 2;
      const centerY = height / 2;

      for (let y = 0; y < imgHeight; y += gap) {
        for (let x = 0; x < imgWidth; x += gap) {
          const index = (y * Math.floor(imgWidth) + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          // If pixel is visible
          if (a > 50) {
            // Use image color or theme color
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            let color: string;

            if (brightness > 200) {
              color = colors[Math.floor(Math.random() * colors.length)];
            } else {
              // Use a darkened version of image color or theme colors
              color = `rgb(${r}, ${g}, ${b})`;
            }

            const originX = startX + x - centerX;
            const originY = startY + y - centerY;

            particles.push({
              x: originX,
              y: originY,
              originX,
              originY,
              size: random(1, isMobile ? 2 : 2.5),
              color,
              angle: random(0, Math.PI * 2),
            });
          }
        }
      }

      // Limit particle count
      const maxParticles = isMobile ? 2000 : 4000;
      const finalParticles =
        particles.length > maxParticles
          ? particles.filter((_, i) => i % Math.ceil(particles.length / maxParticles) === 0)
          : particles;

      resolve(finalParticles);
    };

    img.onerror = () => {
      // Fallback to heart particles if image fails to load
      resolve(generateHeartParticles(width, height, colors));
    };

    img.src = imageUrl;
  });
};

export const generateParticles = async (
  mode: 'heart' | 'text' | 'image',
  params: {
    text?: string;
    imageUrl?: string;
    width: number;
    height: number;
    colors: readonly string[];
  }
): Promise<Particle[]> => {
  switch (mode) {
    case 'heart':
      return generateHeartParticles(params.width, params.height, params.colors);
    case 'text':
      return generateTextParticles(
        params.text || 'LOVE',
        params.width,
        params.height,
        params.colors
      );
    case 'image':
      if (!params.imageUrl) {
        return generateHeartParticles(params.width, params.height, params.colors);
      }
      return generateImageParticles(params.imageUrl, params.width, params.height, params.colors);
  }
};
