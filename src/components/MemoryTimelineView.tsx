import React, { useState } from 'react';
import { BookOpen, Search, Filter, Tag, Users, Calendar, MapPin, ChevronDown, ChevronUp, Trash2, ArrowUpRight } from 'lucide-react';
import { JournalEntry, UserProfile } from '../types';
import { deleteUserEntry } from '../lib/memoryService';

interface MemoryTimelineViewProps {
  currentUser: UserProfile;
  entries: JournalEntry[];
  onEntryDeleted: (id: string) => void;
}

export const MemoryTimelineView: React.FC<MemoryTimelineViewProps> = ({
  currentUser,
  entries,
  onEntryDeleted,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // Extract unique moods & themes
  const uniqueMoods = ['All', ...Array.from(new Set(entries.map((e) => e.mood)))];
  const uniqueThemes = ['All', ...Array.from(new Set(entries.flatMap((e) => e.themes)))];

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      searchTerm === '' ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMood = selectedMood === 'All' || e.mood.toLowerCase() === selectedMood.toLowerCase();
    const matchesTheme = selectedTheme === 'All' || e.themes.some((t) => t.toLowerCase() === selectedTheme.toLowerCase());

    return matchesSearch && matchesMood && matchesTheme;
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this reflection entry from your memory atlas?')) {
      deleteUserEntry(currentUser.uid, id);
      onEntryDeleted(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242427] pb-5 mb-6">
        <div>
          <h1 className="font-serif-display italic text-3xl sm:text-4xl text-white tracking-tight">
            Personal Memories
          </h1>
          <p className="text-sm text-[#8E8E93] mt-1">
            Structured timeline of your private journal reflections, mood shifts, and life themes.
          </p>
        </div>
        <span className="text-xs font-semibold text-violet-300 bg-[#1A1A1D] border border-[#242427] px-3 py-1.5 rounded-full self-start sm:self-auto font-mono">
          {filteredEntries.length} Reflections Available
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141416]/90 backdrop-blur-md rounded-2xl border border-[#242427] p-4 mb-6 shadow-xl flex flex-wrap items-center gap-3">
        
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords, thoughts, people, insights..."
            className="w-full pl-9 pr-4 py-2 bg-[#1A1A1D] border border-[#2D2D31] rounded-xl text-xs text-white placeholder-[#8E8E93] focus:outline-hidden focus:border-violet-500"
          />
        </div>

        {/* Mood Filter */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-[#8E8E93]">Mood:</span>
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="bg-[#1A1A1D] border border-[#2D2D31] rounded-xl px-2.5 py-2 text-white focus:outline-hidden"
          >
            {uniqueMoods.map((m) => (
              <option key={m} value={m} className="bg-[#141416] text-white">{m}</option>
            ))}
          </select>
        </div>

        {/* Theme Filter */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-[#8E8E93]">Theme:</span>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="bg-[#1A1A1D] border border-[#2D2D31] rounded-xl px-2.5 py-2 text-white focus:outline-hidden"
          >
            {uniqueThemes.map((t) => (
              <option key={t} value={t} className="bg-[#141416] text-white">{t}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Timeline Stream */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntryId === entry.id;

            return (
              <div
                key={entry.id}
                className="bg-[#141416]/90 backdrop-blur-md rounded-2xl border border-[#242427] p-5 sm:p-6 shadow-xl hover:border-[#2D2D31] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-600 text-white shadow-xs">
                        {entry.mood}
                      </span>
                      <span className="text-xs text-[#8E8E93] font-mono">
                        Score: {entry.moodScore}/10
                      </span>
                      {entry.location && (
                        <span className="text-xs text-[#8E8E93] flex items-center space-x-1 bg-[#1A1A1D] px-2 py-0.5 rounded-md border border-[#242427]">
                          <MapPin className="w-3 h-3 text-violet-400" />
                          <span>{entry.location}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-serif-display italic font-bold text-white tracking-tight">{entry.title}</h3>
                  </div>

                  <span className="text-xs text-[#8E8E93] shrink-0 font-medium font-mono">
                    {new Date(entry.createdAt).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-[#E1E1E6] leading-relaxed mb-4 bg-[#1A1A1D] p-3.5 rounded-xl border border-[#242427]">
                  {entry.summary}
                </p>

                {/* Metadata Tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-[#242427]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {entry.themes.map((t, idx) => (
                      <span key={idx} className="bg-violet-500/15 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        #{t}
                      </span>
                    ))}
                    {entry.people.map((p, idx) => (
                      <span key={idx} className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center space-x-1">
                        <Users className="w-2.5 h-2.5" />
                        <span>{p}</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                      className="text-xs text-[#8E8E93] hover:text-white font-medium flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide transcript' : 'View transcript'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-[#8E8E93] hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete reflection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expandable Transcript */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#242427] space-y-3 bg-[#1A1A1D] p-4 rounded-xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] block mb-2">
                      Full Reflection Dialogue
                    </span>
                    {entry.messages.map((m, idx) => (
                      <div key={idx} className="text-xs leading-relaxed space-y-1">
                        <span className="font-semibold text-white">
                          {m.role === 'user' ? currentUser.displayName : 'Reflection Guide'}:
                        </span>
                        <p className="text-[#E1E1E6] bg-[#141416] p-2.5 rounded-lg border border-[#242427]">
                          {m.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#141416]/90 backdrop-blur-md rounded-2xl border border-[#242427]">
          <BookOpen className="w-10 h-10 text-[#8E8E93] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">No reflections matched your filter</h3>
          <p className="text-xs text-[#8E8E93] max-w-sm mx-auto">
            Try adjusting your search query or selecting "All" from the mood or theme dropdowns.
          </p>
        </div>
      )}

    </div>
  );
};
