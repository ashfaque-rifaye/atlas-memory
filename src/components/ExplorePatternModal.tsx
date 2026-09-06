import React, { useState } from 'react';
import { X, Sparkles, Send, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { PatternInsight } from '../types';

interface ExplorePatternModalProps {
  pattern: PatternInsight | null;
  onClose: () => void;
}

export const ExplorePatternModal: React.FC<ExplorePatternModalProps> = ({
  pattern,
  onClose,
}) => {
  if (!pattern) return null;

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    {
      role: 'model',
      content: `I've analyzed your reflections regarding "${pattern.title}". Notice how your frustration wasn't primarily driven by the number of hours you worked, but by the sensation of your dedication being invisible. When you look back at that meeting on September 6, what was the exact moment you felt that shift?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userText }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/explore-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern,
          messages: newHistory,
          userQuestion: userText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newHistory, { role: 'model', content: data.reply }]);
      } else {
        setMessages([
          ...newHistory,
          {
            role: 'model',
            content:
              'Notice how silence from leadership often gets interpreted as criticism in your mind. What boundary could you test this week to separate your self-worth from immediate praise?',
          },
        ]);
      }
    } catch {
      setMessages([
        ...newHistory,
        {
          role: 'model',
          content:
            'When we crave acknowledgment, we often withdraw into silence instead of speaking up. What would it feel like to share your progress proactively?',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#141416] text-[#E1E1E6] rounded-3xl max-w-2xl w-full h-[600px] flex flex-col shadow-2xl border border-[#242427] animate-in fade-in zoom-in-95 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242427] bg-[#1A1A1D] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Pattern Exploration
              </span>
              <span className="text-xs text-[#8E8E93] font-mono">Gemini Socratic Inquiry</span>
            </div>
            <h2 className="text-lg font-serif-display italic font-bold text-white">{pattern.title}</h2>
            <p className="text-xs text-[#8E8E93] italic">"{pattern.observation}"</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/5 text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialogue Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#0A0A0B]/60 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-[#8E8E93] uppercase font-semibold">
                <Compass className="w-3 h-3 text-violet-400" />
                <span>{m.role === 'user' ? 'You' : 'Gemini Companion'}</span>
              </div>
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed text-xs ${
                  m.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-xs shadow-lg shadow-violet-900/30'
                    : 'bg-[#1A1A1D] text-[#E1E1E6] border border-[#242427] rounded-tl-xs shadow-xl'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-[#8E8E93] italic bg-[#1A1A1D] p-2.5 rounded-xl border border-[#242427] w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
              <span>Gemini is synthesizing pattern inquiry...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-[#141416] border-t border-[#242427] flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts on this pattern..."
            className="flex-1 px-4 py-2.5 bg-[#1A1A1D] border border-[#2D2D31] rounded-xl text-xs text-white placeholder-[#8E8E93] focus:outline-hidden focus:border-violet-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors disabled:opacity-40 shadow-lg shadow-violet-900/30 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
