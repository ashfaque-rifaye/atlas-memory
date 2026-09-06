import React, { useState } from 'react';
import { UserProfile, PatternInsight } from '../types';

interface PatternsScreenProps {
  currentUser: UserProfile;
  onExplorePattern: (pattern: PatternInsight) => void;
}

interface PatternItem {
  title: string;
  evidence: string;
  body: string;
  entries: { date: string; text: string }[];
  inquiry: string;
}

const PATTERNS: PatternItem[] = [
  {
    title: 'Work recognition',
    evidence: 'Appeared in 11 entries',
    body: "Your frustration wasn't primarily caused by workload. It appeared most often when you felt your contribution wasn't being acknowledged.",
    entries: [
      { date: 'Sep 6', text: '“nobody notices”' },
      { date: 'Sep 14', text: 'review skipped the migration' },
      { date: 'Sep 21', text: '“what I need from my manager”' },
    ],
    inquiry: 'What would genuine recognition look like in your next performance review?',
  },
  {
    title: 'Sleep & productivity',
    evidence: 'Low-energy days correlated with late nights',
    body: 'On the nine days you wrote after 1am, the following entry averaged 3.1 out of 10 on energy. Days after an early night averaged 6.4.',
    entries: [
      { date: 'Sep 3', text: 'up until 2, wrote nothing useful' },
      { date: 'Sep 12', text: 'early night, cleared the backlog' },
    ],
    inquiry: 'What boundary could protect your evenings between 10pm and midnight?',
  },
  {
    title: 'Decision uncertainty',
    evidence: 'You reconsidered the same project 4 times',
    body: 'Project X came back on Sep 6, 11, 19 and 27. Each return followed a meeting, not a workload change.',
    entries: [
      { date: 'Sep 11', text: '“maybe I should just ask to move”' },
      { date: 'Sep 27', text: '“still circling this”' },
    ],
    inquiry: 'What is the one unresolved question keeping you anchored to Project X?',
  },
];

export function PatternsScreen({ currentUser, onExplorePattern }: PatternsScreenProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [activeInquiryModal, setActiveInquiryModal] = useState<PatternItem | null>(null);
  const [inquiryChat, setInquiryChat] = useState<{ role: 'user' | 'gemini'; text: string }[]>([]);
  const [inquiryDraft, setInquiryDraft] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const handleOpenExplore = (p: PatternItem) => {
    setActiveInquiryModal(p);
    setInquiryChat([
      {
        role: 'gemini',
        text: `Looking across your reflections on "${p.title}", ${p.body} ${p.inquiry}`,
      },
    ]);
  };

  const handleSendInquiry = async () => {
    const text = inquiryDraft.trim();
    if (!text || inquiryLoading || !activeInquiryModal) return;

    setInquiryChat((prev) => [...prev, { role: 'user', text }]);
    setInquiryDraft('');
    setInquiryLoading(true);

    try {
      const res = await fetch('/api/explore-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: {
            title: activeInquiryModal.title,
            observation: activeInquiryModal.body,
            rootCause: activeInquiryModal.evidence,
            actionableInquiry: activeInquiryModal.inquiry,
          },
          userReflection: text,
        }),
      });
      const data = await res.json();
      setInquiryChat((prev) => [
        ...prev,
        {
          role: 'gemini',
          text: data.exploration || 'That is a significant observation. What does your instinct tell you is the next small step?',
        },
      ]);
    } catch {
      setInquiryChat((prev) => [
        ...prev,
        {
          role: 'gemini',
          text: 'Notice how when you articulate that need clearly, the tension shifts from helplessness to an actionable question. How could you test that hypothesis this week?',
        },
      ]);
    } finally {
      setInquiryLoading(false);
    }
  };

  return (
    <div data-screen-label="Patterns">
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
          Patterns · last 30 days
        </div>
        <h1
          className="font-medium mt-2 m-0"
          style={{
            fontSize: 'clamp(26px, 3vw, 34px)',
            letterSpacing: '-0.03em',
          }}
        >
          Three patterns emerged this month
        </h1>
      </div>

      {/* Accordion List */}
      <div className="grid gap-3" style={{ maxWidth: '900px' }}>
        {PATTERNS.map((p, idx) => {
          const isOpen = openIndex === idx;
          const numberLabel = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={idx}
              style={{
                border: '1px solid var(--line)',
                borderRadius: '3px',
                background: isOpen ? 'var(--panel)' : 'transparent',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full text-left flex flex-wrap items-baseline gap-3.5 border-none bg-transparent cursor-pointer"
                style={{
                  padding: '20px clamp(18px, 2.5vw, 26px)',
                  color: 'var(--text)',
                }}
              >
                <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text3)' }}>
                  {numberLabel}
                </span>
                <span
                  style={{
                    flex: '1 1 180px',
                    minWidth: '180px',
                    fontSize: 'clamp(18px, 2vw, 21px)',
                    letterSpacing: '-0.025em',
                    fontWeight: 500,
                  }}
                >
                  {p.title}
                </span>
                <span style={{ fontSize: '13.5px', color: 'var(--text2)' }}>
                  {p.evidence}
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: '13px', color: 'var(--accent)' }}
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div
                  className="animate-fade"
                  style={{ padding: '0 clamp(18px, 2.5vw, 26px) 24px' }}
                >
                  <div
                    style={{
                      height: '1px',
                      background: 'var(--hair)',
                      marginBottom: '20px',
                    }}
                  />

                  <div className="flex flex-wrap gap-6">
                    <div
                      style={{
                        flex: '1 1 320px',
                        minWidth: '260px',
                        fontSize: '16px',
                        lineHeight: 1.6,
                        textWrap: 'pretty',
                      }}
                    >
                      {p.body}
                    </div>

                    <div style={{ flex: '0 1 240px', minWidth: '200px' }}>
                      <div
                        className="font-mono uppercase mb-2.5"
                        style={{
                          fontSize: '10px',
                          letterSpacing: '.12em',
                          color: 'var(--text3)',
                        }}
                      >
                        Appears in
                      </div>
                      <div className="grid gap-2">
                        {p.entries.map((e, eIdx) => (
                          <div
                            key={eIdx}
                            className="flex gap-2.5"
                            style={{ fontSize: '13px', color: 'var(--text2)' }}
                          >
                            <span
                              className="font-mono shrink-0"
                              style={{ color: 'var(--text3)' }}
                            >
                              {e.date}
                            </span>
                            <span style={{ textWrap: 'pretty' }}>{e.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenExplore(p)}
                    className="cursor-pointer mt-5.5 transition-opacity hover:opacity-85"
                    style={{
                      padding: '9px 14px',
                      borderRadius: '2px',
                      border: '1px solid var(--accent-line)',
                      background: 'var(--accent-dim)',
                      color: 'var(--text)',
                      fontSize: '13.5px',
                    }}
                  >
                    Explore pattern with Gemini
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <div
        className="mt-5"
        style={{
          fontSize: '13px',
          color: 'var(--text3)',
          maxWidth: '66ch',
          textWrap: 'pretty',
        }}
      >
        Patterns are computed only across your own entries. Nothing is compared against other users, and no pattern is stored as a permanent label on you.
      </div>

      {/* Interactive Socratic Pattern Inquiry Modal */}
      {activeInquiryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)' }}
        >
          <div
            className="w-full max-w-xl flex flex-col"
            style={{
              maxHeight: '85vh',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              background: 'var(--panel)',
              color: 'var(--text)',
            }}
          >
            <div
              className="flex items-center justify-between p-4.5 border-b"
              style={{ borderColor: 'var(--hair)' }}
            >
              <div>
                <div
                  className="font-mono uppercase text-[10px] tracking-[.12em]"
                  style={{ color: 'var(--accent)' }}
                >
                  Pattern Inquiry · {activeInquiryModal.title}
                </div>
                <div className="text-sm font-medium mt-0.5">Socratic Exploration</div>
              </div>
              <button
                onClick={() => setActiveInquiryModal(null)}
                className="border-none bg-transparent cursor-pointer p-1 text-base"
                style={{ color: 'var(--text3)' }}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {inquiryChat.map((m, i) => (
                <div
                  key={i}
                  className="animate-rise"
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                  }}
                >
                  <div
                    className="font-mono uppercase text-[10px] tracking-[.12em] mb-1"
                    style={{ color: 'var(--text3)' }}
                  >
                    {m.role === 'user' ? 'You' : 'Gemini'}
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      lineHeight: 1.6,
                      color: m.role === 'user' ? 'var(--text)' : 'var(--text2)',
                      borderLeft: m.role === 'gemini' ? '1.5px solid var(--accent)' : 'none',
                      paddingLeft: m.role === 'gemini' ? '12px' : '0',
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {inquiryLoading && (
                <div className="font-mono text-xs" style={{ color: 'var(--text3)' }}>
                  reflecting…
                </div>
              )}
            </div>

            <div
              className="p-3.5 border-t flex gap-2.5 items-end"
              style={{ borderColor: 'var(--hair)', background: 'var(--bg)' }}
            >
              <textarea
                rows={2}
                value={inquiryDraft}
                onChange={(e) => setInquiryDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendInquiry();
                  }
                }}
                placeholder="Reflect on this pattern..."
                className="w-full resize-none outline-none border-none text-sm p-1"
                style={{ background: 'transparent', color: 'var(--text)' }}
              />
              <button
                onClick={handleSendInquiry}
                disabled={inquiryLoading || !inquiryDraft.trim()}
                className="shrink-0 cursor-pointer px-3.5 py-2 text-xs font-medium transition-opacity disabled:opacity-40"
                style={{
                  borderRadius: '2px',
                  border: '1px solid var(--accent-line)',
                  background: 'var(--accent-dim)',
                  color: 'var(--text)',
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
