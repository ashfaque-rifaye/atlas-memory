import React, { useState } from 'react';
import { Sparkles, Calendar, TrendingUp, Quote, AlertTriangle, ArrowRight, Compass, RefreshCw, Filter, Heart, MessageSquare } from 'lucide-react';
import { JournalEntry, LifeRewindReport, PatternInsight, UserProfile } from '../types';

interface LifeRewindViewProps {
  currentUser: UserProfile;
  entries: JournalEntry[];
  onExplorePattern: (pattern: PatternInsight) => void;
}

export const LifeRewindView: React.FC<LifeRewindViewProps> = ({
  currentUser,
  entries,
  onExplorePattern,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('September 2026');
  const [selectedTheme, setSelectedTheme] = useState<string>('Work');
  const [generating, setGenerating] = useState<boolean>(false);
  const [rewindData, setRewindData] = useState<LifeRewindReport | null>(null);

  const handleGenerateRewind = async () => {
    setGenerating(true);
    try {
      // Filter entries based on period / theme
      let filtered = [...entries];
      if (selectedTheme !== 'All') {
        filtered = filtered.filter(e => e.themes.some(t => t.toLowerCase().includes(selectedTheme.toLowerCase())));
      }

      const res = await fetch('/api/generate-rewind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: selectedPeriod,
          filterTheme: selectedTheme !== 'All' ? selectedTheme : undefined,
          entries: filtered.length > 0 ? filtered : entries,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRewindData({
          ...data,
          id: `rewind-${Date.now()}`,
          userId: currentUser.uid,
          period: selectedPeriod,
          filterTheme: selectedTheme !== 'All' ? selectedTheme : undefined,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Rewind generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Auto-generate initial rewind for September 2026 on first load if null
  React.useEffect(() => {
    if (!rewindData && entries.length > 0) {
      handleGenerateRewind();
    }
  }, [currentUser.uid]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Rewind Header & Control Panel */}
      <div className="bg-[#141416]/90 backdrop-blur-md text-[#E1E1E6] rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl border border-[#242427]">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Interactive Memory Rewind</span>
            </div>
            <h1 className="font-serif-display italic text-3xl sm:text-5xl tracking-tight text-white font-normal">
              Life Rewind
            </h1>
            <p className="text-sm sm:text-base text-[#8E8E93] mt-2 max-w-2xl leading-relaxed">
              Synthesizing emotional arcs, recurring behaviors, and subterranean cognitive patterns across your personal journal dataset.
            </p>
          </div>

          {/* Filters & Trigger */}
          <div className="flex flex-wrap items-center gap-2 bg-[#1A1A1D] p-2 rounded-2xl border border-[#2D2D31]">
            
            {/* Period Selector */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#141416] rounded-xl border border-[#242427] text-xs">
              <Calendar className="w-3.5 h-3.5 text-violet-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white focus:outline-hidden cursor-pointer"
              >
                <option value="September 2026" className="bg-[#141416] text-white">September 2026</option>
                <option value="Last 30 Days" className="bg-[#141416] text-white">Last 30 Days</option>
                <option value="Last 7 Days" className="bg-[#141416] text-white">Last 7 Days</option>
                <option value="Q3 2026" className="bg-[#141416] text-white">Q3 2026</option>
              </select>
            </div>

            {/* Theme Filter */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#141416] rounded-xl border border-[#242427] text-xs">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="bg-transparent text-white focus:outline-hidden cursor-pointer"
              >
                <option value="Work" className="bg-[#141416] text-white">Theme: Work</option>
                <option value="All" className="bg-[#141416] text-white">All Themes</option>
                <option value="Recognition" className="bg-[#141416] text-white">Recognition</option>
                <option value="Health" className="bg-[#141416] text-white">Health & Sleep</option>
                <option value="Personal Growth" className="bg-[#141416] text-white">Personal Growth</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              id="btn-generate-rewind"
              onClick={handleGenerateRewind}
              disabled={generating}
              className="flex items-center space-x-2 px-4 py-2 bg-violet-600 text-white font-semibold text-xs rounded-xl hover:bg-violet-500 transition-all disabled:opacity-50 shadow-lg shadow-violet-900/30 cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                  <span>Generate Rewind</span>
                </>
              )}
            </button>

          </div>
        </div>

      </div>

      {/* Rewind Content Display */}
      {rewindData ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          
          {/* Main Title & Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-[#141416]/90 backdrop-blur-md rounded-2xl p-5 border border-[#242427] shadow-xl">
              <span className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                Total Reflections
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-serif-display italic font-bold text-white">{rewindData.totalReflections || entries.length}</span>
                <span className="text-xs text-[#8E8E93]">entries recorded</span>
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-2">Captured across {selectedPeriod}</p>
            </div>

            <div className="bg-[#141416]/90 backdrop-blur-md rounded-2xl p-5 border border-[#242427] shadow-xl">
              <span className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                Dominant Mood
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-serif-display italic font-bold text-white">{rewindData.dominantMood || 'Frustration'}</span>
              </div>
              <p className="text-[11px] text-rose-400 font-medium mt-2">Frequent early in the period</p>
            </div>

            <div className="bg-[#141416]/90 backdrop-blur-md rounded-2xl p-5 border border-[#242427] shadow-xl">
              <span className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                Average Mood Score
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-serif-display italic font-bold text-white">{rewindData.averageMoodScore || '4.8'}</span>
                <span className="text-xs text-[#8E8E93]">/ 10</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium mt-2">Shifted +3.5 pts after Sep 18</p>
            </div>

            <div className="bg-[#141416]/90 backdrop-blur-md rounded-2xl p-5 border border-[#242427] shadow-xl">
              <span className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                Inflection Milestone
              </span>
              <div className="text-xs font-medium text-[#E1E1E6] leading-snug">
                {rewindData.moodImprovementMilestone || 'Your mood improved significantly after September 18.'}
              </div>
            </div>

          </div>

          {/* THE HIGHLIGHT: Pattern Detected & Interactive Exploration */}
          {rewindData.patternDetected && (
            <div className="bg-gradient-to-br from-[#1A162B] via-[#141416] to-[#1D182E] rounded-3xl p-6 sm:p-8 border border-violet-500/40 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                <div className="space-y-3 max-w-3xl">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-violet-400" />
                    <span>Cognitive Pattern Detected</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-serif-display italic font-bold text-white tracking-tight">
                    {rewindData.patternDetected.title || 'Recognition vs. Workload Driver'}
                  </h2>

                  <p className="text-white text-base sm:text-lg leading-relaxed font-serif-display italic">
                    "{rewindData.patternDetected.observation || 'Your frustration was not primarily caused by workload. It appeared most often when you felt your contribution was not being acknowledged.'}"
                  </p>

                  <div className="bg-[#141416]/80 rounded-xl p-4 border border-violet-500/30 text-xs text-[#E1E1E6] space-y-1.5">
                    <div>
                      <span className="font-semibold text-white">Underlying Root Cause: </span>
                      <span className="text-[#8E8E93]">{rewindData.patternDetected.rootCause || 'Unspoken expectation that high technical effort would automatically be recognized without active visibility.'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">Reflective Inquiry: </span>
                      <span className="italic text-violet-300">{rewindData.patternDetected.actionableInquiry || 'How can you shift from hoping for recognition to designing transparent milestone agreements?'}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive CTA to Explore Pattern */}
                <div className="shrink-0 flex flex-col items-start md:items-end justify-center">
                  <button
                    id="btn-explore-pattern"
                    onClick={() => onExplorePattern(rewindData.patternDetected)}
                    className="flex items-center space-x-2 px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/40 hover:scale-[1.02] cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-violet-200" />
                    <span>Explore this pattern with Gemini</span>
                    <ArrowRight className="w-4 h-4 text-violet-200" />
                  </button>
                  <span className="text-[11px] text-[#8E8E93] mt-2 text-right">
                    Interactive Socratic coaching session
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* Recurring Themes & Quote Moments */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recurring Themes (6 cols) */}
            <div className="lg:col-span-6 bg-[#141416]/90 backdrop-blur-md rounded-2xl border border-[#242427] p-6 shadow-xl">
              <h3 className="font-serif-display italic text-2xl text-white mb-4">Recurring Themes</h3>
              <div className="space-y-3">
                {rewindData.recurringThemes?.map((theme, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#1A1A1D] border border-[#242427] flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-bold text-white">{theme.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-500/30">
                          {theme.count} mentions
                        </span>
                      </div>
                      <p className="text-xs text-[#8E8E93] leading-relaxed">{theme.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meaningful Moments / Direct Quotes (6 cols) */}
            <div className="lg:col-span-6 bg-[#141416]/90 backdrop-blur-md rounded-2xl border border-[#242427] p-6 shadow-xl">
              <h3 className="font-serif-display italic text-2xl text-white mb-4">Meaningful Moments & Quotes</h3>
              <div className="space-y-3">
                {rewindData.keyQuotes?.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#1A1A1D] border border-[#2D2D31] relative">
                    <Quote className="w-5 h-5 text-violet-400 mb-2 opacity-60" />
                    <p className="text-sm font-serif-display italic text-white leading-relaxed mb-2">
                      "{item.quote}"
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
                      <span>{item.context}</span>
                      <span className="font-mono text-[#8E8E93]/70">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Narrative Summary */}
          {rewindData.narrativeSummary && (
            <div className="bg-[#141416]/90 backdrop-blur-md rounded-2xl border border-[#242427] p-6 sm:p-8 shadow-xl">
              <h3 className="font-serif-display italic text-2xl text-white mb-3">Synthesis Narrative</h3>
              <p className="text-sm sm:text-base text-[#E1E1E6] leading-relaxed whitespace-pre-line font-light">
                {rewindData.narrativeSummary}
              </p>
            </div>
          )}

        </div>
      ) : (
        <div className="text-center py-20 bg-[#141416]/90 backdrop-blur-md rounded-3xl border border-[#242427]">
          <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-3 animate-bounce" />
          <h3 className="text-lg font-bold text-white mb-1">Generating Life Rewind</h3>
          <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
            Extracting emotional arcs, recurring keywords, and behavior models across your reflections...
          </p>
        </div>
      )}

    </div>
  );
};
