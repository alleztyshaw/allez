// src/pages/GetStarted.js
// Public-facing get started page at /get-started.
// Includes tier comparison table and demo CTA.

import { Link } from 'react-router-dom';
import {
  PUB_BG, PUB_TEXT, PUB_TEXT_MUTED, PUB_TEXT_SUBTLE, PUB_ACCENT,
  PUB_BODY_MUTED, PUB_GRADIENT, PUB_DIVIDER,
  PUB_MESH_INDIGO, PUB_MESH_TEAL, PUB_FONTS_AND_KEYFRAMES,
  PUB_SECTION_ACCESS, PUB_SECTION_NOTES, PUB_SECTION_CRM, PUB_SECTION_PLATFORM,
  PUB_TIER_STARTER, PUB_TIER_PRO,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../utils/publicConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import PublicHelmet from '../components/public/PublicHelmet';

// ── Comparison table ─────────────────────────────────────────────────────────

const CHECK = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l3.5 3.5L13 4.5" stroke={PUB_TEXT} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DASH = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 8h8" stroke={PUB_TEXT_SUBTLE} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SECTIONS = [
  {
    label: 'Access',
    color: PUB_SECTION_ACCESS,
    rows: [
      { feature: 'Included seats',  starter: 'Up to 3',   pro: 'Up to 10' },
      { feature: 'Compliance role', starter: false,        pro: true },
      { feature: 'Audit log',       starter: false,        pro: true },
    ],
  },
  {
    label: 'AI Note-taker',
    color: PUB_SECTION_NOTES,
    rows: [
      { feature: 'Live meeting recording',    starter: true,       pro: true },
      { feature: 'AI summary + action items', starter: true,       pro: true },
      { feature: 'Monthly meeting cap',       starter: '15/month', pro: 'Unlimited' },
      { feature: 'Compliance scan',           starter: false,      pro: true },
      { feature: 'Follow-up email draft',     starter: false,      pro: true },
    ],
  },
  {
    label: 'CRM',
    color: PUB_SECTION_CRM,
    rows: [
      { feature: 'Client profiles',     starter: true,  pro: true },
      { feature: 'Pipeline management', starter: false, pro: true },
    ],
  },
  {
    label: 'Platform',
    color: PUB_SECTION_PLATFORM,
    rows: [
      { feature: 'Daily Brief',     starter: true, pro: true },
      { feature: 'Task management', starter: true, pro: true },
    ],
  },
];

function CellValue({ value }) {
  if (value === true)  return <CHECK />;
  if (value === false) return <DASH />;
  return <span style={{ fontSize: '13px', fontWeight: FW_MEDIUM, color: PUB_TEXT }}>{value}</span>;
}

function ComparisonTable({ isMobile }) {
  // On mobile: collapse category column, tighten tier columns to icon-only width
  return (
    <div style={{ width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {/* Category column header — hidden on mobile */}
            {!isMobile && <th style={t.thCategory} />}
            <th style={t.thFeature} />
            <th style={t.thTier}>
              <span style={{ ...t.tierLabel, color: PUB_TIER_STARTER }}>Starter</span>
            </th>
            <th style={t.thTier}>
              <span style={{ ...t.tierLabel, color: PUB_TIER_PRO }}>Pro</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map((section, si) => {
            const rows = [];

            // On mobile, insert a section label row above each group
            if (isMobile) {
              rows.push(
                <tr key={`${section.label}-header`}>
                  <td colSpan={3} style={{
                    ...t.mobileSectionLabel,
                    color: section.color,
                    borderLeft: `3px solid ${section.color}`,
                    paddingTop: '4px',
                  }}>
                    {section.label}
                  </td>
                </tr>
              );
            }

            section.rows.forEach((row, ri) => {
              rows.push(
                <tr key={`${section.label}-${ri}`} style={{ ...t.tr, ...(ri === 0 ? { borderTop: 'none' } : {}) }}>
                  {/* Desktop category cell — spans all rows in section */}
                  {!isMobile && ri === 0 && (
                    <td
                      rowSpan={section.rows.length}
                      style={{
                        ...t.tdCategory,
                        borderRight: `3px solid ${section.color}`,
                      }}
                    >
                      <span style={{ ...t.categoryLabel, color: section.color }}>
                        {section.label}
                      </span>
                    </td>
                  )}
                  <td style={isMobile ? t.tdFeatureMobile : t.tdFeature}>{row.feature}</td>
                  <td style={isMobile ? t.tdValueMobile : t.tdValue}>
                    <CellValue value={row.starter} />
                  </td>
                  <td style={isMobile ? t.tdValueMobile : t.tdValue}>
                    <CellValue value={row.pro} />
                  </td>
                </tr>
              );
            });

            // Section spacer row — transparent border creates visual gap
            if (si < SECTIONS.length - 1) {
              rows.push(
                <tr key={`${section.label}-spacer`}>
                  <td
                    colSpan={isMobile ? 3 : 4}
                    style={{ borderTop: '10px solid transparent', padding: 0 }}
                  />
                </tr>
              );
            }

            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Table styles ─────────────────────────────────────────────────────────────

const t = {
  thCategory: { width: '90px', padding: '0 16px 20px 0' },
  thFeature:  { textAlign: 'left', padding: '0 16px 20px' },
  thTier:     { width: '80px', textAlign: 'center', padding: '0 8px 20px' },
  tierLabel: {
    fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: FW_SEMIBOLD,
    letterSpacing: '0.02em',
  },
  tr: { borderTop: '1px solid rgba(0,0,0,0.05)' },
  tdCategory: {
    paddingRight: '16px', verticalAlign: 'top', paddingTop: '16px',
  },
  categoryLabel: {
    fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
    letterSpacing: '0.12em', display: 'block', whiteSpace: 'nowrap',
  },
  tdFeature: {
    fontSize: '14px', fontWeight: FW_LIGHT, color: PUB_TEXT,
    padding: '13px 16px', lineHeight: 1.4,
  },
  tdValue: {
    textAlign: 'center', padding: '13px 8px', verticalAlign: 'middle',
  },
  // Mobile variants
  mobileSectionLabel: {
    fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
    letterSpacing: '0.12em', paddingLeft: '10px', paddingBottom: '6px',
  },
  tdFeatureMobile: {
    fontSize: '13px', fontWeight: FW_LIGHT, color: PUB_TEXT,
    padding: '11px 8px 11px 0', lineHeight: 1.4,
  },
  tdValueMobile: {
    textAlign: 'center', padding: '11px 4px', verticalAlign: 'middle',
    width: '48px',
  },
};

// ── Page component ───────────────────────────────────────────────────────────

export default function GetStarted() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  return (
    <div style={s.root}>
      <style>{`
        ${PUB_FONTS_AND_KEYFRAMES}
        .demo-btn:hover  { filter: brightness(1.06); }
        .text-link:hover { opacity: 0.7; }
      `}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHelmet
        title="Get Started — Allez HQ"
        description="Explore Allez HQ pricing tiers and book a demo with our team. Currently in early access — we work directly with each new firm from day one."
        path="/get-started"
      />
      <PublicHeader />

      <div style={{ ...s.page, padding: isMobile ? '64px 24px 80px' : '100px 40px 120px' }}>

        {/* Hero */}
        <div style={s.heroBlock}>
          <p style={s.eyebrow}>Get Started</p>
          <h1 style={{ ...s.title, fontSize: isMobile ? '36px' : 'clamp(36px, 4vw, 56px)' }}>
            See Allez HQ in action.
          </h1>
          <p style={s.subtitle}>
            Allez HQ is currently in early access. We work directly with each new
            firm to ensure the platform fits their practice from day one.
          </p>
        </div>

        <div style={s.divider} />

        {/* Pricing + comparison table */}
        <div style={s.pricingBlock}>
          <p style={s.sectionEyebrow}>Pricing</p>
          <p style={s.pricingIntro}>
            Allez HQ is available in two tiers. Starter is designed for solo advisors
            and small teams looking for a unified platform to manage client relationships
            and capture meeting intelligence. Pro is built for growing firms that need
            the full AI workflow, pipeline visibility, and compliance tooling.
          </p>

          <div style={s.tableWrapper}>
            <ComparisonTable isMobile={isMobile} />
          </div>

          <p style={s.earlyAccessNote}>
            Early access customers work directly with our team to find the right
            structure for their firm. Get in touch to start that conversation or
            book a demo below.
          </p>
        </div>

        <div style={s.divider} />

        {/* CTA block */}
        <div style={s.ctaBlock}>
          <p style={s.sectionEyebrow}>Ready to take a look?</p>
          <p style={s.ctaHeadline}>Book a demo with our team.</p>
          <p style={s.ctaBody}>
            We'll walk you through the platform, answer your questions, and
            figure out together if Allez HQ is the right fit for your practice.
          </p>
          <div style={{ ...s.ctaActions, flexDirection: isMobile ? 'column' : 'row' }}>
            <Link to="/book-a-demo" className="demo-btn" style={s.demoBtnLink}>
              Book a Demo
            </Link>
            <Link to="/contact" className="text-link" style={s.ctaSecondaryLink}>
              Get in touch
            </Link>
          </div>
        </div>

      </div>

      <PublicFooter />
    </div>
  );
}

const s = {
  root: {
    fontFamily: FONT_BODY, position: 'relative', background: PUB_BG,
    overflowX: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column',
  },
  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: PUB_MESH_INDIGO, top: '-200px', left: '-200px',
    filter: 'blur(50px)', animation: 'mesh1 24s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: PUB_MESH_TEAL, top: '200px', right: '-150px',
    filter: 'blur(50px)', animation: 'mesh2 28s ease-in-out infinite',
  },
  page: {
    flex: 1, position: 'relative', zIndex: 1,
    maxWidth: '800px', margin: '0 auto', width: '100%',
  },
  heroBlock: { marginBottom: '64px' },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 20px',
  },
  title: {
    fontFamily: FONT_DISPLAY, fontWeight: FW_LIGHT,
    color: PUB_TEXT, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '0.01em',
  },
  subtitle: {
    fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.85,
    color: PUB_BODY_MUTED, maxWidth: '560px', margin: 0,
  },
  divider: { height: '1px', background: PUB_DIVIDER, margin: '64px 0' },
  pricingBlock: {},
  sectionEyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 20px',
  },
  pricingIntro: {
    fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.85,
    color: PUB_BODY_MUTED, maxWidth: '640px', margin: '0 0 48px',
  },
  tableWrapper: { marginBottom: '40px' },
  earlyAccessNote: {
    fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.8,
    color: PUB_TEXT, maxWidth: '560px', margin: 0,
  },
  ctaBlock: {},
  ctaHeadline: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: FW_LIGHT,
    color: PUB_TEXT, margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '0.01em',
  },
  ctaBody: {
    fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.85,
    color: PUB_BODY_MUTED, maxWidth: '520px', margin: '0 0 32px',
  },
  ctaActions: { display: 'flex', alignItems: 'center', gap: '20px' },
  demoBtnLink: {
    display: 'inline-block', background: PUB_GRADIENT,
    color: 'white', borderRadius: '10px', padding: '13px 28px',
    fontSize: '14px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.03em',
    textDecoration: 'none', fontFamily: FONT_BODY, transition: 'filter 0.2s',
  },
  ctaSecondaryLink: {
    fontSize: '13px', fontWeight: FW_MEDIUM, color: PUB_TEXT_MUTED,
    textDecoration: 'none', fontFamily: FONT_BODY, transition: 'opacity 0.15s',
  },
};