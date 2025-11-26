import React, { useState } from 'react';
import { XMarkIcon, KeyIcon, CheckCircleIcon } from './IconComponents';

interface ApiKeyConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: { gemini?: string; groq?: string; openai?: string }) => void;
  currentKeys: { gemini?: string; groq?: string; openai?: string };
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ isOpen, onClose, onSave, currentKeys }) => {
  const [geminiKey, setGeminiKey] = useState(currentKeys.gemini || '');
  const [groqKey, setGroqKey] = useState(currentKeys.groq || '');
  const [openaiKey, setOpenaiKey] = useState(currentKeys.openai || '');
  const [saved, setSaved] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<ValidationStatus>('idle');
  const [groqStatus, setGroqStatus] = useState<ValidationStatus>('idle');
  const [openaiStatus, setOpenaiStatus] = useState<ValidationStatus>('idle');

  const validateGemini = async () => {
    if (!geminiKey.trim()) return;
    setGeminiStatus('validating');
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });
      await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'test',
        config: { responseMimeType: 'application/json' }
      });
      setGeminiStatus('valid');
    } catch {
      setGeminiStatus('invalid');
    }
  };

  const validateGroq = async () => {
    if (!groqKey.trim()) return;
    setGroqStatus('validating');
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        })
      });
      setGroqStatus(response.ok ? 'valid' : 'invalid');
    } catch {
      setGroqStatus('invalid');
    }
  };

  const validateOpenAI = async () => {
    if (!openaiKey.trim()) return;
    setOpenaiStatus('validating');
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        })
      });
      setOpenaiStatus(response.ok ? 'valid' : 'invalid');
    } catch {
      setOpenaiStatus('invalid');
    }
  };

  const ValidationIcon = ({ status }: { status: ValidationStatus }) => {
    if (status === 'idle') return (
      <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
    if (status === 'validating') return (
      <svg className="h-5 w-5 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    );
    if (status === 'valid') return (
      <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    return (
      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

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
            <div className="flex gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => { setGeminiKey(e.target.value); setGeminiStatus('idle'); }}
                placeholder="AIza..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={validateGemini}
                disabled={!geminiKey.trim() || geminiStatus === 'validating'}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Validate API key"
              >
                <ValidationIcon status={geminiStatus} />
              </button>
            </div>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 hover:underline mt-1 inline-block">
              Get your key →
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Groq API Key <span className="text-green-400">(Free)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={groqKey}
                onChange={(e) => { setGroqKey(e.target.value); setGroqStatus('idle'); }}
                placeholder="gsk_..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={validateGroq}
                disabled={!groqKey.trim() || groqStatus === 'validating'}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Validate API key"
              >
                <ValidationIcon status={groqStatus} />
              </button>
            </div>
            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 hover:underline mt-1 inline-block">
              Get your key →
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              OpenAI API Key <span className="text-yellow-400">(Paid)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => { setOpenaiKey(e.target.value); setOpenaiStatus('idle'); }}
                placeholder="sk-..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={validateOpenAI}
                disabled={!openaiKey.trim() || openaiStatus === 'validating'}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Validate API key"
              >
                <ValidationIcon status={openaiStatus} />
              </button>
            </div>
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
