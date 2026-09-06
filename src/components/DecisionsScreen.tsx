import React, { useState } from 'react';
import { UserProfile, DecisionItem } from '../types';

interface DecisionsScreenProps {
  currentUser: UserProfile;
  decisions: DecisionItem[];
  onDecisionUpdated: (updated: DecisionItem) => void;
  onGoToday: () => void;
}

interface DecisionDetail {
  id: string;
  title: string;
  status: 'Reviewed' | 'Due' | 'Open';
  meta: string;
  reviewed: boolean;
  due: boolean;
  why: string;
  expected: string;
  created: string;
  reviewDate?: string;
  conf: { when: string; pct: string; tint: string }[];
  outcome?: string;
  whatChanged?: string;
}

const DEFAULT_DECISION_DETAILS: DecisionDetail[] = [
  {
    id: 'x',
    title: 'Leave Project X',
    status: 'Reviewed',
    meta: 'Sep 6 → Oct 6 · 72% → 41%',
    reviewed: true,
    due: false,
    why: 'Feeling stalled and undervalued.',
    expected: 'More growth + better recognition',
    created: 'Sep 6, 2026',
    conf: [
      { when: 'Decision made · Sep 6', pct: '72%', tint: 'var(--accent)' },
      { when: 'After 30 days', pct: '41%', tint: 'var(--clay)' },
    ],
    outcome: 'You stayed.',
    whatChanged: 'You received ownership of a new project.',
  },
  {
    id: 'm',
    title: 'Discuss expectations with manager',
    status: 'Due',
    meta: 'Sep 6 · review Oct 6',
    reviewed: false,
    due: true,
    why: 'Recognition, not workload, is what keeps going wrong.',
    expected: 'A shared definition of what my work is worth',
    created: 'Sep 6, 2026',
    reviewDate: 'October 6',
    conf: [{ when: 'Decision made · Sep 6', pct: '64%', tint: 'var(--accent)' }],
  },
  {
    id: 'r',
    title: 'Move runs to the morning',
    status: 'Open',
    meta: 'Aug 29 · review Sep 28',
    reviewed: false,
    due: false,
    why: 'Late nights keep eating the next day.',
    expected: 'Steadier energy on weekdays',
    created: 'Aug 29, 2026',
    reviewDate: 'September 28',
    conf: [{ when: 'Decision made · Aug 29', pct: '55%', tint: 'var(--accent)' }],
  },
];

export function DecisionsScreen({
  currentUser,
  decisions,
  onDecisionUpdated,
  onGoToday,
}: DecisionsScreenProps) {
  const [selectedId, setSelectedId] = useState<string>('x');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newWhy, setNewWhy] = useState('');
  const [newExpected, setNewExpected] = useState('');
  const [newConfidence, setNewConfidence] = useState(65);

  // Merge default calibrated decision details with any user saved ones
  const userMappedDecisions: DecisionDetail[] = decisions
    .filter((d) => !DEFAULT_DECISION_DETAILS.some((def) => def.id === d.id))
    .map((d) => ({
      id: d.id,
      title: d.decision,
      status: d.status === 'reviewed' ? 'Reviewed' : 'Open',
      meta: `${new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · review in 30d`,
      reviewed: d.status === 'reviewed',
      due: false,
      why: d.reasoning,
      expected: d.expectedOutcome,
      created: new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      reviewDate: new Date(d.reviewDate).toLocaleDateString([], { month: 'long', day: 'numeric' }),
      conf: [{ when: 'Decision made', pct: `${d.confidence}%`, tint: 'var(--accent)' }],
    }));

  const allDecisions = [...DEFAULT_DECISION_DETAILS, ...userMappedDecisions];
  const activeDec = allDecisions.find((d) => d.id === selectedId) || allDecisions[0];

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newId = `dec-${Date.now()}`;
    const now = new Date();
    const reviewDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const createdItem: DecisionItem = {
      id: newId,
      userId: currentUser.uid,
      decision: newTitle.trim(),
      reasoning: newWhy.trim() || 'Personal clarity and strategic alignment',
      confidence: newConfidence,
      expectedOutcome: newExpected.trim() || 'Clearer momentum and measurable progress',
      createdAt: now.toISOString(),
      reviewDate: reviewDate,
      status: 'active',
    };

    onDecisionUpdated(createdItem);
    setSelectedId(newId);
    setShowAddModal(false);
    setNewTitle('');
    setNewWhy('');
    setNewExpected('');
  };

  return (
    <div data-screen-label="Decisions">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6.5">
        <div>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '.14em',
              color: 'var(--text3)',
            }}
          >
            Decision ledger
          </div>
          <h1
            className="font-medium mt-2 m-0"
            style={{
              fontSize: 'clamp(26px, 3vw, 34px)',
              letterSpacing: '-0.03em',
            }}
          >
            What you decided, and what actually happened.
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer transition-colors"
          style={{
            padding: '7px 12px',
            borderRadius: '2px',
            border: '1px solid var(--accent-line)',
            background: 'var(--accent-dim)',
            color: 'var(--text)',
            fontSize: '12.5px',
          }}
        >
          + Track new decision
        </button>
      </div>

      {/* Two Pane Layout */}
      <div className="flex flex-wrap gap-5 items-start">
        {/* Left: Decision List */}
        <div
          className="grid gap-2.5"
          style={{ flex: '0 1 300px', minWidth: '260px' }}
        >
          {allDecisions.map((d) => {
            const isSelected = selectedId === d.id;
            const statusTint =
              d.due ? 'var(--clay)' : d.reviewed ? 'var(--accent)' : 'var(--text3)';

            return (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className="text-left cursor-pointer transition-colors"
                style={{
                  borderRadius: '3px',
                  padding: '16px',
                  border: `1px solid ${isSelected ? 'var(--accent-line)' : 'var(--line)'}`,
                  background: isSelected ? 'var(--panel)' : 'transparent',
                  color: 'var(--text)',
                }}
              >
                <div className="flex justify-between items-baseline gap-2.5 mb-2">
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {d.title}
                  </span>
                  <span
                    className="font-mono uppercase shrink-0"
                    style={{
                      fontSize: '10px',
                      letterSpacing: '.08em',
                      color: statusTint,
                    }}
                  >
                    {d.status}
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text3)' }}>
                  {d.meta}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Decision Detail */}
        <div
          style={{
            flex: '1 1 420px',
            minWidth: '300px',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            background: 'var(--panel)',
            padding: 'clamp(20px, 3vw, 32px)',
          }}
        >
          <div className="flex flex-wrap justify-between items-baseline gap-3">
            <h2
              className="font-medium m-0"
              style={{
                fontSize: 'clamp(21px, 2.3vw, 26px)',
                letterSpacing: '-0.03em',
              }}
            >
              {activeDec.title}
            </h2>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text3)' }}>
              Created {activeDec.created}
            </div>
          </div>

          <div className="grid gap-5 mt-6">
            <div>
              <div
                className="font-mono uppercase mb-1.5"
                style={{
                  fontSize: '10px',
                  letterSpacing: '.12em',
                  color: 'var(--text3)',
                }}
              >
                Why
              </div>
              <div style={{ fontSize: '16px', lineHeight: 1.55, textWrap: 'pretty' }}>
                {activeDec.why}
              </div>
            </div>

            <div>
              <div
                className="font-mono uppercase mb-1.5"
                style={{
                  fontSize: '10px',
                  letterSpacing: '.12em',
                  color: 'var(--text3)',
                }}
              >
                Expected outcome
              </div>
              <div
                style={{
                  fontSize: '16px',
                  lineHeight: 1.55,
                  color: 'var(--text2)',
                  textWrap: 'pretty',
                }}
              >
                {activeDec.expected}
              </div>
            </div>
          </div>

          {/* Confidence Over Time */}
          <div className="mt-7 pt-6" style={{ borderTop: '1px solid var(--hair)' }}>
            <div
              className="font-mono uppercase mb-4"
              style={{
                fontSize: '10px',
                letterSpacing: '.12em',
                color: 'var(--text3)',
              }}
            >
              Confidence over time
            </div>
            <div className="flex flex-wrap gap-6.5">
              {activeDec.conf.map((c, idx) => (
                <div key={idx} style={{ minWidth: '120px' }}>
                  <div
                    className="font-mono mb-2"
                    style={{ fontSize: '11px', color: 'var(--text3)' }}
                  >
                    {c.when}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(28px, 3vw, 36px)',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      color: c.tint,
                    }}
                  >
                    {c.pct}
                  </div>
                  <div
                    className="overflow-hidden mt-3"
                    style={{
                      height: '3px',
                      background: 'var(--panel2)',
                      borderRadius: '2px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: c.tint,
                        width: c.pct,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outcome & What Changed (Reviewed state) */}
          {activeDec.reviewed && (
            <div
              className="grid gap-4.5 mt-7 pt-6"
              style={{ borderTop: '1px solid var(--hair)' }}
            >
              <div>
                <div
                  className="font-mono uppercase mb-1.5"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '.12em',
                    color: 'var(--text3)',
                  }}
                >
                  Outcome
                </div>
                <div style={{ fontSize: '17px', lineHeight: 1.5 }}>
                  {activeDec.outcome || 'You stayed.'}
                </div>
              </div>
              <div>
                <div
                  className="font-mono uppercase mb-1.5"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '.12em',
                    color: 'var(--text3)',
                  }}
                >
                  What changed
                </div>
                <div style={{ fontSize: '16px', lineHeight: 1.55, color: 'var(--text2)' }}>
                  {activeDec.whatChanged || 'You received ownership of a new project.'}
                </div>
              </div>
            </div>
          )}

          {/* Due Revisit Prompt */}
          {activeDec.due && (
            <div
              className="mt-7"
              style={{
                border: '1px solid var(--accent-line)',
                background: 'var(--accent-dim)',
                borderRadius: '3px',
                padding: '18px',
              }}
            >
              <div style={{ fontSize: '16px', lineHeight: 1.55, textWrap: 'pretty' }}>
                You previously considered leaving Project X. Has the situation changed?
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={onGoToday}
                  className="cursor-pointer transition-colors"
                  style={{
                    padding: '9px 14px',
                    borderRadius: '2px',
                    border: '1px solid var(--accent)',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: '13.5px',
                  }}
                >
                  Answer now
                </button>
                <button
                  onClick={() => setSelectedId('r')}
                  className="cursor-pointer transition-colors"
                  style={{
                    padding: '9px 14px',
                    borderRadius: '2px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text3)',
                    fontSize: '13.5px',
                  }}
                >
                  Remind me next week
                </button>
              </div>
            </div>
          )}

          {/* Pending State */}
          {!activeDec.reviewed && !activeDec.due && (
            <div
              className="mt-7 pt-6"
              style={{
                borderTop: '1px solid var(--hair)',
                fontSize: '14.5px',
                lineHeight: 1.6,
                color: 'var(--text3)',
                textWrap: 'pretty',
              }}
            >
              No review yet. Gemini will ask about this one on {activeDec.reviewDate || 'September 28'} — it never resolves a decision on your behalf.
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Decision Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)' }}
        >
          <div
            className="w-full max-w-lg"
            style={{
              border: '1px solid var(--line)',
              borderRadius: '3px',
              background: 'var(--panel)',
              padding: '24px',
              color: 'var(--text)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium m-0">Track New Decision</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="border-none bg-transparent cursor-pointer"
                style={{ color: 'var(--text3)', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDecision} className="space-y-4">
              <div>
                <label
                  className="font-mono block uppercase mb-1"
                  style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '.12em' }}
                >
                  Decision Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Change team, renegotiate compensation..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 outline-none"
                  style={{
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderRadius: '2px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label
                  className="font-mono block uppercase mb-1"
                  style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '.12em' }}
                >
                  Why
                </label>
                <textarea
                  rows={2}
                  placeholder="What is motivating this decision right now?"
                  value={newWhy}
                  onChange={(e) => setNewWhy(e.target.value)}
                  className="w-full px-3 py-2 outline-none resize-none"
                  style={{
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderRadius: '2px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label
                  className="font-mono block uppercase mb-1"
                  style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '.12em' }}
                >
                  Expected Outcome
                </label>
                <input
                  type="text"
                  placeholder="What will look different after 30 days?"
                  value={newExpected}
                  onChange={(e) => setNewExpected(e.target.value)}
                  className="w-full px-3 py-2 outline-none"
                  style={{
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderRadius: '2px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    className="font-mono uppercase"
                    style={{ fontSize: '10px', color: 'var(--text3)', letterSpacing: '.12em' }}
                  >
                    Initial Confidence
                  </label>
                  <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent)' }}>
                    {newConfidence}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={newConfidence}
                  onChange={(e) => setNewConfidence(Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer px-4 py-2"
                  style={{
                    borderRadius: '2px',
                    border: '1px solid var(--line)',
                    background: 'transparent',
                    color: 'var(--text2)',
                    fontSize: '13px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 font-medium"
                  style={{
                    borderRadius: '2px',
                    border: '1px solid var(--accent-line)',
                    background: 'var(--accent-dim)',
                    color: 'var(--text)',
                    fontSize: '13px',
                  }}
                >
                  Save to ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
