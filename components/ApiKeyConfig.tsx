import React, { useState } from 'react';
import { XMarkIcon, KeyIcon, CheckCircleIcon } from './IconComponents';

interface ApiKeyConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: { gemini?: string; groq?: string; openai?: string }) => void;
  currentKeys: { gemini?: string; groq?: string; openai?: string };
}

export const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ isOpen, onClose, onSave, currentKeys }) => {
  const [geminiKey, setGeminiKey] = useState(currentKeys.gemini || '');
  const [groqKey, setGroqKey] = useState(currentKeys.groq || '');
  const [openaiKey, setOpenaiKey] = useState(currentKeys.openai || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const keys = {
      gemini: geminiKey.trim() || undefined,
      groq: groqKey.trim() || undefined,
      openai: openaiKey.trim() || undefined
    };
    
    // Check if at least one key is provided
    if (!keys.gemini && !keys.groq && !keys.openai) {
      alert('Please enter at least one API key');
      return;
    }
    
    onSave(keys);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <KeyIcon className="h-6 w-6 text-pink-500" />
            Configure API Keys
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Google Gemini API Key <span className="text-green-400">(Free, Recommended)</span>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 hover:underline mt-1 inline-block">
              Get your key →
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Groq API Key <span className="text-green-400">(Free)</span>
            </label>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 hover:underline mt-1 inline-block">
              Get your key →
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              OpenAI API Key <span className="text-yellow-400">(Paid)</span>
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 hover:underline mt-1 inline-block">
              Get your key →
            </a>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-300 mb-2">
            <strong className="text-white">Note:</strong> Keys are stored in your browser's local storage and never sent to any server except the respective AI provider.
          </p>
          <p className="text-xs text-slate-400">
            Keys will be validated when you make your first analysis. If a key is invalid, you'll see an error message.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Saved!
              </>
            ) : (
              'Save Keys'
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
