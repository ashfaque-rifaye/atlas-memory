import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, ArrowRight, Check, MapPin, Tag, Users, Calendar, BrainCircuit, BookmarkCheck, RefreshCw, MessageSquare } from 'lucide-react';
import { JournalMessage, StructuredMemory, JournalEntry, UserProfile } from '../types';
import { saveUserEntry } from '../lib/memoryService';

interface TodayChatProps {
  currentUser: UserProfile;
  onTrackDecision: (decisionData: { decision: string; reasoning: string; confidence: number; expectedOutcome: string }) => void;
  onEntrySaved: (entry: JournalEntry) => void;
}

export const TodayChat: React.FC<TodayChatProps> = ({
  currentUser,
  onTrackDecision,
  onEntrySaved,
}) => {
  const [messages, setMessages] = useState<JournalMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: 'Welcome to your reflection space. How are you really doing today? What is taking up the most space in your mind?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedMemory, setExtractedMemory] = useState<StructuredMemory | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [locationConsent, setLocationConsent] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('Bangalore');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Extract structured memories when 2 or more user messages exist
  const triggerMemoryExtraction = async (currentMessages: JournalMessage[]) => {
    setExtracting(true);
    try {
      const res = await fetch('/api/extract-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          title: 'Daily Reflection',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setExtractedMemory(data);
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: JournalMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userContext: `User: ${currentUser.displayName}, Scoped UID: ${currentUser.uid}`,
        }),
      });

      let replyContent = 'I am listening deeply. What else is arising for you?';
      if (res.ok) {
        const data = await res.json();
        replyContent = data.reply || replyContent;
      }

      const modelMsg: JournalMessage = {
        id: `mod-${Date.now()}`,
        role: 'model',
        content: replyContent,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...newMessages, modelMsg];
      setMessages(updatedHistory);

      // Automatically trigger memory extraction on the growing dialogue
      triggerMemoryExtraction(updatedHistory);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: JournalMessage = {
        id: `mod-fallback-${Date.now()}`,
        role: 'model',
        content: 'I hear the weight in what you are saying. Take a slow breath—when you reflect on that feeling, what core need feels unmet right now?',
        timestamp: new Date().toISOString(),
      };
      const updatedHistory = [...newMessages, fallbackMsg];
      setMessages(updatedHistory);
      triggerMemoryExtraction(updatedHistory);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToTimeline = () => {
    if (!extractedMemory && messages.length <= 1) return;

    const now = new Date().toISOString();
    const entryTitle = extractedMemory?.events?.[0]
      ? `${extractedMemory.events[0]} Reflection`
      : extractedMemory?.themes?.[0]
      ? `${extractedMemory.themes[0]} Reflection`
      : 'Evening Reflection';

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      userId: currentUser.uid,
      createdAt: now,
      title: entryTitle,
      messages: messages,
      summary: extractedMemory?.summary || messages.filter(m => m.role === 'user').map(m => m.content).join(' '),
      mood: extractedMemory?.mood || 'Thoughtful',
      moodScore: extractedMemory?.moodScore || 6,
      themes: extractedMemory?.themes || ['Daily Reflection'],
      people: extractedMemory?.people || [],
      events: extractedMemory?.events || [],
      location: locationConsent ? (extractedMemory?.location || userLocation) : null,
      goals: extractedMemory?.goals || [],
    };

    saveUserEntry(newEntry);
    onEntrySaved(newEntry);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        content: 'Starting fresh. What is on your mind right now?',
        timestamp: new Date().toISOString(),
      },
    ]);
    setExtractedMemory(null);
    setSaveSuccess(false);
  };

  const starterPrompts = [
    {
      title: 'Recognition & Frustration',
      text: 'I had a horrible meeting today. I feel like I am doing a lot but nobody notices.',
    },
    {
      title: 'Contemplating Exit',
      text: 'I think I am going to leave Project X. I feel stalled and undervalued.',
    },
    {
      title: 'New Environment',
      text: 'First day at the new workspace in Bangalore! The energy here is so energizing.',
    },
    {
      title: 'Manager Breakthrough',
      text: 'I think I finally understand what I need from my manager. It is strategic ownership.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242427] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif-display italic text-3xl sm:text-4xl text-white tracking-tight">Today’s Reflection</h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-medium">
              Private & Scoped to UID
            </span>
          </div>
          <p className="text-sm text-[#8E8E93] mt-1 max-w-xl">
            Talk to Gemini naturally. Your thoughts are privately transformed into structured memory, mood patterns, and actionable decisions behind the scenes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetConversation}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#E1E1E6] bg-[#141416] border border-[#242427] rounded-lg hover:bg-[#1A1A1D] transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#8E8E93]" />
            <span>New Reflection</span>
          </button>

          <button
            onClick={handleSaveToTimeline}
            disabled={messages.length <= 1}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-xs ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : messages.length <= 1
                ? 'bg-[#1A1A1D] text-[#8E8E93] border border-[#242427] cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-900/30'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Saved to Atlas!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4 text-violet-200" />
                <span>Save to Timeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Chat Conversation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[650px] bg-[#141416]/90 backdrop-blur-md rounded-2xl border border-[#242427] shadow-xl overflow-hidden">
          
          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#0A0A0B]/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                    {m.role === 'user' ? currentUser.displayName : 'Reflection Guide (Gemini)'}
                  </span>
                  <span className="text-[10px] text-[#8E8E93]/70 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-900/20'
                      : 'bg-[#1E1E21] border border-[#2D2D31] text-[#E1E1E6] rounded-tl-none shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-2">
                <div className="bg-[#1E1E21] border border-[#2D2D31] rounded-2xl rounded-tl-none p-3 px-4 shadow-2xs flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-xs text-[#8E8E93] italic">Gemini is reflecting with you...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 py-2.5 bg-[#0F0F11] border-t border-[#242427] overflow-x-auto flex items-center space-x-2">
              <span className="text-[11px] font-medium text-[#8E8E93] shrink-0">Try an example:</span>
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.text)}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-[#1A1A1D] border border-[#2D2D31] text-[#E1E1E6] hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 sm:p-4 bg-[#141416] border-t border-[#242427]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                id="input-reflection-message"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What happened today? How are you really feeling?..."
                className="flex-1 bg-[#1A1A1D] border border-[#2D2D31] rounded-xl px-4 py-2.5 text-sm text-[#E1E1E6] placeholder-[#8E8E93] focus:outline-hidden focus:border-violet-500 transition-all"
                disabled={loading}
              />
              <button
                id="btn-send-reflection"
                type="submit"
                disabled={!input.trim() || loading}
                className={`p-2.5 rounded-xl transition-all ${
                  input.trim() && !loading
                    ? 'bg-white hover:bg-zinc-200 text-black shadow-xs'
                    : 'bg-[#1A1A1D] text-[#8E8E93] cursor-not-allowed border border-[#242427]'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Right: Live Structured Memory Extraction Pipeline (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          <div className="bg-[#141416]/90 backdrop-blur-md rounded-2xl border border-[#242427] p-5 shadow-xl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#242427] pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Extracted Structured Memory</h3>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                extracting ? 'bg-violet-900/40 text-violet-300 border border-violet-500/30 animate-pulse' : 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
              }`}>
                {extracting ? 'Extracting...' : 'Real-time Pipeline'}
              </span>
            </div>

            {/* Content Preview */}
            {extractedMemory ? (
              <div className="space-y-4">
                
                {/* Mood & Intensity */}
                <div className="bg-[#1A1A1D] rounded-xl p-3.5 border border-[#242427]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Detected Mood</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-500/30 font-mono">
                      Intensity {extractedMemory.moodScore}/10
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-serif-display italic font-bold text-white">{extractedMemory.mood}</span>
                    {/* Intensity Bar */}
                    <div className="w-32 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${extractedMemory.moodScore * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                    Psychological Reflection Summary
                  </span>
                  <p className="text-xs text-[#E1E1E6] leading-relaxed bg-[#1A1A1D] p-3 rounded-xl border border-[#242427]">
                    "{extractedMemory.summary}"
                  </p>
                </div>

                {/* Themes, People, Events */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#1A1A1D] border border-[#242427]">
                    <div className="flex items-center space-x-1 text-[#8E8E93] font-medium mb-1">
                      <Tag className="w-3 h-3 text-violet-400" />
                      <span>Themes</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {extractedMemory.themes.length > 0 ? (
                        extractedMemory.themes.map((t, idx) => (
                          <span key={idx} className="bg-violet-900/40 text-violet-300 border border-violet-500/20 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#8E8E93] italic">None detected</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#1A1A1D] border border-[#242427]">
                    <div className="flex items-center space-x-1 text-[#8E8E93] font-medium mb-1">
                      <Users className="w-3 h-3 text-indigo-400" />
                      <span>People</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {extractedMemory.people.length > 0 ? (
                        extractedMemory.people.map((p, idx) => (
                          <span key={idx} className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#8E8E93] italic">Self</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Events & Location */}
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#1A1A1D] border border-[#242427]">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8E8E93]" />
                    <span className="text-[#E1E1E6]">
                      {extractedMemory.events[0] || 'Unstructured Reflection'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[#8E8E93]">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{extractedMemory.location || userLocation || 'Unspecified'}</span>
                  </div>
                </div>

                {/* POTENTIAL DECISION DETECTED - Killer Loop */}
                {extractedMemory.potentialDecisions && extractedMemory.potentialDecisions.length > 0 && (
                  <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-500/30 shadow-xs animate-in fade-in">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5 text-violet-300 font-semibold text-xs mb-1">
                          <AlertCircle className="w-4 h-4 text-violet-400 shrink-0" />
                          <span>Potential Decision Detected</span>
                        </div>
                        <p className="text-xs text-white font-medium mb-1">
                          "{extractedMemory.potentialDecisions[0].decision}"
                        </p>
                        <p className="text-[11px] text-[#8E8E93] line-clamp-2">
                          Why: {extractedMemory.potentialDecisions[0].reasoning}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-violet-500/20 pt-2.5">
                      <span className="text-[11px] text-violet-300 font-medium font-mono">
                        Confidence: {extractedMemory.potentialDecisions[0].confidence}%
                      </span>
                      <button
                        onClick={() => onTrackDecision(extractedMemory.potentialDecisions[0])}
                        className="flex items-center space-x-1 px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <span>Track in Ledger</span>
                        <ArrowRight className="w-3 h-3 text-violet-200" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-violet-400">
                  <Sparkles className="w-5 h-5 text-violet-400/80" />
                </div>
                <p className="text-xs font-medium text-white mb-1">No metadata extracted yet</p>
                <p className="text-[11px] text-[#8E8E93] max-w-xs mx-auto">
                  Type your reflection or click one of the quick prompts. Gemini will extract mood, people, themes, and decisions.
                </p>
              </div>
            )}

          </div>

          {/* Location & Consent Setting */}
          <div className="bg-[#141416]/90 backdrop-blur-md rounded-2xl border border-[#242427] p-4 shadow-xs text-xs text-[#8E8E93]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Optional Location Tagging</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={locationConsent}
                  onChange={(e) => setLocationConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-[#242427] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
            <p className="text-[11px] text-[#8E8E93] mb-2">
              Location is strictly optional and requires explicit consent per Security Constitution Rule #11.
            </p>
            {locationConsent && (
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-[#8E8E93]">Current place:</span>
                <input
                  type="text"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  placeholder="e.g. Bangalore, Office, Home"
                  className="flex-1 px-2.5 py-1 bg-[#1A1A1D] border border-[#2D2D31] rounded-md text-xs text-white"
                />
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
