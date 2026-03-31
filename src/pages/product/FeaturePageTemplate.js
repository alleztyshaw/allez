// src/pages/product/FeaturePageTemplate.js
// Shared template for all feature subpages at /product/[slug].

import { Link } from 'react-router-dom';
import {
  PUB_BG, PUB_TEXT, PUB_TEXT_MUTED, PUB_TEXT_SUBTLE, PUB_ACCENT,
  PUB_BODY_MUTED, PUB_GRADIENT, PUB_DIVIDER,
  PUB_MESH_INDIGO, PUB_MESH_TEAL, PUB_FONTS_AND_KEYFRAMES,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../../utils/publicConstants';
import useWindowWidth from '../../hooks/useWindowWidth';
import PublicHeader from '../../components/public/PublicHeader';
import PublicFooter from '../../components/public/PublicFooter';
import PublicHelmet from '../../components/public/PublicHelmet';
import { FEATURE_ORDER, FEATURES } from './featureContent';

export default function FeaturePageTemplate({ slug }) {
  const feature    = FEATURES[slug];
  const windowWidth = useWindowWidth();
  const isMobile   = windowWidth < MOBILE_BREAKPOINT;

  const currentIndex = FEATURE_ORDER.indexOf(slug);
  const prevSlug     = currentIndex > 0 ? FEATURE_ORDER[currentIndex - 1] : null;
  const nextSlug     = currentIndex < FEATURE_ORDER.length - 1 ? FEATURE_ORDER[currentIndex + 1] : null;
  const prevFeature  = prevSlug ? FEATURES[prevSlug] : null;
  const nextFeature  = nextSlug ? FEATURES[nextSlug] : null;

  return (
    <div style={s.root}>
      <style>{`
        ${PUB_FONTS_AND_KEYFRAMES}
        .demo-btn:hover  { filter: brightness(1.06); }
        .nav-link:hover  { opacity: 0.7; }
      `}</style>

      <PublicHelmet
        title={`${feature.name} — Allez HQ`}
        description={feature.metaDescription}
        path={`/product/${slug}`}
      />

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHeader />

      <div style={{ ...s.page, padding: isMobile ? '32px 24px 80px' : '48px 40px 100px' }}>

        {/* Breadcrumb */}
        <div style={s.breadcrumb}>
          <Link to="/product" className="nav-link" style={s.breadcrumbLink}>
            ← Product
          </Link>
        </div>

        {/* Hero */}
        <div style={s.heroBlock}>
          <p style={s.eyebrow}>{feature.name}</p>
          <h1 style={{ ...s.title, fontSize: isMobile ? '32px' : 'clamp(32px, 4vw, 52px)' }}>
            {feature.tagline}
          </h1>
        </div>

        {/* Why This Matters */}
        <div style={s.section}>
          <p style={s.sectionEyebrow}>{feature.why.heading}</p>
          <p style={s.bodyText}>{feature.why.body}</p>
        </div>

        {/* How It Works */}
        <div style={s.section}>
          <p style={s.sectionEyebrow}>{feature.how.heading}</p>
          <p style={s.bodyText}>{feature.how.body}</p>
        </div>

        <div style={s.divider} />

        {/* Visual */}
        <div style={s.visualBlock}>
          {feature.visual}
          {feature.secondaryVisual && (
            <div style={{ marginTop: '24px' }}>
              {feature.secondaryLabel && (
                <p style={s.secondaryLabel}>{feature.secondaryLabel}</p>
              )}
              {feature.secondaryVisual}
            </div>
          )}
        </div>

        <div style={s.divider} />

        {/* What You Get */}
        <div style={s.section}>
          <p style={s.sectionEyebrow}>What You Get</p>
          <ul style={s.bulletList}>
            {feature.bullets.map(b => (
              <li key={b} style={s.bulletItem}>
                <span style={s.bulletDot} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={s.divider} />

        {/* CTA */}
        <div style={s.ctaBlock}>
          <p style={s.ctaHeadline}>See it in action.</p>
          <p style={s.ctaBody}>
            Book a demo and we'll walk you through the platform, including {feature.name.toLowerCase()}, tailored to your practice.
          </p>
          <Link to="/book-a-demo" className="demo-btn" style={s.demoBtn}>
            Book a Demo
          </Link>
        </div>

        <div style={s.divider} />

        {/* Prev / Next */}
        <div style={{ ...s.featureNav, flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={s.featureNavLeft}>
            {prevFeature && (
              <Link to={`/product/${prevSlug}`} className="nav-link" style={s.featureNavLink}>
                <span style={s.featureNavDir}>← Previous</span>
                <span style={s.featureNavName}>{prevFeature.name}</span>
              </Link>
            )}
          </div>
          <div style={s.featureNavRight}>
            {nextFeature && (
              <Link to={`/product/${nextSlug}`} className="nav-link" style={{ ...s.featureNavLink, alignItems: isMobile ? 'flex-start' : 'flex-end' }}>
                <span style={s.featureNavDir}>Next →</span>
                <span style={s.featureNavName}>{nextFeature.name}</span>
              </Link>
            )}
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
  breadcrumb: { marginBottom: '32px' },
  breadcrumbLink: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.12em', color: PUB_TEXT_SUBTLE, textDecoration: 'none',
    fontFamily: FONT_BODY, transition: 'opacity 0.15s',
  },
  heroBlock: { marginBottom: '48px' },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 16px',
  },
  title: {
    fontFamily: FONT_DISPLAY, fontWeight: FW_LIGHT,
    color: PUB_TEXT, margin: 0, lineHeight: 1.1, letterSpacing: '0.01em',
  },
  section: { marginBottom: '40px' },
  sectionEyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 12px',
  },
  bodyText: {
    fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.85,
    color: PUB_BODY_MUTED, margin: 0,
  },
  divider: { height: '1px', background: PUB_DIVIDER, margin: '48px 0' },
  visualBlock: { width: '100%' },
  secondaryLabel: {
    fontSize: '10px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.1em', color: PUB_TEXT_SUBTLE, margin: '0 0 12px', fontFamily: FONT_BODY,
  },
  bulletList: {
    listStyle: 'none', margin: 0, padding: 0,
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  bulletItem: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.65, color: PUB_TEXT,
  },
  bulletDot: {
    display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%',
    background: PUB_ACCENT, flexShrink: 0, marginTop: '9px',
  },
  ctaBlock: { textAlign: 'left' },
  ctaHeadline: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: FW_LIGHT,
    color: PUB_TEXT, margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '0.01em',
  },
  ctaBody: {
    fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.8,
    color: PUB_BODY_MUTED, margin: '0 0 28px', maxWidth: '480px',
  },
  demoBtn: {
    display: 'inline-block', background: PUB_GRADIENT,
    color: 'white', borderRadius: '10px', padding: '13px 28px',
    fontSize: '14px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.03em',
    textDecoration: 'none', fontFamily: FONT_BODY, transition: 'filter 0.2s',
  },
  featureNav: {
    display: 'flex', justifyContent: 'space-between', gap: '24px',
  },
  featureNavLeft:  { flex: 1 },
  featureNavRight: { flex: 1 },
  featureNavLink: {
    display: 'flex', flexDirection: 'column', gap: '4px',
    textDecoration: 'none', transition: 'opacity 0.15s',
  },
  featureNavDir: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.12em', color: PUB_TEXT_SUBTLE, fontFamily: FONT_BODY,
  },
  featureNavName: {
    fontSize: '15px', fontWeight: FW_LIGHT, color: PUB_TEXT_MUTED, fontFamily: FONT_BODY,
  },
};