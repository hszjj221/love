import React, { useState, useEffect } from 'react';
import { HeartCanvas } from './components/HeartCanvas';
import { InstructionOverlay } from './components/InstructionOverlay';
import { ControlPanel } from './components/ControlPanel';
import { ParticleConfig } from './types';
import { THEMES } from './themes';

const App: React.FC = () => {
  const [config, setConfig] = useState<ParticleConfig>({
    mode: 'heart',
    theme: THEMES[0],
    text: 'LOVE',
  });

  // Update background color when theme changes
  useEffect(() => {
    document.body.style.backgroundColor = config.theme.bgColor;
  }, [config.theme.bgColor]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: config.theme.bgColor }}
    >
      <HeartCanvas config={config} />
      <InstructionOverlay />
      <ControlPanel config={config} onConfigChange={setConfig} />
    </div>
  );
};

export default App;
