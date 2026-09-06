import { JournalEntry, DecisionItem, LifeRewindReport } from '../types';

export const INITIAL_USER_ID = 'usr_ashfaque_2026';
export const USER_A_ID = 'usr_ashfaque_2026';
export const USER_B_ID = 'usr_priya_5501';

export const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-01T18:30:00Z',
    title: 'Sprint Planning Overwhelm',
    messages: [
      { id: 'm1', role: 'user', content: 'Sprint planning was chaotic today. Took on 3 major epics alone.', timestamp: '2026-09-01T18:30:00Z' },
      { id: 'm2', role: 'model', content: 'Taking on three epics by yourself is a massive load. What was driving that need to say yes to all of them?', timestamp: '2026-09-01T18:31:00Z' },
      { id: 'm3', role: 'user', content: 'Nobody else was volunteering and I felt like if I didn’t step up, leadership would think I’m disengaged.', timestamp: '2026-09-01T18:32:00Z' }
    ],
    summary: 'Took on three epics out of fear of being perceived as disengaged by team leadership.',
    mood: 'Overwhelmed',
    moodScore: 4,
    themes: ['Work', 'Expectations'],
    people: ['Team', 'Leadership'],
    events: ['Sprint Planning'],
    location: 'Office',
    goals: ['Learn to decline unassigned tasks without guilt'],
  },
  {
    id: 'entry-2',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-04T09:15:00Z',
    title: 'First Day at Bangalore Workspace',
    messages: [
      { id: 'm4', role: 'user', content: 'First day at the new workspace in Bangalore! The energy here is electrifying. Sunlight streaming in, great coffee.', timestamp: '2026-09-04T09:15:00Z' },
      { id: 'm5', role: 'model', content: 'That sounds invigorating! How does this new environment shift the way you want to work today?', timestamp: '2026-09-04T09:16:00Z' },
      { id: 'm6', role: 'user', content: 'I feel optimistic for the first time this month. Ready to build something that actually matters.', timestamp: '2026-09-04T09:17:00Z' }
    ],
    summary: 'Started working from Bangalore workspace. Felt energized, grounded, and genuinely optimistic.',
    mood: 'Excited',
    moodScore: 8,
    themes: ['Environment', 'Creativity'],
    people: [],
    events: ['Workspace Onboarding'],
    location: 'Bangalore',
    goals: ['Anchor into the fresh space and start drafting the redesign proposal'],
  },
  {
    id: 'entry-3',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-06T17:45:00Z',
    title: 'Horrible Project Review & Contemplating Exit',
    messages: [
      { id: 'm7', role: 'user', content: 'I had a horrible meeting today. I feel like I am doing a lot but nobody notices. My manager spent the entire demo critiquing minor button margins and completely skipped the core architecture I spent 3 weeks on.', timestamp: '2026-09-06T17:45:00Z' },
      { id: 'm8', role: 'model', content: 'Pouring three weeks of deep craft into architecture only to have the conversation derailed by cosmetic margins is deeply invalidating. What did you feel in your body while that was happening?', timestamp: '2026-09-06T17:46:00Z' },
      { id: 'm9', role: 'user', content: 'I think I am going to leave Project X. I feel stalled and undervalued here. If I leave, I could find a team that actually values technical rigor.', timestamp: '2026-09-06T17:47:00Z' }
    ],
    summary: 'Felt deeply invisible after manager critiqued minor UI margins while ignoring 3 weeks of architecture. Seriously contemplating leaving Project X.',
    mood: 'Frustrated',
    moodScore: 2,
    themes: ['Work', 'Recognition', 'Career'],
    people: ['Manager'],
    events: ['Project Review'],
    location: 'Bangalore',
    goals: ['Evaluate whether to transition out of Project X'],
    decisionId: 'dec-1',
  },
  {
    id: 'entry-4',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-08T19:20:00Z',
    title: 'Changing Teams Thoughts',
    messages: [
      { id: 'm10', role: 'user', content: 'Spoke with David from Platform Infrastructure. Changing teams feels more and more tempting. Why stay where the ceiling feels so low?', timestamp: '2026-09-08T19:20:00Z' },
      { id: 'm11', role: 'model', content: 'Exploring options gives you back agency. What would the Platform team give you that Project X currently denies you?', timestamp: '2026-09-08T19:21:00Z' }
    ],
    summary: 'Discussed an internal transition with Platform team lead. Looking for clarity and recognition.',
    mood: 'Restless',
    moodScore: 4,
    themes: ['Work', 'Career', 'Transitions'],
    people: ['David', 'Manager'],
    events: ['Informal Coffee Chat'],
    location: 'Bangalore',
    goals: ['Review internal mobility guidelines'],
  },
  {
    id: 'entry-5',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-11T21:10:00Z',
    title: 'Late Night Debugging & Sleep Deficit',
    messages: [
      { id: 'm12', role: 'user', content: 'Past midnight again fixing deployment syncs. Feeling completely drained.', timestamp: '2026-09-11T21:10:00Z' },
      { id: 'm13', role: 'model', content: 'Burnout creeps in quietly through late-night shifts. Can the sync wait until 9 AM tomorrow?', timestamp: '2026-09-11T21:11:00Z' }
    ],
    summary: 'Working past midnight caused exhaustion. Noticed correlation between late hours and negative mood the next morning.',
    mood: 'Exhausted',
    moodScore: 3,
    themes: ['Health', 'Workload'],
    people: [],
    events: ['Deployment Fix'],
    location: 'Bangalore',
    goals: ['Enforce 11 PM laptop shutdown'],
  },
  {
    id: 'entry-6',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-14T14:30:00Z',
    title: 'Another Team Transition Consideration',
    messages: [
      { id: 'm14', role: 'user', content: 'Manager cancelled our 1:1 again with 5 minutes notice. Third time this quarter. Considering changing teams again.', timestamp: '2026-09-14T14:30:00Z' },
      { id: 'm15', role: 'model', content: 'When 1:1s get cancelled repeatedly, it sends a loud signal about priorities. How does this connect to your need for recognition?', timestamp: '2026-09-14T14:31:00Z' }
    ],
    summary: 'Repeated 1:1 cancellations heightened feelings of neglect and triggered another thought of changing teams.',
    mood: 'Frustrated',
    moodScore: 3,
    themes: ['Work', 'Recognition', 'Relationships'],
    people: ['Manager'],
    events: ['Cancelled 1:1'],
    location: 'Office',
    goals: ['Request a rescheduled 1:1 that cannot be moved'],
  },
  {
    id: 'entry-7',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-18T16:00:00Z',
    title: 'The Turning Point: Speaking Up',
    messages: [
      { id: 'm16', role: 'user', content: 'Today I decided not to swallow my frustration. When my manager asked how the deployment went, I didn’t just say "fine". I laid out the exact architectural risks we prevented and requested 15 minutes to review next quarter ownership.', timestamp: '2026-09-18T16:00:00Z' },
      { id: 'm17', role: 'model', content: 'That was a brave shift from quiet withdrawal to active advocacy. How did your manager react?', timestamp: '2026-09-18T16:01:00Z' },
      { id: 'm18', role: 'user', content: 'He was surprised, but he actually listened! He said he had no idea I was feeling sidelined and agreed to set aside dedicated time on Monday.', timestamp: '2026-09-18T16:02:00Z' }
    ],
    summary: 'Directly advocated for visibility and ownership. Manager responded receptively, marking an emotional turning point.',
    mood: 'Empowered',
    moodScore: 7,
    themes: ['Work', 'Communication', 'Recognition'],
    people: ['Manager'],
    events: ['Spontaneous Standup Debrief'],
    location: 'Bangalore',
    goals: ['Prepare concrete project proposal for Monday'],
  },
  {
    id: 'entry-8',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-21T11:45:00Z',
    title: 'Clarity in the 1:1',
    messages: [
      { id: 'm19', role: 'user', content: 'I think I finally understand what I need from my manager. It isn’t constant praise. It’s strategic context and trust to own the roadmap.', timestamp: '2026-09-21T11:45:00Z' },
      { id: 'm20', role: 'model', content: 'That is profound clarity. When you define acknowledgment as strategic ownership rather than superficial praise, it gives you both a roadmap.', timestamp: '2026-09-21T11:46:00Z' }
    ],
    summary: 'Had a breakthrough realization: the root desire is strategic autonomy and trust, rather than casual compliments.',
    mood: 'Insightful',
    moodScore: 8,
    themes: ['Work', 'Personal Growth', 'Recognition'],
    people: ['Manager'],
    events: ['Rescheduled 1:1'],
    location: 'Bangalore',
    goals: ['Draft the quarterly charter for the new data pipeline module'],
  },
  {
    id: 'entry-9',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-24T18:00:00Z',
    title: 'Chennai Weekend & Reset',
    messages: [
      { id: 'm21', role: 'user', content: 'Visited family in Chennai over the weekend. Walked by Marina beach in the breeze. Feeling peaceful and recalibrated.', timestamp: '2026-09-24T18:00:00Z' },
      { id: 'm22', role: 'model', content: 'Stepping outside the daily grind offers rare perspective. What feels different returning to Bangalore now?', timestamp: '2026-09-24T18:01:00Z' }
    ],
    summary: 'Weekend trip to Chennai provided emotional grounding and mental space away from work pressure.',
    mood: 'Peaceful',
    moodScore: 9,
    themes: ['Family', 'Health', 'Travel'],
    people: ['Family'],
    events: ['Weekend Visit'],
    location: 'Chennai',
    goals: ['Protect weekend boundaries moving forward'],
  },
  {
    id: 'entry-10',
    userId: INITIAL_USER_ID,
    createdAt: '2026-09-28T17:15:00Z',
    title: 'New Project Ownership Confirmed',
    messages: [
      { id: 'm23', role: 'user', content: 'Officially handed tech lead ownership of the NextGen pipeline project today! I am so glad I had that honest conversation instead of silently quitting.', timestamp: '2026-09-28T17:15:00Z' },
      { id: 'm24', role: 'model', content: 'What a transformative trajectory from September 6 to today. You turned frustration into dialogue, and dialogue into leadership.', timestamp: '2026-09-28T17:16:00Z' }
    ],
    summary: 'Received official leadership of NextGen pipeline. Gratitude for having spoken up instead of leaving prematurely.',
    mood: 'Accomplished',
    moodScore: 9,
    themes: ['Career', 'Recognition', 'Leadership'],
    people: ['Manager', 'Leadership'],
    events: ['Quarterly All-Hands Announcement'],
    location: 'Bangalore',
    goals: ['Onboard two junior engineers to the pipeline module'],
  },
];

export const INITIAL_DECISIONS: DecisionItem[] = [
  {
    id: 'dec-1',
    userId: INITIAL_USER_ID,
    decision: 'Leave Project X',
    reasoning: 'Feeling stalled, exhausted, and undervalued. Lack of managerial recognition for technical architecture work.',
    confidence: 72,
    expectedOutcome: 'More growth, higher autonomy, and better recognition on a different engineering team.',
    createdAt: '2026-09-06T17:47:00Z',
    reviewDate: '2026-10-06T00:00:00Z',
    status: 'reviewed',
    sourceEntryId: 'entry-3',
    followUp: {
      reviewedAt: '2026-10-06T10:00:00Z',
      updatedConfidence: 41,
      outcome: 'Stayed with Project X.',
      whatChanged: 'Had an honest 1:1 with manager, expressed the need for strategic autonomy, and received lead ownership of the NextGen pipeline.',
      retrospective: 'Frustration was masking a need for recognition and agency. Speaking up directly resolved the root cause without having to abandon the project investment.',
      statusChanged: 'stayed',
    },
  },
  {
    id: 'dec-2',
    userId: INITIAL_USER_ID,
    decision: 'Establish Strict 11 PM Screen Shutdown',
    reasoning: 'Late night debugging was causing severe sleep deficits and amplifying emotional vulnerability during meetings.',
    confidence: 85,
    expectedOutcome: 'Higher energy, sharper morning focus, and better emotional regulation.',
    createdAt: '2026-09-12T08:00:00Z',
    reviewDate: '2026-10-12T00:00:00Z',
    status: 'active',
  },
];

export const INITIAL_USER_B_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-b-1',
    userId: USER_B_ID,
    createdAt: '2026-09-02T10:00:00Z',
    title: 'Priya’s Design Systems Sprint',
    messages: [
      { id: 'mb1', role: 'user', content: 'Launched the color palette redesign for our design tokens today.', timestamp: '2026-09-02T10:00:00Z' },
    ],
    summary: 'Completed color token updates for UI design system.',
    mood: 'Content',
    moodScore: 8,
    themes: ['Design', 'Work'],
    people: ['Design Team'],
    events: ['Token Launch'],
    location: 'Mumbai',
    goals: ['Audit accessibility contrast'],
  }
];
