import React, { useState } from 'react';
import { UserProfile, JournalEntry } from '../types';

interface RewindScreenProps {
  currentUser: UserProfile;
  entries: JournalEntry[];
  onGoPatterns: () => void;
}

const MOOD_SCORES = [
  4, 3, 4, 2, 3, 5, 3, 2, 4, 3, 2, 3, 4, 3, 5, 4, 6, 7, 6, 8, 7, 8, 7, 6, 8, 7, 7, 8, 6, 7,
];

export function RewindScreen({ currentUser, entries, onGoPatterns }: RewindScreenProps) {
  const [range, setRange] = useState('Last 30 days');
  const [lens, setLens] = useState('Work');
  const [patternOpen, setPatternOpen] = useState(false);

  const ranges = ['Last 7 days', 'Last 30 days', '3 months', 'Custom'];
  const lenses = ['Mood', 'Work', 'People', 'Places', 'Decisions'];

  const themeRows = [
    { label: 'Recognition', n: '11', pct: '92%' },
    { label: 'Workload', n: '7', pct: '58%' },
    { label: 'Team change', n: '4', pct: '34%' },
    { label: 'Sleep', n: '3', pct: '25%' },
  ];

  return (
    <div data-screen-label="Rewind">
      {/* Header */}
      <div className="mb-6.5">
        <div
          className="font-mono uppercase"
          style={{
            fontSize: '11px',
            letterSpacing: '.14em',
            color: 'var(--text3)',
          }}
        >
          Rewind
        </div>
        <h1
          className="font-medium mt-2 m-0"
          style={{
            fontSize: 'clamp(26px, 3vw, 34px)',
            letterSpacing: '-0.03em',
          }}
        >
          Go back by mood, theme, place or person.
        </h1>
      </div>

      {/* Filter Row: Range & Lens */}
      <div className="flex flex-wrap gap-5.5 mb-6.5">
        <div>
          <div
            className="font-mono uppercase mb-2"
            style={{
              fontSize: '10px',
              letterSpacing: '.12em',
              color: 'var(--text3)',
            }}
          >
            Range
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ranges.map((r) => {
              const active = range === r;
              return (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="cursor-pointer transition-colors"
                  style={{
                    padding: '7px 12px',
                    borderRadius: '2px',
                    fontSize: '12.5px',
                    border: `1px solid ${active ? 'var(--accent-line)' : 'var(--line)'}`,
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text2)',
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div
            className="font-mono uppercase mb-2"
            style={{
              fontSize: '10px',
              letterSpacing: '.12em',
              color: 'var(--text3)',
            }}
          >
            Lens
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {lenses.map((l) => {
              const active = lens === l;
              return (
                <button
                  key={l}
                  onClick={() => setLens(l)}
                  className="cursor-pointer transition-colors"
                  style={{
                    padding: '7px 12px',
                    borderRadius: '2px',
                    fontSize: '12.5px',
                    border: `1px solid ${active ? 'var(--accent-line)' : 'var(--line)'}`,
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text2)',
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Panes */}
      <div className="flex flex-wrap gap-5 items-start">
        {/* Left Pane: Narrative Summary & Bar Chart */}
        <div
          style={{
            flex: '1 1 480px',
            minWidth: '300px',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            background: 'var(--panel)',
            padding: 'clamp(20px, 3vw, 32px)',
          }}
        >
          <div
            className="font-mono uppercase mb-3.5"
            style={{
              fontSize: '10.5px',
              letterSpacing: '.12em',
              color: 'var(--accent)',
            }}
          >
            {range} · {lens}
          </div>

          <h2
            className="font-medium m-0 mb-5"
            style={{
              fontSize: 'clamp(22px, 2.4vw, 27px)',
              letterSpacing: '-0.03em',
            }}
          >
            Your September Work Rewind
          </h2>

          <div
            className="grid gap-3.5"
            style={{
              fontSize: '16px',
              lineHeight: 1.55,
              color: 'var(--text2)',
            }}
          >
            <div>
              You recorded <span style={{ color: 'var(--text)' }}>17 reflections</span>.
            </div>
            <div>
              Most common emotional state:{' '}
              <span style={{ color: 'var(--clay)' }}>frustration</span>
            </div>
            <div>
              Your mood improved significantly after{' '}
              <span style={{ color: 'var(--text)' }}>September 18</span>.
            </div>
            <div>
              The recurring theme was{' '}
              <span style={{ color: 'var(--text)' }}>recognition for your work</span>.
            </div>
            <div>
              You mentioned <span style={{ color: 'var(--text)' }}>changing teams 4 times</span>.
            </div>
          </div>

          {/* 30-Day Mood Bars Chart */}
          <div className="flex items-end gap-1 my-7 mb-2" style={{ height: '76px' }}>
            {MOOD_SCORES.map((score, idx) => {
              const heightPx = 18 + score * 7;
              const barColor =
                score >= 6
                  ? 'var(--accent)'
                  : score <= 3
                  ? 'var(--clay)'
                  : 'var(--panel2)';
              return (
                <div
                  key={idx}
                  title={`Sep ${idx + 1} · Mood score ${score}/10`}
                  style={{
                    flex: 1,
                    borderRadius: '1px',
                    background: barColor,
                    height: `${heightPx}px`,
                    minWidth: '4px',
                  }}
                />
              );
            })}
          </div>

          <div
            className="font-mono flex justify-between"
            style={{ fontSize: '10px', color: 'var(--text3)' }}
          >
            <span>Sep 1</span>
            <span>Sep 18 — turn</span>
            <span>Sep 30</span>
          </div>

          {/* Pulled Quote */}
          <div
            className="mt-7"
            style={{
              borderLeft: '1.5px solid var(--accent)',
              paddingLeft: '16px',
            }}
          >
            <div
              className="font-mono mb-2"
              style={{ fontSize: '10.5px', color: 'var(--text3)' }}
            >
              September 21
            </div>
            <div
              className="italic"
              style={{
                fontSize: '18px',
                lineHeight: 1.55,
                textWrap: 'pretty',
              }}
            >
              “I think I finally understand what I need from my manager.”
            </div>
          </div>

          {/* Pattern Exploration Reveal */}
          <div className="mt-7 pt-5.5" style={{ borderTop: '1px solid var(--hair)' }}>
            {!patternOpen ? (
              <button
                onClick={() => setPatternOpen(true)}
                className="flex items-center gap-2.5 cursor-pointer transition-opacity hover:opacity-85"
                style={{
                  padding: '11px 16px',
                  borderRadius: '2px',
                  border: '1px solid var(--accent-line)',
                  background: 'var(--accent-dim)',
                  color: 'var(--text)',
                  fontSize: '14.5px',
                }}
              >
                <span>Want to explore this pattern?</span>
                <span style={{ color: 'var(--accent)' }}>→</span>
              </button>
            ) : (
              <div className="animate-rise">
                <div
                  className="font-mono uppercase mb-3.5"
                  style={{
                    fontSize: '10.5px',
                    letterSpacing: '.12em',
                    color: 'var(--accent)',
                  }}
                >
                  Pattern detected
                </div>
                <div
                  className="grid gap-3"
                  style={{ fontSize: '17px', lineHeight: 1.55, textWrap: 'pretty' }}
                >
                  <div>Your frustration wasn't primarily caused by workload.</div>
                  <div style={{ color: 'var(--text2)' }}>
                    It appeared most often when you felt your contribution wasn't being acknowledged.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4.5">
                  <button
                    onClick={onGoPatterns}
                    className="cursor-pointer transition-colors"
                    style={{
                      padding: '8px 13px',
                      borderRadius: '2px',
                      border: '1px solid var(--line)',
                      background: 'transparent',
                      color: 'var(--text2)',
                      fontSize: '13px',
                    }}
                  >
                    See all patterns
                  </button>
                  <button
                    onClick={() => setPatternOpen(false)}
                    className="cursor-pointer transition-colors"
                    style={{
                      padding: '8px 13px',
                      borderRadius: '2px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text3)',
                      fontSize: '13px',
                    }}
                  >
                    Collapse
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Themes, Questions & Security Note */}
        <div
          className="grid gap-3.5"
          style={{ flex: '0 1 320px', minWidth: '270px' }}
        >
          {/* Themes This Period */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '18px',
            }}
          >
            <div
              className="font-mono uppercase mb-3.5"
              style={{
                fontSize: '10px',
                letterSpacing: '.12em',
                color: 'var(--text3)',
              }}
            >
              Themes this period
            </div>
            {themeRows.map((t, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between mb-1.5" style={{ fontSize: '13.5px' }}>
                  <span>{t.label}</span>
                  <span className="font-mono" style={{ color: 'var(--text3)' }}>
                    {t.n}
                  </span>
                </div>
                <div
                  className="overflow-hidden"
                  style={{
                    height: '2px',
                    background: 'var(--panel2)',
                    borderRadius: '2px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--accent)',
                      width: t.pct,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Reflective Questions */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '18px',
            }}
          >
            <div
              className="font-mono uppercase mb-3"
              style={{
                fontSize: '10px',
                letterSpacing: '.12em',
                color: 'var(--text3)',
              }}
            >
              Reflective questions
            </div>
            <div
              className="grid gap-3"
              style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--text2)' }}
            >
              <div>What did acknowledgement look like on your best days?</div>
              <div>Which of the four team-change thoughts felt most real?</div>
            </div>
          </div>

          {/* Security & Owner Scoping Note */}
          <div
            className="font-mono"
            style={{
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '18px',
              fontSize: '11px',
              lineHeight: 1.8,
              color: 'var(--text3)',
            }}
          >
            <div>source · users/{`{uid}`}/entries</div>
            <div>scope · 17 docs, owner-read only</div>
            <div>sent to gemini · summaries, not raw entries</div>
          </div>
        </div>
      </div>
    </div>
  );
}
