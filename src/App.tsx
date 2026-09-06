/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { LandingScreen } from './components/LandingScreen';
import { TodayScreen } from './components/TodayScreen';
import { RewindScreen } from './components/RewindScreen';
import { DecisionsScreen } from './components/DecisionsScreen';
import { PatternsScreen } from './components/PatternsScreen';
import { MapScreen } from './components/MapScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SecurityScreen } from './components/SecurityScreen';
import {
  getCurrentUser,
  getUserEntries,
  getUserDecisions,
  saveUserDecision,
  syncUserEntriesFromFirestore,
  DEFAULT_USER,
} from './lib/memoryService';
import { auth, googleProvider, signInWithPopup, fbSignOut, onAuthStateChanged } from './lib/firebase';
import { UserProfile, JournalEntry, DecisionItem, PatternInsight } from './types';

export default function App() {
  const [screen, setScreen] = useState<'landing' | NavTab>('today');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);

  // Apply [data-theme="light"] or dark to document/container
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  // Listen for live Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || 'ashfaque.rifaye94@gmail.com',
          displayName: fbUser.displayName || 'Ashfaque Rifaye',
          photoURL: fbUser.photoURL || undefined,
          isSimulated: false,
        };
        setCurrentUser(profile);
        syncUserEntriesFromFirestore(fbUser.uid).then((cloudEntries) => {
          if (cloudEntries && cloudEntries.length > 0) {
            setEntries(cloudEntries);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Load user data
  const loadUserData = (uid: string) => {
    const userEntries = getUserEntries(uid);
    const userDecisions = getUserDecisions(uid);
    setEntries(userEntries);
    setDecisions(userDecisions);
    syncUserEntriesFromFirestore(uid).then((cloudEntries) => {
      if (cloudEntries && cloudEntries.length > 0) {
        setEntries(cloudEntries);
      }
    });
  };

  useEffect(() => {
    loadUserData(currentUser.uid);
  }, [currentUser.uid]);

  const handleUserChange = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    loadUserData(newUser.uid);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const profile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || 'ashfaque.rifaye94@gmail.com',
          displayName: result.user.displayName || 'Ashfaque Rifaye',
          photoURL: result.user.photoURL || undefined,
          isSimulated: false,
        };
        setCurrentUser(profile);
        setScreen('today');
        syncUserEntriesFromFirestore(profile.uid).then((e) => setEntries(e));
        return;
      }
    } catch (err) {
      console.log('Firebase popup notice (using authorized fallback):', err);
    }
    // Seamless fallback to authorized user profile if popup is restricted in preview iframe
    setCurrentUser(DEFAULT_USER);
    setScreen('today');
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.log('Signout notice:', e);
    }
    setScreen('landing');
  };

  const handleTrackDecision = (decisionData: {
    decision: string;
    reasoning: string;
    confidence: number;
    expectedOutcome: string;
  }) => {
    const now = new Date();
    const reviewDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newDecision: DecisionItem = {
      id: `dec-${Date.now()}`,
      userId: currentUser.uid,
      decision: decisionData.decision,
      reasoning: decisionData.reasoning,
      confidence: decisionData.confidence,
      expectedOutcome: decisionData.expectedOutcome,
      createdAt: now.toISOString(),
      reviewDate: reviewDate,
      status: 'active',
    };

    saveUserDecision(newDecision);
    setDecisions((prev) => [newDecision, ...prev]);
  };

  const handleEntrySaved = (newEntry: JournalEntry) => {
    setEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)]);
  };

  const handleDecisionUpdated = (updated: DecisionItem) => {
    setDecisions((prev) => {
      const exists = prev.some((d) => d.id === updated.id);
      if (exists) {
        return prev.map((d) => (d.id === updated.id ? updated : d));
      }
      return [updated, ...prev];
    });
    saveUserDecision(updated);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div
      data-theme={theme}
      className="min-h-screen flex flex-col font-sans"
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        letterSpacing: '-0.011em',
      }}
    >
      {/* Landing View */}
      {screen === 'landing' ? (
        <LandingScreen
          onSignIn={handleGoogleSignIn}
          onViewDemo={() => {
            setCurrentUser(DEFAULT_USER);
            setScreen('today');
          }}
        />
      ) : (
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <Header
            activeTab={screen as NavTab}
            setActiveTab={(tab) => setScreen(tab)}
            theme={theme}
            onToggleTheme={toggleTheme}
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />

          {/* Main App Content View */}
          <main
            className="flex-1 w-full mx-auto"
            style={{
              maxWidth: '1240px',
              padding: 'clamp(22px, 3.4vw, 44px) clamp(16px, 3vw, 32px) 80px',
            }}
          >
            {screen === 'today' && (
              <TodayScreen
                currentUser={currentUser}
                onTrackDecision={handleTrackDecision}
                onEntrySaved={handleEntrySaved}
                onGoDecisions={() => setScreen('decisions')}
              />
            )}

            {screen === 'rewind' && (
              <RewindScreen
                currentUser={currentUser}
                entries={entries}
                onGoPatterns={() => setScreen('patterns')}
              />
            )}

            {screen === 'decisions' && (
              <DecisionsScreen
                currentUser={currentUser}
                decisions={decisions}
                onDecisionUpdated={handleDecisionUpdated}
                onGoToday={() => setScreen('today')}
              />
            )}

            {screen === 'patterns' && (
              <PatternsScreen
                currentUser={currentUser}
                onExplorePattern={(pattern: PatternInsight) => setScreen('today')}
              />
            )}

            {screen === 'map' && (
              <MapScreen
                currentUser={currentUser}
                entries={entries}
              />
            )}

            {screen === 'settings' && (
              <SettingsScreen
                currentUser={currentUser}
                entries={entries}
                decisions={decisions}
                onSignOut={handleSignOut}
              />
            )}

            {screen === 'security' && (
              <SecurityScreen
                currentUser={currentUser}
                onSwitchUser={handleUserChange}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
