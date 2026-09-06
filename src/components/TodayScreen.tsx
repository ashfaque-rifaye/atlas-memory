import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, JournalEntry } from '../types';

interface TodayScreenProps {
  currentUser: UserProfile;
  onTrackDecision: (decisionData: {
    decision: string;
    reasoning: string;
    confidence: number;
    expectedOutcome: string;
  }) => void;
  onEntrySaved: (entry: JournalEntry) => void;
  onGoDecisions: () => void;
}

interface ExtractedField {
  k: string;
  v: string;
  tint: string;
  bar?: boolean;
  pct?: string;
}

const DEFAULT_REPLY =
  "That sounds draining — doing the work and then having to argue for it. Was it the meeting itself, or that the review didn't mention what you'd shipped?";

const DEFAULT_FIELDS: ExtractedField[] = [
  { k: 'mood', v: 'Frustrated', tint: 'var(--clay)' },
  { k: 'intensity', v: '8 / 10', tint: 'var(--clay)', bar: true, pct: '80%' },
  { k: 'themes', v: 'Work · Recognition', tint: 'var(--text)' },
  { k: 'people', v: 'Manager', tint: 'var(--text)' },
  { k: 'event', v: 'Project review', tint: 'var(--text)' },
  { k: 'location', v: 'Office', tint: 'var(--text2)' },
  { k: 'potential decision', v: 'Discuss expectations with manager', tint: 'var(--accent)' },
];

const DEFAULT_JSON = `{
  "summary": "A project review left her feeling
     unseen despite heavy output.",
  "mood": "frustrated",
  "moodScore": 8,
  "themes": ["work", "recognition"],
  "people": ["manager"],
  "events": ["project review"],
  "decisions": ["discuss expectations"],
  "goals": [],
  "location": null
}`;

const DIR_NOTES: Record<'a' | 'b' | 'c', string> = {
  a: 'Direction A — sidecar. The record builds beside the conversation, field by field. Most legible for a demo; stacks under the thread on narrower screens.',
  b: 'Direction B — live strip. One reading column; extraction arrives underneath as a progress-metered row of chips. Motion carries the idea that Gemini is still working.',
  c: 'Direction C — margin. No chat bubbles at all: you write, Gemini answers in the margin, and the record stays folded into ambient chips until you ask for it.',
};

export function TodayScreen({
  currentUser,
  onTrackDecision,
  onEntrySaved,
  onGoDecisions,
}: TodayScreenProps) {
  const [dir, setDir] = useState<'a' | 'b' | 'c'>('a');
  const [draft, setDraft] = useState(
    "I had a horrible meeting today. I feel like I'm doing a lot but nobody notices."
  );
  const [phase, setPhase] = useState<'idle' | 'thinking' | 'replying' | 'extracting' | 'done'>('idle');
  const [reply, setReply] = useState('');
  const [stage, setStage] = useState(0);
  const [showJson, setShowJson] = useState(false);
  const [ambientOpen, setAmbientOpen] = useState(false);
  const [decisionState, setDecisionState] = useState<'none' | 'offer' | 'saved' | 'dismissed'>('none');
  const [sentText, setSentText] = useState('');
  const [activeFields, setActiveFields] = useState<ExtractedField[]>(DEFAULT_FIELDS);
  const [rawJson, setRawJson] = useState(DEFAULT_JSON);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const handleSend = async () => {
    if (phase !== 'idle' && phase !== 'done') return;
    const textToSend = draft.trim();
    if (!textToSend) return;

    clearAllTimers();
    setSentText(textToSend);
    setPhase('thinking');
    setReply('');
    setStage(0);
    setDecisionState('none');
    setAmbientOpen(false);

    // If using the worked example prompt, replay the exact calibrated timing from design doc
    if (textToSend.includes('horrible meeting today')) {
      setActiveFields(DEFAULT_FIELDS);
      setRawJson(DEFAULT_JSON);

      later(() => {
        setPhase('replying');
        const words = DEFAULT_REPLY.split(' ');
        words.forEach((_, i) => {
          later(() => {
            setReply(words.slice(0, i + 1).join(' '));
          }, i * 46);
        });

        later(() => {
          setPhase('extracting');
          DEFAULT_FIELDS.forEach((_, i) => {
            later(() => {
              setStage(i + 1);
            }, 230 + i * 260);
          });

          later(() => {
            setPhase('done');
            setDecisionState('offer');
          }, 230 + DEFAULT_FIELDS.length * 260);
        }, words.length * 46 + 320);
      }, 900);
      return;
    }

    // Otherwise, query live backend endpoints
    try {
      // 1. Chat endpoint
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: textToSend }],
          userContext: { uid: currentUser.uid, name: currentUser.displayName },
        }),
      });

      const chatData = await chatRes.json();
      const aiReply = chatData.reply || DEFAULT_REPLY;

      setPhase('replying');
      const words = aiReply.split(' ');
      words.forEach((_: string, i: number) => {
        later(() => {
          setReply(words.slice(0, i + 1).join(' '));
        }, i * 40);
      });

      // 2. Extract structured memory endpoint
      const extractRes = await fetch('/api/extract-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: textToSend },
            { role: 'model', content: aiReply },
          ],
          title: 'Reflection',
        }),
      });

      const extracted = await extractRes.json();
      const dynamicFields: ExtractedField[] = [
        {
          k: 'mood',
          v: extracted.mood ? extracted.mood.charAt(0).toUpperCase() + extracted.mood.slice(1) : 'Reflective',
          tint: extracted.moodScore && extracted.moodScore >= 7 ? 'var(--accent)' : 'var(--clay)',
        },
        {
          k: 'intensity',
          v: `${extracted.moodScore || 7} / 10`,
          tint: extracted.moodScore && extracted.moodScore >= 7 ? 'var(--accent)' : 'var(--clay)',
          bar: true,
          pct: `${(extracted.moodScore || 7) * 10}%`,
        },
        {
          k: 'themes',
          v: extracted.themes?.length ? extracted.themes.join(' · ') : 'General',
          tint: 'var(--text)',
        },
        {
          k: 'people',
          v: extracted.people?.length ? extracted.people.join(', ') : 'Self',
          tint: 'var(--text)',
        },
        {
          k: 'event',
          v: extracted.events?.length ? extracted.events.join(', ') : 'Daily check-in',
          tint: 'var(--text)',
        },
        {
          k: 'location',
          v: extracted.location || 'Local',
          tint: 'var(--text2)',
        },
      ];

      const potentialDec = extracted.potentialDecisions?.[0];
      if (potentialDec) {
        dynamicFields.push({
          k: 'potential decision',
          v: potentialDec.decision,
          tint: 'var(--accent)',
        });
      }

      setActiveFields(dynamicFields);
      setRawJson(JSON.stringify(extracted, null, 2));

      later(() => {
        setPhase('extracting');
        dynamicFields.forEach((_, i) => {
          later(() => setStage(i + 1), 200 + i * 240);
        });

        later(() => {
          setPhase('done');
          if (potentialDec) {
            setDecisionState('offer');
          }
        }, 200 + dynamicFields.length * 240);
      }, words.length * 40 + 300);

      // Save entry to state
      onEntrySaved({
        id: `entry-${Date.now()}`,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        title: textToSend.slice(0, 36) + '...',
        messages: [
          { id: '1', role: 'user', content: textToSend, timestamp: new Date().toISOString() },
          { id: '2', role: 'model', content: aiReply, timestamp: new Date().toISOString() },
        ],
        summary: extracted.summary || textToSend,
        mood: extracted.mood || 'Reflective',
        moodScore: extracted.moodScore || 7,
        themes: extracted.themes || ['Reflection'],
        people: extracted.people || [],
        events: extracted.events || [],
        location: extracted.location || null,
        goals: extracted.goals || [],
      });
    } catch {
      // Fallback to demo reply
      setReply(DEFAULT_REPLY);
      setPhase('done');
      setActiveFields(DEFAULT_FIELDS);
      setStage(DEFAULT_FIELDS.length);
      setDecisionState('offer');
    }
  };

  const handleReplay = () => {
    clearAllTimers();
    setDraft("I had a horrible meeting today. I feel like I'm doing a lot but nobody notices.");
    setPhase('idle');
    setReply('');
    setStage(0);
    setDecisionState('none');
    setAmbientOpen(false);
    later(() => handleSend(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirmDecision = () => {
    const potField = activeFields.find((f) => f.k === 'potential decision');
    const decisionText = potField ? potField.v : 'Discuss expectations with manager';

    onTrackDecision({
      decision: decisionText,
      reasoning: 'Recognition, not workload, is what keeps going wrong.',
      confidence: 64,
      expectedOutcome: 'A shared definition of what my work is worth',
    });
    setDecisionState('saved');
  };

  const started = phase !== 'idle';
  const displayedFields = activeFields.slice(0, stage);
  const progressPct = Math.round((stage / activeFields.length) * 100) + '%';

  const turns: { who: string; text: string; align: 'flex-end' | 'flex-start'; color: string }[] = [];
  if (started) {
    turns.push({ who: 'You · 4:12pm', text: sentText, align: 'flex-end', color: 'var(--text)' });
  }
  if (reply) {
    turns.push({ who: 'Gemini', text: reply, align: 'flex-start', color: 'var(--text2)' });
  }

  return (
    <div data-screen-label="Today">
      {/* Screen Header & Capture switcher */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '.14em',
              color: 'var(--text3)',
            }}
          >
            Sunday, September 6
          </div>
          <h1
            className="font-medium mt-2 m-0"
            style={{
              fontSize: 'clamp(26px, 3vw, 34px)',
              letterSpacing: '-0.03em',
            }}
          >
            How are you really doing?
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="font-mono uppercase"
            style={{
              fontSize: '10.5px',
              letterSpacing: '.1em',
              color: 'var(--text3)',
            }}
          >
            Capture
          </span>
          <div
            className="flex overflow-hidden"
            style={{
              border: '1px solid var(--line)',
              borderRadius: '2px',
            }}
          >
            {(
              [
                ['a', 'Sidecar'],
                ['b', 'Live strip'],
                ['c', 'Margin'],
              ] as const
            ).map(([modeId, label]) => {
              const active = dir === modeId;
              return (
                <button
                  key={modeId}
                  onClick={() => setDir(modeId)}
                  className="cursor-pointer transition-colors"
                  style={{
                    padding: '7px 12px',
                    border: 'none',
                    fontSize: '12.5px',
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text2)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Direction A: Sidecar */}
      {dir === 'a' && (
        <div className="flex flex-wrap gap-5 items-start">
          {/* Thread Left */}
          <div
            className="flex flex-col"
            style={{
              flex: '1 1 420px',
              minWidth: '300px',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              background: 'var(--panel)',
              minHeight: '460px',
            }}
          >
            <div className="flex-1 flex flex-col gap-4.5 p-6">
              {!started && (
                <div style={{ color: 'var(--text3)', fontSize: '14px', lineHeight: 1.6 }}>
                  Start writing about an experience, a conversation, or a crossroad. Gemini will read it once for the reflection, once for the record.
                </div>
              )}

              {turns.map((t, idx) => (
                <div key={idx} style={{ maxWidth: '88%', alignSelf: t.align }}>
                  <div
                    className="font-mono uppercase mb-1.5"
                    style={{
                      fontSize: '10px',
                      letterSpacing: '.12em',
                      color: 'var(--text3)',
                    }}
                  >
                    {t.who}
                  </div>
                  <div
                    style={{
                      fontSize: '15.5px',
                      lineHeight: 1.6,
                      color: t.color,
                      textWrap: 'pretty',
                    }}
                  >
                    {t.text}
                  </div>
                </div>
              ))}

              {phase === 'thinking' && (
                <div className="flex gap-1.5 items-center py-2">
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      animation: 'pulseDot 1.1s infinite',
                    }}
                  />
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      animation: 'pulseDot 1.1s 0.18s infinite',
                    }}
                  />
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      animation: 'pulseDot 1.1s 0.36s infinite',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div
              className="flex gap-3 items-end"
              style={{
                borderTop: '1px solid var(--hair)',
                padding: '14px 16px',
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="What's on your mind?"
                className="w-full resize-none outline-none border-none"
                style={{
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: '15px',
                  lineHeight: 1.55,
                  padding: '6px 0',
                }}
              />
              <button
                onClick={handleSend}
                className="shrink-0 cursor-pointer transition-opacity hover:opacity-85"
                style={{
                  padding: '9px 16px',
                  borderRadius: '2px',
                  border: '1px solid var(--accent-line)',
                  background: 'var(--accent-dim)',
                  color: 'var(--text)',
                  fontSize: '13.5px',
                  fontWeight: 500,
                }}
              >
                Send
              </button>
            </div>
          </div>

          {/* Record Panel Right */}
          <div
            style={{
              flex: '0 1 340px',
              minWidth: '280px',
              border: '1px solid var(--line)',
              borderRadius: '3px',
              background: 'var(--bg)',
            }}
          >
            <div
              className="flex items-center justify-between gap-3"
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid var(--hair)',
              }}
            >
              <div
                className="font-mono uppercase"
                style={{
                  fontSize: '10.5px',
                  letterSpacing: '.12em',
                  color: 'var(--text3)',
                }}
              >
                {phase === 'extracting' ? 'Extracting…' : 'Memory record'}
              </div>
              <button
                onClick={() => setShowJson(!showJson)}
                className="font-mono cursor-pointer p-0 border-none bg-transparent"
                style={{
                  color: 'var(--accent)',
                  fontSize: '10.5px',
                }}
              >
                {showJson ? 'fields' : 'json'}
              </button>
            </div>

            {showJson ? (
              <pre
                className="font-mono overflow-x-auto whitespace-pre-wrap m-0"
                style={{
                  padding: '18px',
                  fontSize: '11.5px',
                  lineHeight: 1.75,
                  color: 'var(--text2)',
                }}
              >
                {rawJson}
              </pre>
            ) : (
              <div style={{ padding: '6px 18px 18px' }}>
                {!started && (
                  <div
                    style={{
                      padding: '26px 0',
                      fontSize: '13.5px',
                      lineHeight: 1.65,
                      color: 'var(--text3)',
                      textWrap: 'pretty',
                    }}
                  >
                    Nothing captured yet. Write a few sentences and Gemini will pull the record out of the conversation — you never fill a form.
                  </div>
                )}

                {displayedFields.map((f, idx) => (
                  <div
                    key={idx}
                    className="animate-rise"
                    style={{
                      padding: '13px 0',
                      borderBottom: '1px solid var(--hair)',
                    }}
                  >
                    <div
                      className="font-mono uppercase mb-1.5"
                      style={{
                        fontSize: '10px',
                        letterSpacing: '.12em',
                        color: 'var(--text3)',
                      }}
                    >
                      {f.k}
                    </div>
                    <div style={{ fontSize: '14.5px', lineHeight: 1.45, color: f.tint }}>
                      {f.v}
                    </div>
                    {f.bar && (
                      <div
                        className="overflow-hidden mt-2.5"
                        style={{
                          height: '3px',
                          background: 'var(--panel2)',
                          borderRadius: '2px',
                        }}
                      >
                        <div
                          className="animate-sweep"
                          style={{
                            height: '100%',
                            background: 'var(--clay)',
                            width: f.pct || '80%',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {decisionState === 'offer' && (
                  <div
                    className="animate-rise mt-4.5"
                    style={{
                      border: '1px solid var(--accent-line)',
                      borderRadius: '3px',
                      padding: '15px',
                      background: 'var(--accent-dim)',
                    }}
                  >
                    <div style={{ fontSize: '14px', lineHeight: 1.5, marginBottom: '12px', textWrap: 'pretty' }}>
                      A decision may be forming here. Turn it into one?
                    </div>
                    <div
                      className="font-mono mb-3.5"
                      style={{ fontSize: '12px', color: 'var(--text2)' }}
                    >
                      “discuss expectations with manager”
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={handleConfirmDecision}
                        className="cursor-pointer transition-colors hover:bg-[rgba(147,188,161,.12)]"
                        style={{
                          padding: '8px 13px',
                          borderRadius: '2px',
                          border: '1px solid var(--accent)',
                          background: 'transparent',
                          color: 'var(--text)',
                          fontSize: '13px',
                        }}
                      >
                        Track decision
                      </button>
                      <button
                        onClick={() => setDecisionState('dismissed')}
                        className="cursor-pointer transition-colors hover:text-[var(--text2)]"
                        style={{
                          padding: '8px 13px',
                          borderRadius: '2px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text3)',
                          fontSize: '13px',
                        }}
                      >
                        Not now
                      </button>
                    </div>
                  </div>
                )}

                {decisionState === 'saved' && (
                  <div
                    className="animate-fade mt-4.5"
                    style={{
                      fontSize: '13.5px',
                      lineHeight: 1.6,
                      color: 'var(--accent)',
                    }}
                  >
                    Tracked. It will come back to you in 30 days.{' '}
                    <a
                      href="#decisions"
                      onClick={(e) => {
                        e.preventDefault();
                        onGoDecisions();
                      }}
                      style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                    >
                      Open ledger
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direction B: Live strip */}
      {dir === 'b' && (
        <div className="mx-auto" style={{ maxWidth: '760px' }}>
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '3px',
              background: 'var(--panel)',
              padding: 'clamp(20px, 3vw, 32px)',
            }}
          >
            <div className="flex flex-col gap-5.5">
              {!started && (
                <div style={{ color: 'var(--text3)', fontSize: '15px', lineHeight: 1.6 }}>
                  Write freely. Once you finish your entry, the structured memory chips will form below in real time.
                </div>
              )}

              {turns.map((t, idx) => (
                <div key={idx}>
                  <div
                    className="font-mono uppercase mb-2"
                    style={{
                      fontSize: '10px',
                      letterSpacing: '.12em',
                      color: 'var(--text3)',
                    }}
                  >
                    {t.who}
                  </div>
                  <div
                    style={{
                      fontSize: '17px',
                      lineHeight: 1.62,
                      color: t.color,
                      textWrap: 'pretty',
                    }}
                  >
                    {t.text}
                  </div>
                </div>
              ))}

              {phase === 'thinking' && (
                <div className="font-mono" style={{ fontSize: '11.5px', color: 'var(--text3)' }}>
                  reading<span className="animate-caret">…</span>
                </div>
              )}
            </div>

            {(stage > 0 || phase === 'extracting') && (
              <div
                className="animate-fade mt-7 pt-5"
                style={{ borderTop: '1px solid var(--hair)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="font-mono uppercase"
                    style={{
                      fontSize: '10.5px',
                      letterSpacing: '.12em',
                      color: 'var(--text3)',
                    }}
                  >
                    {phase === 'extracting' ? 'Extracting…' : 'Memory record'}
                  </div>
                  <div
                    className="flex-1 overflow-hidden"
                    style={{
                      height: '1.5px',
                      background: 'var(--panel2)',
                      borderRadius: '2px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: 'var(--accent)',
                        transformOrigin: 'left',
                        transition: 'width .5s ease',
                        width: progressPct,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {displayedFields
                    .filter((f) => !f.bar)
                    .map((f, idx) => (
                      <div
                        key={idx}
                        className="animate-rise flex items-baseline gap-2"
                        style={{
                          border: '1px solid var(--line)',
                          borderRadius: '2px',
                          padding: '8px 12px',
                          background: 'var(--bg)',
                        }}
                      >
                        <span
                          className="font-mono uppercase"
                          style={{
                            fontSize: '10px',
                            letterSpacing: '.1em',
                            color: 'var(--text3)',
                          }}
                        >
                          {f.k}
                        </span>
                        <span style={{ fontSize: '14px', color: f.tint }}>{f.v}</span>
                      </div>
                    ))}
                </div>

                {decisionState === 'offer' && (
                  <div
                    className="animate-rise mt-4 flex flex-wrap items-center gap-3"
                    style={{ fontSize: '14px', color: 'var(--text2)' }}
                  >
                    <span>Decision detected — “discuss expectations with manager”</span>
                    <button
                      onClick={handleConfirmDecision}
                      className="cursor-pointer"
                      style={{
                        padding: '7px 12px',
                        borderRadius: '2px',
                        border: '1px solid var(--accent)',
                        background: 'transparent',
                        color: 'var(--text)',
                        fontSize: '13px',
                      }}
                    >
                      Track it
                    </button>
                  </div>
                )}

                {decisionState === 'saved' && (
                  <div className="mt-4" style={{ fontSize: '13.5px', color: 'var(--accent)' }}>
                    Tracked. Revisit scheduled for October 6.{' '}
                    <a
                      href="#decisions"
                      onClick={(e) => {
                        e.preventDefault();
                        onGoDecisions();
                      }}
                      style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                    >
                      Open ledger
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className="flex gap-3 items-end mt-3.5"
            style={{
              border: '1px solid var(--line)',
              borderRadius: '3px',
              background: 'var(--bg)',
              padding: '14px 16px',
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="What's on your mind?"
              className="w-full resize-none outline-none border-none"
              style={{
                background: 'transparent',
                color: 'var(--text)',
                fontSize: '16px',
                lineHeight: 1.55,
                padding: '6px 0',
              }}
            />
            <button
              onClick={handleSend}
              className="shrink-0 cursor-pointer transition-opacity hover:opacity-85"
              style={{
                padding: '9px 16px',
                borderRadius: '2px',
                border: '1px solid var(--accent-line)',
                background: 'var(--accent-dim)',
                color: 'var(--text)',
                fontSize: '13.5px',
                fontWeight: 500,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Direction C: Margin */}
      {dir === 'c' && (
        <div
          className="flex flex-wrap overflow-hidden"
          style={{
            border: '1px solid var(--line)',
            borderRadius: '3px',
            background: 'var(--panel)',
          }}
        >
          {/* Writing Surface Left */}
          <div
            style={{
              flex: '1 1 460px',
              minWidth: '300px',
              padding: 'clamp(22px, 3vw, 38px)',
              borderRight: '1px solid var(--hair)',
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder="Write freely. Nobody is reading this but you."
              className="w-full resize-none outline-none border-none"
              style={{
                background: 'transparent',
                color: 'var(--text)',
                fontSize: '19px',
                lineHeight: 1.65,
                letterSpacing: '-0.015em',
              }}
            />

            {started && (
              <div
                className="animate-fade mt-6 pt-5"
                style={{ borderTop: '1px solid var(--hair)' }}
              >
                <div
                  className="font-mono uppercase mb-2.5"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '.12em',
                    color: 'var(--text3)',
                  }}
                >
                  Entry · 6 Sep
                </div>
                <div
                  style={{
                    fontSize: '19px',
                    lineHeight: 1.65,
                    color: 'var(--text2)',
                    textWrap: 'pretty',
                  }}
                >
                  {sentText}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center gap-3 mt-5.5">
              <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text3)' }}>
                {draft.length} characters
              </div>
              <button
                onClick={handleSend}
                className="cursor-pointer transition-opacity hover:opacity-85"
                style={{
                  padding: '9px 16px',
                  borderRadius: '2px',
                  border: '1px solid var(--accent-line)',
                  background: 'var(--accent-dim)',
                  color: 'var(--text)',
                  fontSize: '13.5px',
                  fontWeight: 500,
                }}
              >
                Save entry
              </button>
            </div>
          </div>

          {/* Margin Column Right */}
          <div
            style={{
              flex: '0 1 320px',
              minWidth: '260px',
              padding: 'clamp(22px, 3vw, 32px)',
              background: 'var(--bg)',
            }}
          >
            <div
              className="font-mono uppercase mb-4"
              style={{
                fontSize: '10.5px',
                letterSpacing: '.12em',
                color: 'var(--text3)',
              }}
            >
              Margin
            </div>

            {phase === 'thinking' && (
              <div className="font-mono" style={{ fontSize: '11.5px', color: 'var(--text3)' }}>
                thinking<span className="animate-caret">_</span>
              </div>
            )}

            {reply && (
              <div
                className="animate-rise"
                style={{
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: 'var(--text)',
                  borderLeft: '1.5px solid var(--accent)',
                  paddingLeft: '14px',
                  textWrap: 'pretty',
                }}
              >
                {reply}
              </div>
            )}

            {stage > 0 && (
              <div className="mt-6.5 pt-5" style={{ borderTop: '1px solid var(--hair)' }}>
                <button
                  onClick={() => setAmbientOpen(!ambientOpen)}
                  className="w-full flex items-center justify-between gap-2.5 border-none bg-transparent cursor-pointer p-0 pb-3"
                  style={{ color: 'var(--text2)', fontSize: '13px' }}
                >
                  <span>{ambientOpen ? 'Memory record' : `${displayedFields.length} things noted`}</span>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent)' }}>
                    {ambientOpen ? 'hide' : 'expand'}
                  </span>
                </button>

                {ambientOpen ? (
                  <div className="animate-fade grid gap-2.5">
                    {displayedFields.map((f, idx) => (
                      <div
                        key={idx}
                        className="font-mono flex justify-between gap-3.5"
                        style={{ fontSize: '11.5px' }}
                      >
                        <span style={{ color: 'var(--text3)' }}>{f.k}</span>
                        <span style={{ textAlign: 'right', color: f.tint }}>{f.v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {displayedFields
                      .filter((f) => !f.bar)
                      .map((c, idx) => (
                        <span
                          key={idx}
                          className="font-mono"
                          style={{
                            fontSize: '11px',
                            padding: '5px 9px',
                            border: '1px solid var(--line)',
                            borderRadius: '2px',
                            color: 'var(--text2)',
                          }}
                        >
                          {c.v}
                        </span>
                      ))}
                  </div>
                )}

                {decisionState === 'offer' && (
                  <button
                    onClick={handleConfirmDecision}
                    className="w-full text-left mt-5 cursor-pointer transition-colors"
                    style={{
                      padding: '12px',
                      border: '1px dashed var(--accent-line)',
                      borderRadius: '2px',
                      background: 'transparent',
                      color: 'var(--text)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }}
                  >
                    Track “discuss expectations with manager” as a decision →
                  </button>
                )}

                {decisionState === 'saved' && (
                  <div className="mt-5" style={{ fontSize: '13px', color: 'var(--accent)' }}>
                    Decision tracked.{' '}
                    <a
                      href="#decisions"
                      onClick={(e) => {
                        e.preventDefault();
                        onGoDecisions();
                      }}
                      style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                    >
                      Open ledger
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direction Note & Replay Capture Button */}
      <div className="flex flex-wrap gap-3.5 items-center justify-between mt-4.5">
        <div
          style={{
            fontSize: '13px',
            color: 'var(--text3)',
            maxWidth: '60ch',
            textWrap: 'pretty',
          }}
        >
          {DIR_NOTES[dir]}
        </div>

        <button
          onClick={handleReplay}
          className="cursor-pointer transition-colors shrink-0"
          style={{
            padding: '7px 12px',
            borderRadius: '2px',
            border: '1px solid var(--line)',
            background: 'transparent',
            color: 'var(--text2)',
            fontSize: '12.5px',
          }}
        >
          Replay capture
        </button>
      </div>
    </div>
  );
}
