// src/pages/product/featureContent.js
// Single source of truth for all feature page content.
// Visuals are imported from mockups — no duplication with ProductPage.

import AINoteMockup from '../../components/public/mockups/AINoteMockup';
import AnimatedNotesMockup from '../../components/public/mockups/AnimatedNotesMockup';
import AIPipelineDiagram from '../../components/public/mockups/AIPipelineDiagram';
import DailyBriefMockup from '../../components/public/mockups/DailyBriefMockup';
import AnimatedDailyBriefMockup from '../../components/public/mockups/AnimatedDailyBriefMockup';
import ClientProfileMockup from '../../components/public/mockups/ClientProfileMockup';
import PipelineDiagram from '../../components/public/mockups/PipelineDiagram';
import AnimatedPipelineMockup from '../../components/public/mockups/AnimatedPipelineMockup';
import ComplianceDiagram from '../../components/public/mockups/ComplianceDiagram';
import SearchMockup from '../../components/public/mockups/SearchMockup';
import AnimatedSearchMockup from '../../components/public/mockups/AnimatedSearchMockup';
import TeamDiagram from '../../components/public/mockups/TeamDiagram';

// Navigation order for prev/next links
export const FEATURE_ORDER = [
  'notes',
  'daily-brief',
  'clients',
  'crm',
  'compliance',
  'search',
  'team',
];

export const FEATURES = {
  'notes': {
    slug:    'notes',
    name:    'AI Note-taker',
    tagline: 'Be fully present. Allez captures the rest.',
    why: {
      heading: 'Why This Matters',
      body: 'The best advisors are fully present in client meetings. But capturing everything that was said and turning it into action is a constant tradeoff. Allez removes it, so you can focus on what only you can do.',
    },
    how: {
      heading: 'How It Works',
      body: 'Record the meeting directly in Allez. When it ends, a structured note is waiting: summary, decisions made, action items, and a draft follow-up email, all extracted automatically. The compliance layer runs quietly in the background.',
    },
    bullets: [
      'Record meetings directly in Allez — no third-party tools required',
      'Structured output: summary, decisions made, action items, and follow-up topics',
      'Draft follow-up email generated from the actual conversation',
      'Works with existing transcripts and recordings too',
      'Compliance flagging built in',
    ],
    visual: <AnimatedNotesMockup />,
    secondaryVisual: <AIPipelineDiagram />,
    secondaryLabel: 'How the AI pipeline works',
    metaDescription: 'Allez AI Note-taker lets advisors record client meetings and receive structured notes automatically — summary, action items, and compliance flags — so you can stay fully present.',
  },
  'daily-brief': {
    slug:    'daily-brief',
    name:    'Daily Brief',
    tagline: 'Start every morning already prepared.',
    why: {
      heading: 'Why This Matters',
      body: "Most practice management tools don't talk to each other. Notes live in one place, tasks in another, client history somewhere else. This means advisors need to spend time assembling the puzzle every morning before the real work begins. The Daily Brief pulls it all together, so advisors start the day organized and ready.",
    },
    how: {
      heading: 'How It Works',
      body: 'Log in and everything is already waiting. Today\'s meetings, tasks to complete, and clients due for a touchpoint, all surfaced in one place and informed by the notes and history already in the platform. No assembly required.',
    },
    bullets: [
      "Today's schedule with relevant client context at a glance",
      'Tasks to complete, organized by urgency across your entire book',
      'Clients approaching their next review date',
      'Quick-add task flow without leaving the page',
    ],
    visual: <AnimatedDailyBriefMockup />,
    metaDescription: "Allez Daily Brief surfaces your meetings, tasks, and client touchpoints every morning in one view — informed by the notes and history already in the platform. No assembly required.",
  },
  'clients': {
    slug:    'clients',
    name:    'Client Profiles',
    tagline: 'Every detail about every client, always in reach.',
    why: {
      heading: 'Why This Matters',
      body: 'A client relationship is built over years of conversations, decisions, and details. When that history lives across emails, notes apps, and spreadsheets, it is effectively invisible when you need it most. A complete client profile means nothing slips and every interaction feels informed.',
    },
    how: {
      heading: 'How It Works',
      body: 'Every client has a single profile that holds the full picture: financial details, communication preferences, meeting history, open tasks, and every note ever taken. It updates as the relationship evolves. When you open a profile before a meeting, everything relevant is already there.',
    },
    bullets: [
      'Financial profile: AUM, fee rate, tax bracket, risk tolerance, investment objective',
      'Communication preferences and review cadence',
      'Full meeting and notes history linked to the profile',
      'Pipeline tracking for prospects moving toward onboarding',
    ],
    visual: <ClientProfileMockup />,
    metaDescription: 'Allez Client Profiles hold the full picture of every relationship — financial details, meeting history, open tasks, and notes — all in one place and always current.',
  },
  'crm': {
    slug:    'crm',
    name:    'CRM & Pipeline',
    tagline: 'See the full arc of every relationship.',
    why: {
      heading: 'Why This Matters',
      body: 'Growing a practice means managing relationships at two different stages at once: nurturing prospects toward becoming clients while keeping existing clients engaged. Without a structured view of where everyone stands, opportunities stall and relationships go cold without anyone noticing. Allez makes sure no one gets lost.',
    },
    how: {
      heading: 'How It Works',
      body: "Prospects move through a configurable pipeline from first contact to active client. Knowing exactly where a prospect stands lets an advisor prioritize the right conversations, time their follow-ups, and move deals forward with confidence. Once onboarded, clients shift into relationship management mode with cadence tracking that flags when a touchpoint is overdue. The platform is built toward a future where stage transitions happen automatically as key documents and milestones are completed.",
    },
    bullets: [
      'Pipeline stages from Lead through Onboarding to Active',
      'Cadence signals: approaching touchpoint and overdue alerts across your book',
      'Smart meeting scheduling pre-filled from last meeting date and frequency',
      'Client CSV import to migrate from any existing CRM',
    ],
    visual: <AnimatedPipelineMockup />,
    metaDescription: 'Allez CRM & Pipeline gives advisors a structured view of every prospect and client relationship — with cadence tracking, pipeline stages, and automated alerts so no one gets lost.',
  },
  'compliance': {
    slug:    'compliance',
    name:    'Compliance Layer',
    tagline: 'Documentation that protects you as you work.',
    why: {
      heading: 'Why This Matters',
      body: 'Compliance in most advisory practices is an afterthought, something that gets addressed after the fact when a regulator asks or an audit looms. The risk is real: conversations happen, promises get made, and without a complete record, advisors are exposed. Allez builds compliance into the workflow so it happens automatically, without requiring the advisor to think about it.',
    },
    how: {
      heading: 'How It Works',
      body: 'When a regulator asks for documentation, the answer should already exist. Allez helps keep you protected by maintaining a complete, timestamped record of every client interaction, every note taken, and every change made across the platform. Potential issues are flagged as they arise, not discovered during a review. By the time an audit comes, the work is already done.',
    },
    bullets: [
      'Automatic compliance scan on every AI note',
      'Severity levels with specific reasons per flag',
      'Dedicated flagged notes view for compliance review',
      'Full audit log with field-level change tracking across the organization',
      'Compliance role with full read access across the firm',
    ],
    visual: <ComplianceDiagram />,
    metaDescription: 'Allez Compliance Layer automatically scans every AI note, maintains a full audit log, and surfaces potential issues as they arise — so advisors are protected before a review begins.',
  },
  'search': {
    slug:    'search',
    name:    'Global Search',
    tagline: 'Find anything, instantly.',
    why: {
      heading: 'Why This Matters',
      body: 'Client information is only useful if you can get to it quickly. When a client calls unexpectedly or a name comes up mid-meeting, the last thing an advisor needs is to dig through records to find what they are looking for. Everything in Allez is instantly searchable from anywhere in the platform.',
    },
    how: {
      heading: 'How It Works',
      body: "Cmd+K from any page opens a unified search across clients, notes, and tasks simultaneously. Results are grouped by type and navigable by keyboard. Because search is role-scoped, advisors only see their own book — nothing outside their assigned clients surfaces.",
    },
    bullets: [
      'Cmd+K shortcut available from any page in the platform',
      'Searches clients, notes, and tasks in a single query',
      'Results grouped by type with direct navigation',
      'Role-scoped — advisors only see their assigned book',
    ],
    visual: <AnimatedSearchMockup />,
    metaDescription: 'Allez Global Search lets advisors find any client, note, or task instantly with a single Cmd+K shortcut — role-scoped so everyone sees only what they should.',
  },
  'team': {
    slug:    'team',
    name:    'Team & Access Control',
    tagline: 'The right people see the right things.',
    why: {
      heading: 'Why This Matters',
      body: 'As an advisory practice grows, so does the complexity of managing who can see what. Associates should not have access to clients they do not work with. Compliance needs visibility across the firm without the ability to make changes. Admins need to manage the team without disrupting day-to-day operations. Getting this wrong creates both operational and regulatory risk.',
    },
    how: {
      heading: 'How It Works',
      body: 'Allez gives firm owners and admins precise control over who sees what. Each team member gets the access their role requires, nothing more, nothing less. That boundary is enforced at the database level, not just the interface, so it holds regardless of how someone navigates the platform. When someone joins the team or changes roles, access updates immediately.',
    },
    bullets: [
      'Five-role hierarchy: Admin, Manager, Advisor, Associate, Compliance',
      'Role-based access enforced at the database level',
      'Advisor assignment per client',
      'Invite flow with role assignment built in',
      'Resend invite for pending members',
    ],
    visual: <TeamDiagram />,
    metaDescription: 'Allez Team & Access Control gives firm owners precise control over who sees what — with a five-role hierarchy enforced at the database level, not just the interface.',
  },
};