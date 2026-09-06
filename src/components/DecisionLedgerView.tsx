import React, { useState } from 'react';
import { GitBranch, Plus, CheckCircle2, Clock, ArrowRight, ShieldCheck, Sparkles, RefreshCw, BarChart2, Compass, AlertCircle } from 'lucide-react';
import { DecisionItem, UserProfile } from '../types';
import { saveUserDecision } from '../lib/memoryService';

interface DecisionLedgerViewProps {
  currentUser: UserProfile;
  decisions: DecisionItem[];
  onDecisionUpdated: (decision: DecisionItem) => void;
}

export const DecisionLedgerView: React.FC<DecisionLedgerViewProps> = ({
  currentUser,
  decisions,
  onDecisionUpdated,
}) => {
  const [activeReviewDecision, setActiveReviewDecision] = useState<DecisionItem | null>(null);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  // New decision form state
  const [newTitle, setNewTitle] = useState('');
  const [newReasoning, setNewReasoning] = useState('');
  const [newConfidence, setNewConfidence] = useState(70);
  const [newExpectedOutcome, setNewExpectedOutcome] = useState('');

  // 30-day follow-up review form state
  const [updatedConfidence, setUpdatedConfidence] = useState(45);
  const [actualOutcome, setActualOutcome] = useState('');
  const [whatChanged, setWhatChanged] = useState('');
  const [retrospectiveNotes, setRetrospectiveNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const now = new Date();
    const reviewDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const item: DecisionItem = {
      id: `dec-${Date.now()}`,
      userId: currentUser.uid,
      decision: newTitle.trim(),
      reasoning: newReasoning.trim() || 'Desire for growth and clarity.',
      confidence: newConfidence,
      expectedOutcome: newExpectedOutcome.trim() || 'Better alignment and fulfillment.',
      createdAt: now.toISOString(),
      reviewDate: reviewDate,
      status: 'active',
    };

    saveUserDecision(item);
    onDecisionUpdated(item);
    setShowNewModal(false);
    setNewTitle('');
    setNewReasoning('');
    setNewExpectedOutcome('');
  };

  const handleOpenReview = (dec: DecisionItem) => {
    setActiveReviewDecision(dec);
    setUpdatedConfidence(dec.followUp?.updatedConfidence || 41);
    setActualOutcome(dec.followUp?.outcome || 'You stayed.');
    setWhatChanged(dec.followUp?.whatChanged || 'You received ownership of a new project.');
    setRetrospectiveNotes(dec.followUp?.retrospective || '');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewDecision) return;

    setReviewLoading(true);
    let aiRetrospective = retrospectiveNotes;

    try {
      const res = await fetch('/api/decision-retrospective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: activeReviewDecision,
          followUp: {
            updatedConfidence,
            outcome: actualOutcome,
            whatChanged,
            retrospective: retrospectiveNotes,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        aiRetrospective = data.retrospectiveAnalysis || aiRetrospective;
      }
    } catch (err) {
      console.error('Decision review analysis error:', err);
    } finally {
      setReviewLoading(false);
    }

    const updated: DecisionItem = {
      ...activeReviewDecision,
      status: 'reviewed',
      followUp: {
        reviewedAt: new Date().toISOString(),
        updatedConfidence,
        outcome: actualOutcome,
        whatChanged,
        retrospective: aiRetrospective,
        statusChanged: 'stayed',
      },
    };

    saveUserDecision(updated);
    onDecisionUpdated(updated);
    setActiveReviewDecision(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242427] pb-5 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif-display italic text-3xl sm:text-4xl text-white tracking-tight">
              Decision Ledger
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              Long-Term Feedback Loop
            </span>
          </div>
          <p className="text-sm text-[#8E8E93] mt-1 max-w-2xl leading-relaxed">
            Track significant crossroads, document initial expectations and confidence, and revisit them 30 days later to close the reflection loop.
          </p>
        </div>

        <button
          id="btn-track-new-decision"
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-xs transition-all shadow-lg shadow-violet-900/30 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-violet-200" />
          <span>Track New Decision</span>
        </button>
      </div>

      {/* Decision Cards List */}
      <div className="space-y-6">
        {decisions.map((dec) => {
          const isReviewed = dec.status === 'reviewed';

          return (
            <div
              key={dec.id}
              className="bg-[#141416]/90 backdrop-blur-md rounded-3xl border border-[#242427] p-6 sm:p-8 shadow-xl hover:border-[#2D2D31] transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Left: Main Decision Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isReviewed
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    }`}>
                      {isReviewed ? '30-Day Rewind Complete' : 'Active Decision'}
                    </span>
                    <span className="text-xs text-[#8E8E93] font-mono">
                      Created {new Date(dec.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-serif-display italic font-bold text-white tracking-tight">
                    {dec.decision}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#1A1A1D] p-3.5 rounded-xl border border-[#242427]">
                      <span className="font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                        Why?
                      </span>
                      <p className="text-[#E1E1E6] font-medium leading-relaxed">{dec.reasoning}</p>
                    </div>

                    <div className="bg-[#1A1A1D] p-3.5 rounded-xl border border-[#242427]">
                      <span className="font-semibold text-[#8E8E93] uppercase tracking-wider block mb-1">
                        Expected Outcome
                      </span>
                      <p className="text-[#E1E1E6] font-medium leading-relaxed">{dec.expectedOutcome}</p>
                    </div>
                  </div>

                  {/* Initial Confidence Meter */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-[#8E8E93]">Initial Confidence</span>
                      <span className="text-white font-mono">{dec.confidence}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="bg-violet-500 h-full rounded-full transition-all"
                        style={{ width: `${dec.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Status / Review Action */}
                <div className="shrink-0 flex flex-col justify-between items-start md:items-end space-y-4">
                  
                  {!isReviewed ? (
                    <div className="bg-violet-600/10 border border-violet-500/30 p-4 rounded-2xl max-w-xs space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-violet-300">
                        <Clock className="w-4 h-4 text-violet-400" />
                        <span>30-Day Check-in Due</span>
                      </div>
                      <p className="text-[11px] text-[#E1E1E6]">
                        “You previously considered {dec.decision}. Has the situation changed?”
                      </p>
                      <button
                        onClick={() => handleOpenReview(dec)}
                        className="w-full mt-2 py-2 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-violet-900/30"
                      >
                        Complete 30-Day Review
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenReview(dec)}
                      className="text-xs px-3.5 py-2 bg-[#1A1A1D] border border-[#2D2D31] text-[#E1E1E6] font-semibold rounded-xl hover:bg-white/5 transition-colors"
                    >
                      Update Retrospective
                    </button>
                  )}

                </div>

              </div>

              {/* DECISION REWIND: Side-by-Side Comparison */}
              {isReviewed && dec.followUp && (
                <div className="mt-6 pt-6 border-t border-[#242427]">
                  <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Decision Rewind — Expectation vs. Reality</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#1A1A1D] p-4 sm:p-5 rounded-2xl border border-[#242427] text-xs">
                    
                    {/* Before */}
                    <div className="space-y-1.5">
                      <span className="font-semibold text-[#8E8E93] uppercase tracking-wider block">Decision Made</span>
                      <p className="font-bold text-white">
                        {new Date(dec.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[#8E8E93]">Confidence: <span className="font-semibold text-white">{dec.confidence}%</span></p>
                      <p className="text-[#8E8E93] italic">Expected: {dec.expectedOutcome}</p>
                    </div>

                    {/* After 30 Days */}
                    <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#242427] pt-3 md:pt-0 md:pl-4">
                      <span className="font-semibold text-[#8E8E93] uppercase tracking-wider block">After 30 Days</span>
                      <p className="font-bold text-white">
                        Confidence: <span className="text-violet-400 font-bold">{dec.followUp.updatedConfidence}%</span>
                      </p>
                      <p className="text-emerald-400 font-semibold">Outcome: {dec.followUp.outcome}</p>
                      <p className="text-[#8E8E93]"><span className="font-medium text-[#E1E1E6]">What changed:</span> {dec.followUp.whatChanged}</p>
                    </div>

                    {/* Retrospective Lesson */}
                    <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#242427] pt-3 md:pt-0 md:pl-4">
                      <span className="font-semibold text-[#8E8E93] uppercase tracking-wider block">Retrospective Insight</span>
                      <p className="text-[#E1E1E6] leading-relaxed bg-[#141416] p-2.5 rounded-lg border border-[#242427] font-light">
                        {dec.followUp.retrospective}
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* 30-Day Check-in Modal */}
      {activeReviewDecision && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141416] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#242427] animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>30-Day Decision Check-in</span>
            </div>

            <h2 className="text-2xl font-serif-display italic font-bold text-white tracking-tight mb-2">
              “Has the situation changed?”
            </h2>
            <p className="text-xs text-[#8E8E93] mb-6">
              You previously considered <span className="font-semibold text-white">"{activeReviewDecision.decision}"</span> with {activeReviewDecision.confidence}% confidence.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#E1E1E6] mb-1">
                  Updated Confidence ({updatedConfidence}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={updatedConfidence}
                  onChange={(e) => setUpdatedConfidence(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#E1E1E6] mb-1">Actual Outcome</label>
                <input
                  type="text"
                  value={actualOutcome}
                  onChange={(e) => setActualOutcome(e.target.value)}
                  placeholder="e.g. You stayed, or You transitioned to Platform team"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1D] border border-[#2D2D31] rounded-xl text-white placeholder-[#8E8E93]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#E1E1E6] mb-1">What Changed?</label>
                <textarea
                  rows={2}
                  value={whatChanged}
                  onChange={(e) => setWhatChanged(e.target.value)}
                  placeholder="e.g. You spoke with your manager and received ownership of the new project."
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1D] border border-[#2D2D31] rounded-xl text-white placeholder-[#8E8E93]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#E1E1E6] mb-1">Your Retrospective Lesson</label>
                <textarea
                  rows={3}
                  value={retrospectiveNotes}
                  onChange={(e) => setRetrospectiveNotes(e.target.value)}
                  placeholder="What did this teach you about your emotional triggers, assumptions, or boundaries?"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1D] border border-[#2D2D31] rounded-xl text-white placeholder-[#8E8E93]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#242427]">
                <button
                  type="button"
                  onClick={() => setActiveReviewDecision(null)}
                  className="px-4 py-2 text-[#8E8E93] hover:bg-white/5 rounded-xl font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors flex items-center space-x-2 shadow-lg shadow-violet-900/30"
                >
                  {reviewLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <span>Save Decision Rewind</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Decision Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141416] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#242427] animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-serif-display italic font-bold text-white tracking-tight mb-1">
              Track New Decision
            </h2>
            <p className="text-xs text-[#8E8E93] mb-6">
              Anchor a significant choice with clear reasoning, confidence, and expected outcome.
            </p>

            <form onSubmit={handleCreateDecision} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#E1E1E6] mb-1">Decision</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Leave Project X or Say No to New Commitment"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1D] border border-[#2D2D31] rounded-xl text-white placeholder-[#8E8E93]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#E1E1E6] mb-1">Why?</label>
                <textarea
                  rows={2}
                  value={newReasoning}
                  onChange={(e) => setNewReasoning(e.target.value)}
                  placeholder="Why are you leaning toward this decision?"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1D] border border-[#2D2D31] rounded-xl text-white placeholder-[#8E8E93]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#E1E1E6] mb-1">
                  Confidence Level ({newConfidence}%)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={newConfidence}
                  onChange={(e) => setNewConfidence(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#E1E1E6] mb-1">Expected Outcome</label>
                <input
                  type="text"
                  value={newExpectedOutcome}
                  onChange={(e) => setNewExpectedOutcome(e.target.value)}
                  placeholder="e.g. More growth + better recognition"
                  className="w-full px-3.5 py-2.5 bg-[#1A1A1D] border border-[#2D2D31] rounded-xl text-white placeholder-[#8E8E93]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#242427]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-[#8E8E93] hover:bg-white/5 rounded-xl font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-violet-900/30"
                >
                  Save to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
