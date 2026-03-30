// src/pages/CompanyPage.js
// Public-facing company page at /company.

import {
  SITE_ACCENT,
  L_BG, L_TEXT, L_TEXT_MUTED,
  FONT_BODY,
  FW_LIGHT, FW_MEDIUM,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';

export default function CompanyPage() {
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
      `}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHeader />

      <div style={{ ...s.page, padding: isMobile ? '64px 24px' : '100px 40px' }}>

        {/* Why We Built This */}
        <section style={s.section}>
          <p style={s.eyebrow}>Why We Built This</p>
          <p style={s.bodyText}>
            The wealth management industry has some of the most sophisticated professionals
            in finance. The software they run on has not kept pace.
          </p>
          <p style={s.bodyText}>
            Some of today's most commonly used practice management tools are general-purpose
            CRMs repurposed for a different kind of relationship, or broader platforms with
            compliance and client management layered on after the fact. The result is software
            that checks boxes without considering how the pieces connect to the practice
            workflow — and advisors who spend more time managing their tools than managing
            their clients.
          </p>
          <p style={{ ...s.bodyText, ...s.closing }}>
            Advisors who compete on the quality of that relationship deserve better.
            Allez HQ was built to deliver it.
          </p>
        </section>

        <div style={s.divider} />

        {/* Who We Are */}
        <section style={s.section}>
          <p style={s.eyebrow}>Who We Are</p>
          <p style={s.bodyText}>
            The Allez HQ team brings together experience across wealth and investment
            management, elite strategy consulting, and building technology inside fast-growing
            companies in highly regulated industries. We have direct experience in advisory
            practice operations — the compliance obligations, the client expectations, the
            operational overhead that quietly compounds. We built this because we have seen
            the problem from the inside, and that shaped everything about how we solved it.
            Allez HQ is compliance-aware from day one and organized around what matters
            most: the client relationship.
          </p>
        </section>

      </div>

      <PublicFooter />
    </div>
  );
}

const s = {
  root: {
    fontFamily: FONT_BODY, position: 'relative', background: L_BG,
    overflowX: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column',
  },

  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.30) 0%, rgba(99,102,241,0.10) 50%, transparent 70%)',
    top: '-200px', left: '-200px', filter: 'blur(50px)', animation: 'mesh1 24s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,184,166,0.25) 0%, rgba(20,184,166,0.08) 50%, transparent 70%)',
    top: '200px', right: '-150px', filter: 'blur(50px)', animation: 'mesh2 28s ease-in-out infinite',
  },

  page: {
    flex: 1, position: 'relative', zIndex: 1,
    maxWidth: '800px', margin: '0 auto', width: '100%',
  },

  section: { paddingBottom: '80px' },

  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 20px',
  },
  bodyText: {
    fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.9,
    color: 'rgba(26,26,26,0.65)', margin: '0 0 24px',
  },
  closing: {
    color: L_TEXT, margin: 0,
  },

  divider: {
    height: '1px', background: 'rgba(0,0,0,0.07)',
    margin: '0 0 80px',
  },
};