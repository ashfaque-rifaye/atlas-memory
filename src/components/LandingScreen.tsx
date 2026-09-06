import React from 'react';

interface LandingScreenProps {
  onSignIn: () => void;
  onViewDemo: () => void;
}

export function LandingScreen({ onSignIn, onViewDemo }: LandingScreenProps) {
  return (
    <div
      data-screen-label="Landing"
      className="min-h-screen grid grid-cols-1 md:grid-cols-2"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Left Pane: Claim & Action */}
      <div
        className="flex flex-col justify-between gap-12 border-r"
        style={{
          padding: 'clamp(28px, 5vw, 72px)',
          borderColor: 'var(--hair)',
          minWidth: 0,
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: '13px',
              height: '13px',
              borderRadius: '50%',
              border: '1.5px solid var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: 'var(--accent)',
              }}
            />
          </div>
          <span className="text-sm font-semibold tracking-[-0.02em]">Memory Atlas</span>
        </div>

        {/* Hero Claim */}
        <div style={{ maxWidth: '520px' }}>
          <div
            className="font-mono uppercase mb-6"
            style={{
              fontSize: '11px',
              letterSpacing: '.14em',
              color: 'var(--text3)',
            }}
          >
            Private AI reflection
          </div>

          <h1
            className="font-medium m-0"
            style={{
              fontSize: 'clamp(34px, 4.4vw, 56px)',
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
            }}
          >
            Most journaling apps store what you wrote.
          </h1>

          <p
            className="mt-5"
            style={{
              fontSize: 'clamp(17px, 1.5vw, 20px)',
              lineHeight: 1.5,
              color: 'var(--text2)',
              maxWidth: '44ch',
            }}
          >
            Memory Atlas helps you understand what your writing reveals over time.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-9">
            <button
              onClick={onSignIn}
              className="flex items-center gap-2.5 cursor-pointer transition-opacity hover:opacity-85"
              style={{
                padding: '13px 20px',
                borderRadius: '2px',
                border: '1px solid var(--accent-line)',
                background: 'var(--accent-dim)',
                color: 'var(--text)',
                fontSize: '15px',
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--accent)',
                  display: 'inline-block',
                }}
              />
              Continue with Google
            </button>

            <button
              onClick={onViewDemo}
              className="cursor-pointer transition-colors hover:text-[var(--text)]"
              style={{
                padding: '13px 20px',
                borderRadius: '2px',
                border: '1px solid var(--line)',
                background: 'transparent',
                color: 'var(--text2)',
                fontSize: '15px',
              }}
            >
              View the demo account
            </button>
          </div>

          <div
            className="font-mono mt-5"
            style={{
              fontSize: '11px',
              lineHeight: 1.7,
              color: 'var(--text3)',
            }}
          >
            Firebase Authentication · entries scoped to your UID · no journal text in logs
          </div>
        </div>

        {/* Footer note */}
        <div style={{ fontSize: '13px', color: 'var(--text3)' }}>
          Your thoughts deserve more than storage.
        </div>
      </div>

      {/* Right Pane: Worked Example Card */}
      <div
        className="flex items-center justify-center"
        style={{
          padding: 'clamp(28px, 5vw, 72px)',
          background: 'var(--panel)',
          minWidth: 0,
        }}
      >
        <div className="w-full" style={{ maxWidth: '440px' }}>
          <div
            className="font-mono uppercase mb-4"
            style={{
              fontSize: '11px',
              letterSpacing: '.14em',
              color: 'var(--text3)',
            }}
          >
            What one entry becomes
          </div>

          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '3px',
              background: 'var(--bg)',
              padding: '22px',
            }}
          >
            <div
              className="italic"
              style={{
                fontSize: '16px',
                lineHeight: 1.55,
                color: 'var(--text2)',
              }}
            >
              “I had a horrible meeting today. I feel like I'm doing a lot but nobody notices.”
            </div>

            <div
              style={{
                height: '1px',
                background: 'var(--hair)',
                margin: '20px -22px',
              }}
            />

            <div
              className="font-mono grid gap-2.5"
              style={{ fontSize: '12px' }}
            >
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--text3)' }}>mood</span>
                <span style={{ color: 'var(--clay)' }}>frustrated · 8/10</span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--text3)' }}>themes</span>
                <span style={{ color: 'var(--text)' }}>work, recognition</span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--text3)' }}>people</span>
                <span style={{ color: 'var(--text)' }}>manager</span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--text3)' }}>event</span>
                <span style={{ color: 'var(--text)' }}>project review</span>
              </div>
              <div className="flex justify-between gap-4">
                <span style={{ color: 'var(--text3)' }}>decision</span>
                <span style={{ color: 'var(--accent)' }}>discuss expectations</span>
              </div>
            </div>
          </div>

          <div
            className="mt-3.5"
            style={{
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text3)',
            }}
          >
            You write. Gemini reads it once for the conversation, once for the record.
          </div>
        </div>
      </div>
    </div>
  );
}
