import { JournalEntry, DecisionItem, LifeRewindReport, UserProfile } from '../types';
import { INITIAL_ENTRIES, INITIAL_DECISIONS, INITIAL_USER_ID, USER_B_ID, INITIAL_USER_B_ENTRIES } from '../data/seedData';
import { db, collection, doc, setDoc, getDocs, deleteDoc } from './firebase';

const STORAGE_KEY_ENTRIES = 'memory_atlas_entries_v1';
const STORAGE_KEY_DECISIONS = 'memory_atlas_decisions_v1';
const STORAGE_KEY_REWINDS = 'memory_atlas_rewinds_v1';
const STORAGE_KEY_USER = 'memory_atlas_user_v1';

export const DEFAULT_USER: UserProfile = {
  uid: INITIAL_USER_ID,
  email: 'ashfaque.rifaye94@gmail.com',
  displayName: 'Ashfaque Rifaye',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  isSimulated: false,
};

export const DEMO_USER_B: UserProfile = {
  uid: USER_B_ID,
  email: 'priya.sharma@example.com',
  displayName: 'Priya Sharma',
  photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  isSimulated: true,
};

// Initialize local store if empty
function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEY_ENTRIES)) {
    // Seed initial entries for both users to demonstrate isolation
    const combined = [...INITIAL_ENTRIES, ...INITIAL_USER_B_ENTRIES];
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(combined));
  }

  if (!localStorage.getItem(STORAGE_KEY_DECISIONS)) {
    localStorage.setItem(STORAGE_KEY_DECISIONS, JSON.stringify(INITIAL_DECISIONS));
  }

  if (!localStorage.getItem(STORAGE_KEY_REWINDS)) {
    localStorage.setItem(STORAGE_KEY_REWINDS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEY_USER)) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEFAULT_USER));
  }
}

export function getCurrentUser(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEY_USER);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER;
    }
  }
  return DEFAULT_USER;
}

export function setCurrentUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

// Strictly owner-isolated entries
export function getUserEntries(uid: string): JournalEntry[] {
  if (typeof window === 'undefined') return INITIAL_ENTRIES.filter(e => e.userId === uid);
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
  if (!raw) return [];
  try {
    const all: JournalEntry[] = JSON.parse(raw);
    // Strict UID filter: User A cannot see User B's entries
    return all.filter(e => e.userId === uid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function syncUserEntriesFromFirestore(uid: string): Promise<JournalEntry[]> {
  try {
    const entriesRef = collection(db, 'users', uid, 'entries');
    const snapshot = await getDocs(entriesRef);
    if (!snapshot.empty) {
      const cloudEntries: JournalEntry[] = [];
      snapshot.forEach(d => {
        cloudEntries.push(d.data() as JournalEntry);
      });
      if (cloudEntries.length > 0) {
        const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
        const localAll: JournalEntry[] = raw ? JSON.parse(raw) : [];
        const otherUsersEntries = localAll.filter(e => e.userId !== uid);
        const merged = [...otherUsersEntries, ...cloudEntries];
        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(merged));
        return cloudEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
  } catch (err) {
    console.log('Firestore sync note:', err);
  }
  return getUserEntries(uid);
}

export function saveUserEntry(entry: JournalEntry): JournalEntry {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
  const all: JournalEntry[] = raw ? JSON.parse(raw) : [];
  
  const existingIndex = all.findIndex(e => e.id === entry.id && e.userId === entry.userId);
  if (existingIndex >= 0) {
    all[existingIndex] = entry;
  } else {
    all.unshift(entry);
  }
  
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(all));

  // Background sync to Firestore
  try {
    const entryDoc = doc(db, 'users', entry.userId, 'entries', entry.id);
    setDoc(entryDoc, entry).catch(e => console.log('Firestore write notice:', e));
  } catch (e) {
    console.log('Firestore write notice:', e);
  }

  return entry;
}

export function deleteUserEntry(uid: string, entryId: string): boolean {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
  if (!raw) return false;
  const all: JournalEntry[] = JSON.parse(raw);
  const filtered = all.filter(e => !(e.id === entryId && e.userId === uid));
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(filtered));

  try {
    const entryDoc = doc(db, 'users', uid, 'entries', entryId);
    deleteDoc(entryDoc).catch(e => console.log('Firestore delete notice:', e));
  } catch (e) {
    console.log('Firestore delete notice:', e);
  }

  return true;
}

// Strictly owner-isolated decisions
export function getUserDecisions(uid: string): DecisionItem[] {
  if (typeof window === 'undefined') return INITIAL_DECISIONS.filter(d => d.userId === uid);
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEY_DECISIONS);
  if (!raw) return [];
  try {
    const all: DecisionItem[] = JSON.parse(raw);
    return all.filter(d => d.userId === uid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function saveUserDecision(decision: DecisionItem): DecisionItem {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEY_DECISIONS);
  const all: DecisionItem[] = raw ? JSON.parse(raw) : [];
  
  const existingIndex = all.findIndex(d => d.id === decision.id && d.userId === decision.userId);
  if (existingIndex >= 0) {
    all[existingIndex] = decision;
  } else {
    all.unshift(decision);
  }
  
  localStorage.setItem(STORAGE_KEY_DECISIONS, JSON.stringify(all));

  // Background sync to Firestore
  try {
    const decisionDoc = doc(db, 'users', decision.userId, 'decisions', decision.id);
    setDoc(decisionDoc, decision).catch(e => console.log('Firestore decision notice:', e));
  } catch (e) {
    console.log('Firestore decision notice:', e);
  }

  return decision;
}

// Strictly owner-isolated rewinds
export function getUserRewinds(uid: string): LifeRewindReport[] {
  if (typeof window === 'undefined') return [];
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEY_REWINDS);
  if (!raw) return [];
  try {
    const all: LifeRewindReport[] = JSON.parse(raw);
    return all.filter(r => r.userId === uid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function saveUserRewind(rewind: LifeRewindReport): LifeRewindReport {
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEY_REWINDS);
  const all: LifeRewindReport[] = raw ? JSON.parse(raw) : [];
  all.unshift(rewind);
  localStorage.setItem(STORAGE_KEY_REWINDS, JSON.stringify(all));
  return rewind;
}

// Reset data to seed demo
export function resetDemoData() {
  if (typeof window === 'undefined') return;
  const combined = [...INITIAL_ENTRIES, ...INITIAL_USER_B_ENTRIES];
  localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(combined));
  localStorage.setItem(STORAGE_KEY_DECISIONS, JSON.stringify(INITIAL_DECISIONS));
  localStorage.setItem(STORAGE_KEY_REWINDS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEFAULT_USER));
}
