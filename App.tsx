import React from 'react';
import { HeartCanvas } from './components/HeartCanvas';
import { InstructionOverlay } from './components/InstructionOverlay';

const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <HeartCanvas />
      <InstructionOverlay />
    </div>
  );
};

export default App;