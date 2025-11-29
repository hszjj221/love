import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  velocity: number;
  angle: number;
}

// Helper to generate a random number in range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// The Heart Curve Equation
// x = 16 sin^3(t)
// y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
const getHeartPosition = (t: number, scale: number) => {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t)
  );
  return { x: x * scale, y: y * scale };
};

export const HeartCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // Interaction state
  // Using a ref to store mutable state without triggering re-renders
  const mouseRef = useRef<{ x: number; y: number; active: boolean; force: number }>({
    x: 0,
    y: 0,
    active: false,
    force: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on base
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    // Initialize Canvas Size with DPR for crisp text/shapes on mobile
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Scale context to match DPR
      ctx.scale(dpr, dpr);
      
      initParticles();
    };

    // Initialize Particles
    const initParticles = () => {
      const particles: Particle[] = [];
      // Adjust particle count based on screen size for performance
      const isMobile = width < 768;
      const particleCount = isMobile ? 800 : 2000;
      
      // Scale heart based on screen min dimension
      // Slightly larger on mobile relative to screen width to fill space
      const heartScale = Math.min(width, height) / (isMobile ? 35 : 45); 

      for (let i = 0; i < particleCount; i++) {
        // Distribute points along the heart curve
        const t = Math.random() * Math.PI * 2;
        
        // Jitter helps make the heart look "fuzzy" and full
        // 1.0 is the edge, < 1.0 is inside
        // We want a dense edge and a sparse interior
        let dr = random(0.6, 1.2); 
        
        // Concentrate more particles near the edge (dr ~ 1)
        if (Math.random() < 0.6) {
           dr = random(0.9, 1.1);
        }

        const pos = getHeartPosition(t, heartScale * dr);
        
        const originX = pos.x;
        const originY = pos.y;

        // Colors
        // 60% Red (#ff0000), 30% Pink (#ff5ca8), 10% White (#ffffff)
        const shade = Math.random();
        let color = '#ea4c89'; // Default pinkish red
        if (shade > 0.9) color = '#ffffff'; // Sparkle
        else if (shade > 0.6) color = '#ff99cc'; // Light pink
        else if (shade > 0.3) color = '#ff0000'; // Deep red
        else color = '#8b0000'; // Dark red for depth

        particles.push({
          x: originX, // Initial spawn at center (will fly out)
          y: originY,
          originX,
          originY,
          size: random(1, isMobile ? 2 : 3),
          color,
          velocity: random(0.5, 2),
          angle: random(0, Math.PI * 2),
        });
      }
      particlesRef.current = particles;
    };

    // Animation Loop
    const render = () => {
      // Clear with trail effect
      // Use fillRect with low opacity to create trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Heartbeat Logic
      timeRef.current += 0.04;
      
      // Heartbeat function: fast expansion, slow contraction
      // Math.pow(Math.sin(t), 30) creates a sharp "lub-dub" spike
      const beat = 0.15 * Math.pow(Math.sin(timeRef.current), 50); 
      // Secondary smooth breathing
      const breath = 0.05 * Math.sin(timeRef.current * 2);
      
      const scaleMultiplier = 1 + beat + breath;

      // Mouse Interaction Force Smoothing
      // Smoothly ramp up/down the interaction force
      if (mouseRef.current.active) {
        mouseRef.current.force += (1 - mouseRef.current.force) * 0.1;
      } else {
        mouseRef.current.force += (0 - mouseRef.current.force) * 0.1;
      }

      particlesRef.current.forEach((p) => {
        // Calculate Target Position (The Heart Shape)
        // We apply the beat scale to the origin coordinates
        const targetX = cx + p.originX * scaleMultiplier;
        const targetY = cy + p.originY * scaleMultiplier;

        // Particle Interaction Logic
        let dx = 0;
        let dy = 0;

        // If mouse/touch is active (or force is still fading out)
        if (mouseRef.current.force > 0.01) {
          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;
          
          const distX = targetX - mx;
          const distY = targetY - my;
          const dist = Math.sqrt(distX * distX + distY * distY);
          
          // Interaction Radius
          const radius = 180; 
          
          if (dist < radius) {
            // Calculate repulsion
            // The closer the mouse, the stronger the push
            const angle = Math.atan2(distY, distX);
            const force = (radius - dist) / radius; // 0 to 1
            
            // Push away
            const push = force * 150 * mouseRef.current.force;
            dx = Math.cos(angle) * push;
            dy = Math.sin(angle) * push;
          }
        }

        // Add intrinsic vibration/noise for "alive" feeling
        const vibration = Math.sin(timeRef.current * 3 + p.angle);
        
        const finalTargetX = targetX + dx;
        const finalTargetY = targetY + dy;

        // Physics: Interpolate current position to target position
        // "Ease out" effect
        p.x += (finalTargetX - p.x) * 0.15;
        p.y += (finalTargetY - p.y) * 0.15;

        // Draw Particle
        ctx.beginPath();
        // Adjust size slightly based on beat for pulsing effect
        const currentSize = p.size * scaleMultiplier;
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
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
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    
    // Passive false is important for some touch interactions, 
    // though here we don't preventDefault globally to avoid breaking browser UI unless needed
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleEnd);

    // Initial Start
    resizeCanvas();
    render();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
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
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};