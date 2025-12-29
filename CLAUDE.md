# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Love Particles is a high-performance, interactive heart particle animation web application optimized for mobile devices with touch support. It uses React 19 with TypeScript and Canvas 2D rendering to create a beautiful, animated heart-shaped particle system that responds to user interaction.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://0.0.0.0:3000)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Deployment

The project automatically deploys to GitHub Pages on push to the `main` branch. The CI/CD pipeline:
- Uses Node.js 22
- Runs `npm run build` to create the `./dist` directory
- Copies `dist/index.html` to `dist/404.html` for SPA routing
- Publishes to the `gh-pages` branch

## Architecture

### Entry Point Flow

[index.html](index.html) → [index.tsx](index.tsx) → [App.tsx](App.tsx) → Components

- **index.html**: Sets up import maps for React/ReactDOM from CDN (aistudiocdn.com), includes Tailwind CSS CDN
- **index.tsx**: Mounts React app with `ReactDOM.createRoot()`
- **App.tsx**: Full-screen container rendering [HeartCanvas](components/HeartCanvas.tsx) and [InstructionOverlay](components/InstructionOverlay.tsx)

### Core Component: HeartCanvas.tsx

This is the main animation engine. Key patterns:

**State Management**: Uses `useRef` extensively for performance-critical mutable state to avoid React re-renders. The animation loop stores canvas context, particles array, animation frame ID, time, and mouse/touch state in refs.

**Particle System**:
- 800-2000 particles based on screen size (mobile vs desktop)
- Heart shape using parametric equation: `x = 16 * sin^3(t)`, `y = -(13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))`
- Color distribution: 60% red (#ff0000), 30% pink (#ff99cc, #ea4c89), 10% white sparkles (#ffffff)

**Animation Loop**:
- `requestAnimationFrame` for smooth 60fps rendering
- Trail effect via semi-transparent clear (`rgba(0, 0, 0, 0.1)`)
- Heartbeat physics: sharp beat (`Math.pow(Math.sin(t), 50)`) + smooth breathing (`Math.sin(t * 2)`)
- Vibration effect using `Math.sin(time * 3 + particle.angle)`

**Interaction**:
- Supports both mouse and touch events
- Repulsion force within 180px radius of cursor/finger
- Force smoothing for natural ramp-up/ramp-down
- Touch events use `{ passive: false }` for better mobile control

**Performance Optimizations**:
- Canvas context with `{ alpha: false }` for no transparency overhead
- Device pixel ratio scaling for crisp high-DPI rendering
- Reduced particle count on mobile
- Responsive heart scale based on screen dimensions

### Configuration

**vite.config.ts**:
- Base path: `/love/` (GitHub Pages subdirectory)
- Dev server: port 3000, host 0.0.0.0
- Path alias: `@/*` maps to root directory

**tsconfig.json**:
- Target: ES2022, Module: ESNext
- JSX: react-jsx (new transform)
- Strict mode: NOT enabled
- No emit: Vite handles transpilation

**index.html**:
- React loaded from CDN via import maps (not npm bundles)
- Tailwind CSS via CDN
- `touch-action: none` on body for mobile canvas interactions
- `user-select: none` to prevent text selection on iOS

## Important Notes

- **No testing**: No unit tests, integration tests, or E2E tests configured
- **No linting**: No ESLint or Prettier setup
- **TypeScript strict mode is disabled**
- **Import maps**: React is loaded from aistudiocdn.com, not bundled from node_modules
- **Mobile-first**: Touch event handling is critical; use `{ passive: false }` for touch interactions
- **Canvas-centric**: Almost all visual logic is in the canvas animation loop, not React state
