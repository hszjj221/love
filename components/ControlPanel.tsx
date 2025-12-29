import React, { useState, useRef } from 'react';
import { DisplayMode, Theme, ParticleConfig } from '../types';
import { THEMES } from '../themes';

interface ControlPanelProps {
  config: ParticleConfig;
  onConfigChange: (config: ParticleConfig) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'mode' | 'theme'>('mode');
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (mode: DisplayMode) => {
    if (mode === 'text' && !inputText.trim()) {
      setInputText('LOVE');
    }
    onConfigChange({ ...config, mode, text: inputText || 'LOVE' });
  };

  const handleThemeChange = (theme: Theme) => {
    onConfigChange({ ...config, theme });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onConfigChange({ ...config, mode: 'image', imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (config.mode === 'text') {
      onConfigChange({ ...config, text: text || 'LOVE' });
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-300"
        aria-label="Toggle controls"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
          )}
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`fixed top-4 right-16 z-40 w-72 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('mode')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'mode'
                ? 'text-pink-400 border-b-2 border-pink-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            模式 Mode
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'theme'
                ? 'text-pink-400 border-b-2 border-pink-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            主题 Theme
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === 'mode' ? (
            <div className="space-y-3">
              {/* Mode Selection */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">显示模式</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['heart', 'text', 'image'] as DisplayMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleModeChange(mode)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                        config.mode === mode
                          ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {mode === 'heart' ? '爱心' : mode === 'text' ? '文字' : '图片'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              {config.mode === 'text' && (
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">输入文字</label>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="输入文字..."
                    maxLength={10}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              )}

              {/* Image Upload */}
              {config.mode === 'image' && (
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">上传图片</label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 bg-white/5 border border-dashed border-white/20 rounded-lg text-gray-300 text-sm hover:bg-white/10 hover:border-pink-500/50 transition-all"
                  >
                    {config.imageUrl ? '更换图片' : '选择图片...'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {config.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={config.imageUrl}
                        alt="Preview"
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">颜色主题</label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme)}
                    className={`relative p-3 rounded-lg transition-all ${
                      config.theme.id === theme.id
                        ? 'ring-2 ring-pink-500 bg-white/10'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {/* Color Preview */}
                    <div className="flex mb-2">
                      {theme.colors.slice(0, 6).map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-2 rounded-l first:rounded-l last:rounded-r"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="text-left">
                      <div className="text-white text-xs font-medium">{theme.name}</div>
                      <div className="text-gray-500 text-[10px]">{theme.nameEn}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
