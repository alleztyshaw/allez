// src/pages/HomePage.js
// Public-facing home page at /.
// Marketing content only — auth lives at /sign-in.

import {
  SITE_ACCENT,
  L_BG, L_TEXT,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';

export default function HomePage() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes mesh1 {
          0%,100% { transform:translate(0,0) scale(1); }
          25%      { transform:translate(60px,-80px) scale(1.08); }
          50%      { transform:translate(-40px,60px) scale(0.95); }
          75%      { transform:translate(80px,40px) scale(1.05); }
        }
        @keyframes mesh2 {
          0%,100% { transform:translate(0,0) scale(1); }
          25%      { transform:translate(-70px,50px) scale(1.06); }
          50%      { transform:translate(50px,-70px) scale(0.97); }
          75%      { transform:translate(-30px,-30px) scale(1.04); }
        }
        @keyframes mesh3 {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(50px,60px) scale(1.07); }
          66%      { transform:translate(-60px,-40px) scale(0.96); }
        }
        @keyframes mesh4 {
          0%,100% { transform:translate(0,0) scale(1); }
          40%      { transform:translate(-80px,30px) scale(1.05); }
          80%      { transform:translate(40px,-60px) scale(0.98); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scrollBounce {
          0%,100% { transform:translateY(0); opacity:0.5; }
          50%      { transform:translateY(6px); opacity:1; }
        }
        .value-card:hover {
          background:rgba(255,255,255,0.20) !important;
          transform:translateY(-2px);
        }
        .scroll-cue { animation:scrollBounce 2s ease-in-out infinite; }
      `}</style>

      <div style={s.meshWrap}>
        <div style={{ ...s.mesh1, width: isMobile ? '500px' : '900px', height: isMobile ? '500px' : '900px' }} />
        <div style={{ ...s.mesh2, width: isMobile ? '400px' : '800px', height: isMobile ? '400px' : '800px' }} />
        {!isMobile && <div style={s.mesh3} />}
        {!isMobile && <div style={s.mesh4} />}
      </div>

      <PublicHeader />

      {/* Hero */}
      <main style={{ ...s.hero, padding: isMobile ? '0 24px 80px' : '0 40px 100px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ animation: 'fadeIn 1s ease 0.2s both' }}>
            <p style={s.eyebrow}>For independent advisors, RIAs &amp; wealth management firms</p>
            <p style={s.tagline}>Relationships,<br />refined.</p>
            <p style={s.heroSub}>
              The practice management platform that keeps you ahead<br />
              of every client relationship — not catching up to it.
            </p>
          </div>
        </div>
        <div className="scroll-cue" style={s.scrollCue}>
          <svg width="36" height="36" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(26,26,26,0.35)"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </main>

      <section style={s.scrollSection}>

        {/* Definition */}
        <div style={{ ...s.definitionBlock, padding: isMobile ? '60px 24px 48px' : '100px 40px 80px' }}>
          <div style={s.phonetic}>
            <span style={s.word}>Allez</span>
            <span style={s.pronunciation}>&nbsp;&nbsp;/a·ˈlɛ/&nbsp;&nbsp;·&nbsp;&nbsp;ah-LAY</span>
          </div>
          <p style={s.partOfSpeech}>French, verb imperative</p>
          <p style={s.definition}>
            <em>"Go."</em> The word a coach shouts from the sideline.
            The word a crowd roars at the finish line. A single syllable
            that means: <em>don't wait, move forward, the moment is now.</em>
          </p>
          <p style={s.definitionSub}>
            We thought it fit for a platform built around momentum —
            keeping advisors ahead of the relationship, not behind it.
          </p>
        </div>

        <div style={s.divider} />

        {/* Value section */}
        <div style={{ ...s.valueBlock, padding: isMobile ? '48px 24px 64px' : '80px 40px 100px' }}>
          <p style={s.valueEyebrow}>Built in partnership with working advisors</p>
          <h2 style={s.valueTitle}>
            Your clients deserve an advisor<br />
            who's always prepared.
          </h2>
          <p style={s.valueSubtitle}>
            Allez HQ connects your client data, meeting notes, tasks, and
            compliance workflow into a single platform — so the intelligence
            you've built over years of relationships is always at your fingertips,
            not buried in three different tools.
          </p>
          <div style={s.valueGrid}>
            {[
              {
                headline: 'Walk into every meeting prepared.',
                body: 'AI-generated briefs pull from your notes, open tasks, and client history. You know the relationship before you say hello.',
              },
              {
                headline: 'Never let a relationship go cold.',
                body: 'Cadence signals flag clients who are overdue for contact. Your book stays warm — not by memory, but by design.',
              },
              {
                headline: 'From transcript to action items in seconds.',
                body: 'Record or paste a meeting transcript and the platform surfaces decisions made, next steps, and compliance signals automatically.',
              },
              {
                headline: 'One platform, not four.',
                body: 'CRM, notes, task management, and compliance — natively unified. No context-switching. No data falling between tools.',
              },
            ].map(item => (
              <div key={item.headline} className="value-card" style={s.valueCard}>
                <p style={s.valueCardHeadline}>{item.headline}</p>
                <p style={s.valueCardBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={s.divider} />

        {/* Trust section */}
        <div style={{ ...s.trustBlock, padding: isMobile ? '48px 24px 64px' : '80px 40px 100px' }}>
          <p style={s.trustEyebrow}>Data security &amp; privacy</p>
          <h2 style={s.trustTitle}>Your client data stays yours.</h2>
          <p style={s.trustSubtitle}>
            Client relationships are built on trust. We take that seriously at the infrastructure level.
          </p>
          <div style={s.trustGrid}>
            {[
              {
                icon: (
                  <svg width="33" height="33" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M7.5 10V7a3.5 3.5 0 017 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="11" cy="15" r="1.25" fill="currentColor"/>
                  </svg>
                ),
                heading: 'Never used for model training.',
                body: 'Your data is never shared with AI providers for training purposes. What happens in your practice stays in your practice.',
              },
              {
                icon: (
                  <svg width="33" height="33" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="8" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M13 10h4M13 12.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                heading: 'Client PII is de-identified before AI processing.',
                body: 'Before any transcript or note reaches an AI model, client names and identifying details are replaced with anonymized tokens. They are re-identified only when results are returned to you.',
              },
              {
                icon: (
                  <svg width="33" height="33" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="3" y="13" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="16.5" cy="6.5" r="1" fill="currentColor"/>
                    <circle cx="16.5" cy="15.5" r="1" fill="currentColor"/>
                  </svg>
                ),
                heading: 'Enterprise-grade infrastructure.',
                body: 'Allez HQ is built on Supabase, hosted on secure cloud infrastructure. Data is encrypted at rest and in transit. Row-level security ensures each firm\'s data is fully isolated.',
              },
              {
                icon: (
                  <svg width="33" height="33" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 2L3 5.5v5.5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5.5L11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M7.5 11l2.5 2.5L15 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                heading: 'You control your data.',
                body: 'Client records can be soft-deleted at any time. Nothing is silently retained. Your data is yours — not a training asset, not a product.',
              },
            ].map(item => (
              <div key={item.heading} style={s.trustCard}>
                <span style={s.trustIcon}>{item.icon}</span>
                <p style={s.trustHeading}>{item.heading}</p>
                <p style={s.trustBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <PublicFooter />
      </section>
    </div>
  );
}

const s = {
  root: { fontFamily: FONT_BODY, position: 'relative', background: L_BG, overflowX: 'hidden' },

  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(99,102,241,0.20) 50%, transparent 70%)',
    top: '-350px', left: '-250px', filter: 'blur(40px)', animation: 'mesh1 20s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.50) 0%, rgba(236,72,153,0.18) 50%, transparent 70%)',
    top: '-150px', right: '-250px', filter: 'blur(45px)', animation: 'mesh2 24s ease-in-out infinite',
  },
  mesh3: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,184,166,0.48) 0%, rgba(20,184,166,0.16) 50%, transparent 70%)',
    bottom: '-250px', left: '5%', filter: 'blur(40px)', animation: 'mesh3 28s ease-in-out infinite',
  },
  mesh4: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,146,60,0.45) 0%, rgba(251,146,60,0.15) 70%)',
    bottom: '-150px', right: '0%', filter: 'blur(45px)', animation: 'mesh4 22s ease-in-out infinite',
  },

  hero: {
    height: 'calc(100dvh - 64px)', minHeight: 'calc(100svh - 64px)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between', alignItems: 'center', textAlign: 'center',
    position: 'relative', zIndex: 1,
  },
  eyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(26,26,26,0.45)', margin: '0 0 20px' },
  tagline: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(48px, 6.5vw, 88px)', fontStyle: 'italic',
    fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 24px', letterSpacing: '0.01em', lineHeight: 1.1,
  },
  heroSub: { fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.5)', margin: 0 },
  scrollCue: { display: 'flex', justifyContent: 'center', width: '100%', flexShrink: 0, cursor: 'default' },

  scrollSection: {
    position: 'relative', zIndex: 1,
    background: 'rgba(248,248,245,0.35)', backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.04)',
  },

  definitionBlock: { maxWidth: '1100px', margin: '0 auto' },
  phonetic: { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '8px' },
  word: { fontFamily: FONT_DISPLAY, fontSize: '52px', fontWeight: FW_LIGHT, color: L_TEXT, letterSpacing: '0.02em' },
  pronunciation: { fontFamily: FONT_BODY, fontSize: '16px', fontWeight: FW_LIGHT, color: 'rgba(26,26,26,0.45)', letterSpacing: '0.04em' },
  partOfSpeech: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.14em', color: SITE_ACCENT, margin: '0 0 28px' },
  definition: { fontFamily: FONT_DISPLAY, fontSize: '26px', fontWeight: FW_LIGHT, lineHeight: 1.6, color: L_TEXT, margin: '0 0 20px' },
  definitionSub: { fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.55)', margin: 0 },

  divider: { height: '1px', background: 'rgba(0,0,0,0.07)', margin: '0 40px' },

  valueBlock: { maxWidth: '1100px', margin: '0 auto' },
  valueEyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 16px' },
  valueTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(28px, 3.5vw, 44px)',
    fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 20px', lineHeight: 1.2, letterSpacing: '0.01em',
  },
  valueSubtitle: { fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.55)', maxWidth: '600px', margin: '0 0 56px' },
  valueGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  valueCard: {
    background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.48)', borderRadius: '16px', padding: '28px',
    transition: 'background 0.2s, transform 0.2s',
  },
  valueCardHeadline: { fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: FW_REGULAR, color: L_TEXT, margin: '0 0 12px', letterSpacing: '0.01em', lineHeight: 1.3 },
  valueCardBody: { fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.58)', margin: 0 },

  trustBlock: { maxWidth: '1100px', margin: '0 auto' },
  trustEyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 16px' },
  trustTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(28px, 3.5vw, 44px)',
    fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '0.01em',
  },
  trustSubtitle: { fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.55)', maxWidth: '520px', margin: '0 0 48px' },
  trustGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  trustCard: {
    background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.40)', borderRadius: '16px', padding: '28px',
  },
  trustIcon: { display: 'block', color: 'rgba(26,26,26,0.4)', marginBottom: '16px' },
  trustHeading: { fontSize: '14px', fontWeight: FW_MEDIUM, color: L_TEXT, margin: '0 0 10px', lineHeight: 1.4 },
  trustBody: { fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.58)', margin: 0 },
};