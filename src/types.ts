export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface StructuredMemory {
  summary: string;
  mood: string;
  moodScore: number; // 1 - 10
  themes: string[];
  people: string[];
  events: string[];
  location: string | null;
  goals: string[];
  potentialDecisions: {
    decision: string;
    reasoning: string;
    confidence: number;
    expectedOutcome: string;
  }[];
}

export interface JournalEntry {
  id: string;
  userId: string;
  createdAt: string;
  title: string;
  messages: JournalMessage[];
  summary: string;
  mood: string;
  moodScore: number;
  themes: string[];
  people: string[];
  events: string[];
  location: string | null;
  goals: string[];
  decisionId?: string | null;
}

export interface DecisionItem {
  id: string;
  userId: string;
  decision: string;
  reasoning: string;
  confidence: number; // 0 - 100
  expectedOutcome: string;
  createdAt: string;
  reviewDate: string;
  status: 'active' | 'reviewed' | 'resolved';
  sourceEntryId?: string;
  followUp?: {
    reviewedAt: string;
    updatedConfidence: number;
    outcome: string;
    whatChanged: string;
    retrospective: string;
    statusChanged: 'stayed' | 'changed' | 'progressing' | 'abandoned';
  };
}

export interface PatternInsight {
  title: string;
  observation: string;
  rootCause: string;
  actionableInquiry: string;
}

export interface LifeRewindReport {
  id: string;
  userId: string;
  period: string;
  filterTheme?: string;
  createdAt: string;
  totalReflections: number;
  dominantMood: string;
  averageMoodScore: number;
  moodImprovementMilestone?: string;
  timelineHighlights: {
    date: string;
    mood: string;
    moodScore: number;
    highlight: string;
  }[];
  recurringThemes: {
    name: string;
    count: number;
    insight: string;
  }[];
  keyQuotes: {
    quote: string;
    date: string;
    context: string;
  }[];
  patternDetected: PatternInsight;
  narrativeSummary: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isSimulated?: boolean;
}

export interface ThreatModelSection {
  threat: string;
  mitigation: string;
  status: 'enforced' | 'verified';
}
