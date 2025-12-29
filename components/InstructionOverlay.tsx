import React, { useEffect, useState } from 'react';

export const InstructionOverlay: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-1000 z-50 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center select-none bg-black/30 p-4 rounded-xl backdrop-blur-sm">
        <h1 className="text-pink-500 text-3xl md:text-4xl font-light tracking-[0.2em] animate-pulse drop-shadow-lg">
          TOUCH ME
        </h1>
        <p className="text-pink-200 text-sm mt-3 opacity-80 font-light tracking-wide">
          轻触屏幕 (Tap or Drag)
        </p>
      </div>
    </div>
  );
};
