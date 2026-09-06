import React from 'react';
import { UserProfile } from '../types';

export type NavTab = 'today' | 'rewind' | 'decisions' | 'patterns' | 'map' | 'settings' | 'security';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentUser: UserProfile;
  onSignOut: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  theme,
  onToggleTheme,
  currentUser,
  onSignOut,
}: HeaderProps) {
  const tabs: { id: NavTab; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'rewind', label: 'Rewind' },
    { id: 'decisions', label: 'Decisions' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'map', label: 'Memory map' },
    { id: 'settings', label: 'Settings' },
    { id: 'security', label: 'Security' },
  ];

  const userInitial = currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'A';

  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--hair)',
      }}
    >
      <div
        className="mx-auto flex items-center gap-5"
        style={{
          maxWidth: '1240px',
          height: '58px',
          padding: '0 clamp(16px, 3vw, 32px)',
        }}
      >
        {/* Brand */}
        <div
          onClick={() => setActiveTab('today')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <div
            style={{
              width: '12px',
              height: '12px',
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
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            Memory Atlas
          </span>
        </div>

        {/* Nav Tabs */}
        <nav className="flex gap-0.5 overflow-x-auto flex-1 min-w-0 [scrollbar-width:none]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative shrink-0 cursor-pointer transition-colors"
                style={{
                  padding: '8px 11px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '13.5px',
                  color: isActive ? 'var(--text)' : 'var(--text2)',
                }}
              >
                {tab.label}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '11px',
                      right: '11px',
                      bottom: '-1px',
                      height: '1.5px',
                      background: 'var(--accent)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="font-mono flex items-center justify-center cursor-pointer transition-colors"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '1px solid var(--line)',
              background: 'transparent',
              color: 'var(--text2)',
              fontSize: '11px',
            }}
          >
            {theme === 'dark' ? '☾' : '☀'}
          </button>

          {/* User badge & Sign out */}
          <button
            onClick={onSignOut}
            title={`Signed in as ${currentUser.displayName}. Click to sign out.`}
            className="flex items-center gap-2 cursor-pointer transition-colors"
            style={{
              padding: '5px 10px 5px 5px',
              borderRadius: '20px',
              border: '1px solid var(--line)',
              background: 'transparent',
              color: 'var(--text2)',
              fontSize: '12.5px',
            }}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              {userInitial}
            </span>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
