// src/pages/ProductPage.js
// Public-facing product page at /product.
// Visualizations are CSS/SVG mockups — no image dependencies.

import { Link } from 'react-router-dom';
import {
  PUB_APP_ACCENT        as ACCENT,
  PUB_ACCENT            as SITE_ACCENT,
  PUB_BG                as L_BG,
  PUB_TEXT              as L_TEXT,
  PUB_TEXT_SUBTLE       as L_TEXT_SUBTLE,
  PUB_MESH_INDIGO, PUB_MESH_TEAL, PUB_FONTS_AND_KEYFRAMES,
  FONT_DISPLAY, FONT_BODY,
FW_LIGHT, FW_REGULAR, FW_MEDIUM,
  MOBILE_BREAKPOINT,
} from '../utils/publicConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import PublicHelmet from '../components/public/PublicHelmet';
import AINoteMockup from '../components/public/mockups/AINoteMockup';
import DailyBriefMockup from '../components/public/mockups/DailyBriefMockup';
import ClientProfileMockup from '../components/public/mockups/ClientProfileMockup';
import SearchMockup from '../components/public/mockups/SearchMockup';
import AIPipelineDiagram from '../components/public/mockups/AIPipelineDiagram';
import ComplianceDiagram from '../components/public/mockups/ComplianceDiagram';
import CRMClientsMockup from '../components/public/mockups/CRMClientsMockup';
import TeamDiagram from '../components/public/mockups/TeamDiagram';

// ── Feature sections ─────────────────────────────────────────────────────────

// Note: all mockup components imported from src/components/public/mockups/

const FEATURES = [
  {
    slug: 'notes',
    name: 'AI Note-taker',
    tagline: 'Be fully present. Allez captures the rest.',
    description: 'Open Allez before the meeting, hit record, and have the conversation. When it ends, a structured note is waiting — summary, decisions made, action items, and compliance signals, all extracted automatically.',
    details: [
      'Record live from any meeting — transcribed and structured in real time',
      'Structured output: summary, decisions, action items, and follow-up topics',
      'Auto-generated tasks linked to the client record',
      'Compliance scan with severity levels and specific reasons per flag',
      'Draft follow-up email generated and ready to send',
      'Works with existing transcripts and recordings too',
    ],
    visual: <AINoteMockup />,
    visualType: 'mockup',
    diagram: <AIPipelineDiagram />,
    diagramLabel: 'How the AI pipeline works',
  },
  {
    slug: 'daily-brief',
    name: 'Daily Brief',
    tagline: 'Start every morning already prepared.',
    description: 'Most advisors begin their day piecing together what\'s happening across their book. The Daily Brief eliminates that — surfacing today\'s meetings, overdue tasks, and clients due for a touchpoint the moment you log in.',
    details: [
      'Today\'s schedule with client context at a glance',
      'Overdue and due-today tasks across your entire book',
      'Clients approaching their next review date',
      'Quick-add task flow without leaving the page',
    ],
    visual: <DailyBriefMockup />,
    visualType: 'mockup',
  },
  {
    slug: 'clients',
    name: 'Client Profiles',
    tagline: 'Every detail about every client, always in reach.',
    description: 'A client profile in Allez HQ holds the full picture of the relationship — financial profile, risk tolerance, communication preferences, notes history, tasks, and meetings — all in one place.',
    details: [
      'AUM, fee rate, custodian, tax bracket, investment objective',
      'Communication preferences and cadence settings',
      'Full notes and meeting history linked to the profile',
      'Pipeline tracking for prospects moving toward onboarding',
    ],
    visual: <ClientProfileMockup />,
    visualType: 'mockup',
  },
  {
    slug: 'crm',
    name: 'CRM & Pipeline',
    tagline: 'See the full arc of every relationship.',
    description: 'Prospects move through a configurable pipeline. Active clients have communication cadence tracking. Every interaction is logged. Nothing falls through the cracks because the system is always watching the relationship health you might miss.',
    details: [
      'Pipeline stages from Lead through Onboarding to Active',
      'Cadence signals: amber when approaching touchpoint, red when overdue',
      'Smart meeting scheduling pre-filled from last meeting + frequency',
      'Client CSV import — migrate from any CRM in minutes',
    ],
    visual: <CRMClientsMockup />,
    visualType: 'mockup',
  },
  {
    slug: 'compliance',
    name: 'Compliance Layer',
    tagline: 'Documentation that protects you as you work.',
    description: 'Compliance in most practices is retroactive. Allez HQ builds it into the workflow — every AI note scanned automatically, flags surfaced in a dedicated compliance view, and a full audit log recording every write across your organization.',
    details: [
      'Automatic compliance scan on every AI note',
      'Severity levels: low, medium, high — with specific reasons per flag',
      'Dedicated Flagged Notes view for compliance review',
      'Full audit log with field-level change tracking',
      'Compliance role: full read access across the org',
    ],
    visual: <ComplianceDiagram />,
    visualType: 'diagram',
  },
  {
    slug: 'search',
    name: 'Global Search',
    tagline: 'Find anything, instantly.',
    description: 'Cmd+K from anywhere searches clients by name, notes by content, and tasks by title simultaneously. Results grouped and navigable. Role-scoped so advisors only see their assigned clients and records.',
    details: [
      'Cmd+K shortcut available from any page in the app',
      'Searches clients, notes, and tasks in a single query',
      'Results grouped by type with direct navigation links',
      'Role-scoped — advisors see only their book',
    ],
    visual: <SearchMockup />,
    visualType: 'mockup',
  },
  {
    slug: 'team',
    name: 'Team & Access Control',
    tagline: 'The right people see the right things.',
    description: 'Supports the full range of roles in a real advisory practice — Admin, Manager, Advisor, Associate, Compliance. Role-based access enforced at the database level. Advisors see their clients. Compliance has full read access. Admins manage the team.',
    details: [
      'Five-role hierarchy enforced at the database level',
      'Invite flow with role assignment and name pre-population',
      'Resend invite for pending members',
      'Advisor assignment per client — primary and secondary',
    ],
    visual: <TeamDiagram />,
    visualType: 'diagram',
  },
];

const WHY = [
  { point: 'Natively unified.', detail: 'CRM, AI notes, task management, and compliance in one place — not tools you\'re trying to keep in sync.' },
  { point: 'Compliance-aware from day one.', detail: 'Every note scanned. Every change logged. Built for the regulatory reality advisors actually live in.' },
  { point: 'Built for the relationship, not the sale.', detail: 'Most CRMs are adapted from sales tools. Allez HQ was designed from scratch around the wealth management relationship.' },
  { point: 'Built in partnership with working advisors.', detail: 'Every feature was developed alongside advisors who use it. No assumptions. No enterprise-first tradeoffs.' },
];

// ── Page component ───────────────────────────────────────────────────────────

export default function ProductPage() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  return (
    <div style={s.root}>
      <style>{`
        ${PUB_FONTS_AND_KEYFRAMES}
        .feature-row:not(:last-child) { border-bottom:1px solid rgba(0,0,0,0.07); }
        .feature-name-link:hover { opacity: 0.7; }
      `}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHelmet
        title="The Platform — Allez HQ"
        description="AI note-taking, CRM, pipeline management, compliance, and daily briefings — unified in one platform purpose-built for wealth advisors."
        path="/product"
      />
      <PublicHeader />

      {/* Hero */}
      <div style={{ ...s.hero, padding: isMobile ? '48px 24px 64px' : '80px 40px 100px' }}>
        <p style={s.heroEyebrow}>The platform</p>
        <h1 style={s.heroTitle}>Practice management for advisors<br />who set the standard.</h1>
        <p style={s.heroSub}>
          Every meeting, every milestone, every relationship — Allez captures the details
          that matter across the full client journey. From meeting notes to client records,
          pipeline tracking to team alignment, everything your practice needs lives in one place.
        </p>
      </div>

      <div style={s.scrollSection}>

        {/* Features */}
        <div style={{ ...s.featuresBlock, padding: isMobile ? '48px 24px' : '80px 40px' }}>
          <p style={s.eyebrow}>Features</p>
          <h2 style={s.sectionTitle}>What's inside.</h2>

          {FEATURES.map(f => (
            <div key={f.name} className="feature-row" style={{
              ...s.featureRow,
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '32px' : '56px',
              padding: isMobile ? '40px 0' : '56px 0',
            }}>
              {/* Left: text */}
              <div style={s.featureLeft}>
                <Link
                  to={`/product/${f.slug}`}
                  className="feature-name-link"
                  style={s.featureNameLink}
                >
                  {f.name}
                </Link>
                <p style={s.featureTagline}>{f.tagline}</p>
                <p style={s.featureDesc}>{f.description}</p>
                <ul style={s.featureList}>
                  {f.details.map(d => (
                    <li key={d} style={s.featureListItem}>
                      <span style={s.bullet} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: visual */}
              <div style={s.featureRight}>
                {f.visual}
                {f.diagram && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '10px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_SUBTLE, margin: '0 0 10px', fontFamily: FONT_BODY }}>{f.diagramLabel}</p>
                    {f.diagram}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Why */}
        <div style={{ ...s.whyBlock, padding: isMobile ? '48px 24px 64px' : '80px 40px 100px' }}>
          <p style={s.eyebrow}>Why Allez HQ</p>
          <h2 style={s.sectionTitle}>The thinking behind it.</h2>
          <div style={s.whyGrid}>
            {WHY.map(item => (
              <div key={item.point} style={s.whyItem}>
                <p style={s.whyPoint}>{item.point}</p>
                <p style={s.whyDetail}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}

const s = {
  root: { fontFamily: FONT_BODY, position: 'relative', background: L_BG, overflowX: 'hidden' },

  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: PUB_MESH_INDIGO,
    top: '-200px', left: '-200px', filter: 'blur(50px)', animation: 'mesh1 24s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: PUB_MESH_TEAL,
    top: '200px', right: '-150px', filter: 'blur(50px)', animation: 'mesh2 28s ease-in-out infinite',
  },

  hero: { maxWidth: '1100px', margin: '0 auto', padding: '80px 40px 100px', position: 'relative', zIndex: 1 },
  heroEyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 20px' },
  heroTitle: { fontFamily: FONT_DISPLAY, fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 28px', lineHeight: 1.1, letterSpacing: '0.01em' },
  heroSub: { fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.8, color: 'rgba(26,26,26,0.55)', maxWidth: '640px', margin: 0 },

  scrollSection: {
    position: 'relative', zIndex: 1,
    background: 'rgba(248,248,245,0.35)', backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.04)',
  },

  eyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 16px' },
  sectionTitle: { fontFamily: FONT_DISPLAY, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 28px', lineHeight: 1.2, letterSpacing: '0.01em' },

  divider: { height: '1px', background: 'rgba(0,0,0,0.07)', margin: '0 40px' },

  featuresBlock: { maxWidth: '1100px', margin: '0 auto', padding: '80px 40px' },
  featureRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', padding: '56px 0', alignItems: 'start' },
  featureLeft: {},
  featureNameLink: {
    fontFamily: FONT_DISPLAY, fontSize: '30px', fontWeight: FW_REGULAR, color: L_TEXT,
    margin: '0 0 6px', letterSpacing: '0.01em', textDecoration: 'none', display: 'block',
    transition: 'opacity 0.15s ease',
  },
  featureTagline: { fontSize: '13px', fontWeight: FW_LIGHT, color: SITE_ACCENT, margin: '0 0 16px' },
  featureDesc: { fontSize: '14px', fontWeight: FW_LIGHT, lineHeight: 1.85, color: 'rgba(26,26,26,0.6)', margin: '0 0 20px' },
  featureList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  featureListItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.65, color: 'rgba(26,26,26,0.65)' },
  bullet: { display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: ACCENT, flexShrink: 0, marginTop: '7px' },
  featureRight: {},

  whyBlock: { maxWidth: '1100px', margin: '0 auto', padding: '80px 40px 100px' },
  whyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '40px 48px', marginTop: '8px' },
  whyItem: { display: 'flex', flexDirection: 'column', gap: '8px' },
  whyPoint: { fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: FW_REGULAR, color: L_TEXT, margin: 0, letterSpacing: '0.01em' },
  whyDetail: { fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.7, color: 'rgba(26,26,26,0.55)', margin: 0 },
};