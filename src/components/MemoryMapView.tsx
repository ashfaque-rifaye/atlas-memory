import React, { useState } from 'react';
import { MapPin, Sparkles, Compass, Shield, Heart, Smile, Meh, Frown, Check, ArrowRight } from 'lucide-react';
import { JournalEntry, UserProfile } from '../types';

interface MemoryMapViewProps {
  currentUser: UserProfile;
  entries: JournalEntry[];
  onSelectEntry?: (entryId: string) => void;
}

export const MemoryMapView: React.FC<MemoryMapViewProps> = ({
  currentUser,
  entries,
  onSelectEntry,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('Bangalore');

  // Group entries by location
  const locationMap: Record<string, JournalEntry[]> = {};
  entries.forEach((e) => {
    const loc = e.location || 'Undisclosed';
    if (!locationMap[loc]) {
      locationMap[loc] = [];
    }
    locationMap[loc].push(e);
  });

  const locations = Object.keys(locationMap);

  // Compute sentiment breakdown for selected location
  const currentEntries = locationMap[selectedLocation] || [];
  const positiveCount = currentEntries.filter((e) => e.moodScore >= 7).length;
  const neutralCount = currentEntries.filter((e) => e.moodScore >= 4 && e.moodScore < 7).length;
  const negativeCount = currentEntries.filter((e) => e.moodScore < 4).length;

  // Custom location synthesis
  const getLocationNarrative = (loc: string) => {
    if (loc.toLowerCase().includes('bangalore')) {
      return {
        headline: 'Your Bangalore memories',
        tagline: 'Predominantly optimistic with high technical milestones.',
        summary: `You logged ${currentEntries.length} reflections in Bangalore. Your first month here was predominantly optimistic, energized by the fresh workspace, coffee rituals, and culminating in ownership of the NextGen pipeline module.`,
      };
    }
    if (loc.toLowerCase().includes('chennai')) {
      return {
        headline: 'Your Chennai memories',
        tagline: 'Emotional reset & family grounding.',
        summary: `Reflections recorded during weekend visits in Chennai offered critical perspective, lower stress levels, and restorative pauses by the beach away from sprint pressures.`,
      };
    }
    return {
      headline: `Your ${loc} memories`,
      tagline: `${currentEntries.length} reflections cataloged.`,
      summary: `Reflections anchored in ${loc} highlight focus on core work milestones, daily coordination, and structured goal tracking.`,
    };
  };

  const narrative = getLocationNarrative(selectedLocation);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242427] pb-5 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif-display italic text-3xl sm:text-4xl text-white tracking-tight">
              Memory Map
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-semibold">
              Location-Aware Polish
            </span>
          </div>
          <p className="text-sm text-[#8E8E93] mt-1 max-w-xl">
            Explore how different physical environments, workspaces, and cities shape your emotional headspace over time.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>User Consent Guarded (Rule #11)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Spatial Constellation & Location Pins (6 cols) */}
        <div className="lg:col-span-6 bg-[#141416]/90 backdrop-blur-md text-[#E1E1E6] rounded-3xl p-6 sm:p-8 border border-[#242427] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[440px]">
          
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-violet-400 block mb-1">
              GEOGRAPHIC EMOTION GRAPH
            </span>
            <h2 className="text-xl font-serif-display italic font-light text-white">
              Where Your Mind Wanders
            </h2>
          </div>

          {/* Interactive Visual Graph Nodes */}
          <div className="my-8 relative h-64 flex items-center justify-around border-t border-b border-[#242427]">
            
            {/* Connecting subtle axis */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#242427]" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[#242427]" />

            {/* Bangalore Node */}
            <div
              onClick={() => setSelectedLocation('Bangalore')}
              className={`relative z-10 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                selectedLocation === 'Bangalore' ? 'scale-110' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-violet-600/20 border-2 border-violet-400 text-violet-300 flex items-center justify-center shadow-lg shadow-violet-900/30">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white mt-2">Bangalore</span>
              <span className="text-[10px] text-violet-300 font-mono">Optimism & Growth</span>
            </div>

            {/* Chennai Node */}
            <div
              onClick={() => setSelectedLocation('Chennai')}
              className={`relative z-10 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                selectedLocation === 'Chennai' ? 'scale-110' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 border-2 border-indigo-400 text-indigo-300 flex items-center justify-center shadow-lg shadow-indigo-900/30">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white mt-2">Chennai</span>
              <span className="text-[10px] text-indigo-300 font-mono">Peaceful Reset</span>
            </div>

            {/* Office Node */}
            <div
              onClick={() => setSelectedLocation('Office')}
              className={`relative z-10 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                selectedLocation === 'Office' ? 'scale-110' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-rose-600/20 border-2 border-rose-400 text-rose-300 flex items-center justify-center shadow-lg shadow-rose-900/30">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white mt-2">Office</span>
              <span className="text-[10px] text-rose-300 font-mono">High Stakes</span>
            </div>

          </div>

          {/* Bottom helper */}
          <div className="flex items-center justify-between text-xs text-[#8E8E93]">
            <span>Click any node to explore emotional memories</span>
            <span className="font-mono text-[#8E8E93]">{locations.length} Locations Tagged</span>
          </div>

        </div>

        {/* Right: Selected Location Intelligence & Memories (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Location Summary Card */}
          <div className="bg-[#141416]/90 backdrop-blur-md rounded-3xl border border-[#242427] p-6 sm:p-7 shadow-xl">
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider block mb-1">
                  Location Insight
                </span>
                <h3 className="text-2xl font-serif-display italic font-bold text-white tracking-tight">
                  {narrative.headline}
                </h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">{narrative.tagline}</p>
              </div>

              <div className="px-3 py-1 bg-[#1A1A1D] border border-[#242427] rounded-xl text-xs font-bold text-violet-300 font-mono">
                {currentEntries.length} Entries
              </div>
            </div>

            {/* Sentiment Metric Bar */}
            <div className="grid grid-cols-3 gap-3 my-5">
              
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-center">
                <div className="flex items-center justify-center space-x-1 text-emerald-300 font-bold text-lg mb-0.5">
                  <Smile className="w-4 h-4 text-emerald-400" />
                  <span>{positiveCount}</span>
                </div>
                <span className="text-[11px] text-emerald-300 font-medium">Positive</span>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-center">
                <div className="flex items-center justify-center space-x-1 text-amber-300 font-bold text-lg mb-0.5">
                  <Meh className="w-4 h-4 text-amber-400" />
                  <span>{neutralCount}</span>
                </div>
                <span className="text-[11px] text-amber-300 font-medium">Neutral</span>
              </div>

              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30 text-center">
                <div className="flex items-center justify-center space-x-1 text-rose-300 font-bold text-lg mb-0.5">
                  <Frown className="w-4 h-4 text-rose-400" />
                  <span>{negativeCount}</span>
                </div>
                <span className="text-[11px] text-rose-300 font-medium">Challenging</span>
              </div>

            </div>

            <p className="text-xs sm:text-sm text-[#E1E1E6] leading-relaxed bg-[#1A1A1D] p-4 rounded-xl border border-[#242427] font-light">
              "{narrative.summary}"
            </p>

          </div>

          {/* Entries from this location */}
          <div className="bg-[#141416]/90 backdrop-blur-md rounded-3xl border border-[#242427] p-6 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93] mb-3">
              Reflections Logged in {selectedLocation}
            </h4>

            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {currentEntries.map((e) => (
                <div
                  key={e.id}
                  className="p-3 bg-[#1A1A1D] rounded-xl border border-[#242427] flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white font-serif-display italic">{e.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-900/40 text-violet-300 border border-violet-500/30 font-medium">
                        {e.mood}
                      </span>
                    </div>
                    <p className="text-[#8E8E93] text-[11px] line-clamp-2">{e.summary}</p>
                  </div>
                  <span className="text-[10px] text-[#8E8E93] shrink-0 font-mono">
                    {new Date(e.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
