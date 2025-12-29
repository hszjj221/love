import React, { useRef, useEffect, useCallback } from 'react';
import { Particle, ParticleConfig } from '../types';
import { generateParticles } from '../utils/particleGenerator';

interface HeartCanvasProps {
  config: ParticleConfig;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

export const HeartCanvas: React.FC<HeartCanvasProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(true);
  const configRef = useRef(config);

  // Interaction state - using ref to avoid triggering re-renders
  const mouseRef = useRef<{ x: number; y: number; active: boolean; force: number }>({
    x: 0,
    y: 0,
    active: false,
    force: 0,
  });

  // Create regenerateParticles function with useCallback
  const regenerateParticles = useCallback(async () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const newParticles = await generateParticles(configRef.current.mode, {
      text: configRef.current.text,
      imageUrl: configRef.current.imageUrl,
      width,
      height,
      colors: configRef.current.theme.colors,
    });

    particlesRef.current = newParticles;
  }, []);

  // Update config ref when props change
  useEffect(() => {
    const previousMode = configRef.current.mode;
    const previousTheme = configRef.current.theme.id;
    const previousText = configRef.current.text;
    const previousImageUrl = configRef.current.imageUrl;

    configRef.current = config;

    // Regenerate particles if mode, theme, text, or image changed
    if (
      previousMode !== config.mode ||
      previousTheme !== config.theme.id ||
      previousText !== config.text ||
      previousImageUrl !== config.imageUrl
    ) {
      regenerateParticles();
    }
     
  }, [config, regenerateParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;
    const INTERACTION_RADIUS = 180;
    const INTERACTION_RADIUS_SQUARED = INTERACTION_RADIUS * INTERACTION_RADIUS;
    const FORCE_THRESHOLD = 0.01;

    // Initial setup
    const setupCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    // Debounced resize handler
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const resizeCanvas = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setupCanvas();
        regenerateParticles();
      }, 150);
    };

    // Handle page visibility - pause animation when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isAnimatingRef.current = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        isAnimatingRef.current = true;
        render();
      }
    };

    // Animation Loop
    const render = () => {
      if (!isAnimatingRef.current) return;

      // Clear with trail effect - use theme background color
      const bgColor = configRef.current.theme.bgColor || '#000000';
      ctx.fillStyle = `rgba(${hexToRgb(bgColor)}, 0.1)`;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Heartbeat Logic
      timeRef.current += 0.04;
      const beat = 0.15 * Math.pow(Math.sin(timeRef.current), 50);
      const breath = 0.05 * Math.sin(timeRef.current * 2);
      const scaleMultiplier = 1 + beat + breath;

      // Smooth force ramp up/down
      if (mouseRef.current.active) {
        mouseRef.current.force += (1 - mouseRef.current.force) * 0.1;
      } else {
        mouseRef.current.force += (0 - mouseRef.current.force) * 0.1;
      }

      // Update particle positions
      particlesRef.current.forEach((p) => {
        const targetX = cx + p.originX * scaleMultiplier;
        const targetY = cy + p.originY * scaleMultiplier;

        let dx = 0;
        let dy = 0;

        // Mouse interaction - use squared distance to avoid sqrt when possible
        if (mouseRef.current.force > FORCE_THRESHOLD) {
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          const distX = targetX - mx;
          const distY = targetY - my;
          const distSquared = distX * distX + distY * distY;

          if (distSquared < INTERACTION_RADIUS_SQUARED) {
            const dist = Math.sqrt(distSquared);
            const angle = Math.atan2(distY, distX);
            const force = (INTERACTION_RADIUS - dist) / INTERACTION_RADIUS;
            const push = force * 150 * mouseRef.current.force;
            dx = Math.cos(angle) * push;
            dy = Math.sin(angle) * push;
          }
        }

        // Add vibration for "alive" feeling
        const vibration = Math.sin(timeRef.current * 3 + p.angle) * 2;
        const finalTargetX = targetX + dx + vibration;
        const finalTargetY = targetY + dy + vibration;

        // Physics: ease out interpolation
        p.x += (finalTargetX - p.x) * 0.15;
        p.y += (finalTargetY - p.y) * 0.15;
      });

      // Batch draw particles by color for better performance
      const particlesByColor = new Map<string, Array<{ x: number; y: number; size: number }>>();

      particlesRef.current.forEach((p) => {
        const currentSize = p.size * scaleMultiplier;
        if (!particlesByColor.has(p.color)) {
          particlesByColor.set(p.color, []);
        }
        particlesByColor.get(p.color)!.push({ x: p.x, y: p.y, size: currentSize });
      });

      // Draw particles grouped by color
      particlesByColor.forEach((particles, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        particles.forEach((p) => {
          ctx.moveTo(p.x + p.size, p.y);
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        });
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    // Event Handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    const handleEnd = () => {
      mouseRef.current.active = false;
    };

    // Attach Events
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleEnd);

    // Initial Start
    setupCanvas();
    regenerateParticles().then(() => {
      render();
    });

    // Cleanup
    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleEnd);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [regenerateParticles]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};
