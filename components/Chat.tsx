import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, SparklesIcon } from './IconComponents';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
  repoContext: string;
  onSendMessage: (message: string) => Promise<string>;
}

export const Chat: React.FC<ChatProps> = ({ isOpen, onClose, repoName, repoContext, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI assistant for **${repoName}**. Ask me anything about this repository - features, setup, code structure, or how to use it!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await onSendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-pink-500" />
          <h3 className="font-bold text-white">Ask about {repoName}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white'
                  : 'bg-slate-800 text-slate-200'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose-chat text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-lg transition-all duration-300"
          >
            Send
          </button>
        </div>
      </form>

      <style>{`
        .prose-chat { color: #f1f5f9; line-height: 1.6; }
        .prose-chat p { margin-bottom: 0.5em; }
        .prose-chat strong { color: #ffffff; font-weight: 600; }
        .prose-chat code { background-color: #374151; color: #f9a8d4; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.875em; }
        .prose-chat ul, .prose-chat ol { margin: 0.5em 0; padding-left: 1.5em; }
        .prose-chat li { margin-bottom: 0.25em; }
      `}</style>
    </div>
  );
};
