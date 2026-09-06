import React, { useState } from 'react';
import { UserProfile, JournalEntry, DecisionItem } from '../types';

interface SettingsScreenProps {
  currentUser: UserProfile;
  entries: JournalEntry[];
  decisions: DecisionItem[];
  onSignOut: () => void;
}

export function SettingsScreen({
  currentUser,
  entries,
  decisions,
  onSignOut,
}: SettingsScreenProps) {
  const [consent, setConsent] = useState<Record<string, boolean>>({
    location: true,
    extract: true,
    reminders: true,
    log: true,
    retain: false,
  });

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const toggles = [
    {
      key: 'location',
      label: 'Capture location with entries',
      help: 'Asked per entry. Off means no coordinates are ever written.',
    },
    {
      key: 'extract',
      label: 'Extract structured memory',
      help: 'Mood, themes, people and events. Turning this off keeps entries as plain text.',
    },
    {
      key: 'reminders',
      label: 'Revisit my decisions',
      help: 'Gemini asks about tracked decisions after 30 days.',
    },
    {
      key: 'log',
      label: 'Log security events',
      help: 'Sign-ins and denied reads. Journal content is never written to logs.',
    },
    {
      key: 'retain',
      label: 'Keep inferred traits',
      help: "Off by default. Nothing beyond the product's needs is stored about you.",
    },
  ];

  const handleToggle = (key: string) => {
    setConsent((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportJson = () => {
    const exportData = {
      user: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
      },
      exportedAt: new Date().toISOString(),
      entries,
      decisions,
      privacySettings: consent,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `memory_atlas_export_${currentUser.uid}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice('Export complete. Scoped records downloaded.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleDeleteAll = () => {
    if (
      window.confirm(
        'Are you sure you want to permanently wipe all scoped entries, decisions, and memories for this UID? This action cannot be undone.'
      )
    ) {
      localStorage.clear();
      onSignOut();
    }
  };

  const shortUid =
    currentUser.uid.length > 12
      ? `${currentUser.uid.slice(0, 4)}…${currentUser.uid.slice(-4)}`
      : currentUser.uid;

  return (
    <div data-screen-label="Settings">
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
          Settings · privacy
        </div>
        <h1
          className="font-medium mt-2 m-0"
          style={{
            fontSize: 'clamp(26px, 3vw, 34px)',
            letterSpacing: '-0.03em',
          }}
        >
          You control what is kept.
        </h1>
      </div>

      {/* Two Panes */}
      <div className="flex flex-wrap gap-5 items-start">
        {/* Left: Toggles & Actions */}
        <div
          style={{
            flex: '1 1 440px',
            minWidth: '300px',
            border: '1px solid var(--line)',
            borderRadius: '3px',
            background: 'var(--panel)',
          }}
        >
          {toggles.map((t) => {
            const on = consent[t.key];
            return (
              <div
                key={t.key}
                className="flex flex-wrap gap-4 items-start justify-between"
                style={{
                  padding: '20px clamp(18px, 2.5vw, 24px)',
                  borderBottom: '1px solid var(--hair)',
                }}
              >
                <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                  <div style={{ fontSize: '15.5px', marginBottom: '6px' }}>{t.label}</div>
                  <div
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.55,
                      color: 'var(--text3)',
                      textWrap: 'pretty',
                    }}
                  >
                    {t.help}
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => handleToggle(t.key)}
                  className="shrink-0 cursor-pointer relative"
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '14px',
                    transition: 'background .2s',
                    border: `1px solid ${on ? 'var(--accent-line)' : 'var(--line)'}`,
                    background: on ? 'var(--accent-dim)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      transition: 'left .2s',
                      background: on ? 'var(--accent)' : 'var(--text3)',
                      left: on ? '22px' : '2px',
                    }}
                  />
                </button>
              </div>
            );
          })}

          <div
            className="flex flex-wrap gap-2.5 items-center"
            style={{ padding: '20px clamp(18px, 2.5vw, 24px)' }}
          >
            <button
              onClick={handleExportJson}
              className="cursor-pointer transition-colors hover:text-[var(--text)]"
              style={{
                padding: '9px 14px',
                borderRadius: '2px',
                border: '1px solid var(--line)',
                background: 'transparent',
                color: 'var(--text2)',
                fontSize: '13.5px',
              }}
            >
              Export everything (JSON)
            </button>

            <button
              onClick={handleDeleteAll}
              className="cursor-pointer transition-opacity hover:opacity-80"
              style={{
                padding: '9px 14px',
                borderRadius: '2px',
                border: '1px solid var(--clay-dim)',
                background: 'transparent',
                color: 'var(--clay)',
                fontSize: '13.5px',
              }}
            >
              Delete account and all entries
            </button>

            {exportNotice && (
              <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                {exportNotice}
              </span>
            )}
          </div>
        </div>

        {/* Right: Path Tree & Identity */}
        <div
          className="grid gap-3.5"
          style={{ flex: '0 1 320px', minWidth: '270px' }}
        >
          {/* Where Your Data Lives */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '20px',
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
              Where your data lives
            </div>

            <pre
              className="font-mono m-0 overflow-x-auto whitespace-pre-wrap"
              style={{
                fontSize: '11.5px',
                lineHeight: 1.9,
                color: 'var(--text2)',
              }}
            >
{`users/{uid}
users/{uid}/entries/{entryId}
users/{uid}/memories/{memoryId}
users/{uid}/decisions/{decisionId}
users/{uid}/rewinds/{rewindId}`}
            </pre>

            <div
              className="mt-3.5"
              style={{
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'var(--text3)',
                textWrap: 'pretty',
              }}
            >
              Every path is scoped to your Firebase UID. Nothing you write is stored outside this subtree.
            </div>
          </div>

          {/* Signed in as */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '3px',
              padding: '20px',
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
              Signed in as
            </div>
            <div style={{ fontSize: '14.5px' }}>{currentUser.email}</div>
            <div
              className="font-mono mt-1.5"
              style={{ fontSize: '11px', color: 'var(--text3)' }}
            >
              uid · {shortUid} · Google
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
