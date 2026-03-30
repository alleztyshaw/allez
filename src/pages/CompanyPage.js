// src/pages/CompanyPage.js
// Public-facing company page at /company.

import {
  PUB_BG, PUB_TEXT, PUB_ACCENT, PUB_BODY_MUTED, PUB_DIVIDER,
  PUB_MESH_INDIGO, PUB_MESH_TEAL, PUB_FONTS_AND_KEYFRAMES,
  FONT_BODY,
  FW_LIGHT, FW_MEDIUM,
  MOBILE_BREAKPOINT,
} from '../utils/publicConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import PublicHelmet from '../components/public/PublicHelmet';

export default function CompanyPage() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  return (
    <div style={s.root}>
      <style>{PUB_FONTS_AND_KEYFRAMES}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHelmet
        title="Company — Allez HQ"
        description="Why we built Allez HQ and the experience behind it. Built by a team with direct experience in advisory practice operations, strategy consulting, and regulated technology."
        path="/company"
      />
      <PublicHeader />

      <div style={{ ...s.page, padding: isMobile ? '64px 24px' : '100px 40px' }}>

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
          <p style={{ ...s.bodyText, color: PUB_TEXT, margin: 0 }}>
            Advisors who compete on the quality of that relationship deserve better.
            Allez HQ was built to deliver it.
          </p>
        </section>

        <div style={s.divider} />

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
  section: { paddingBottom: '80px' },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 20px',
  },
  bodyText: {
    fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.9,
    color: PUB_BODY_MUTED, margin: '0 0 24px',
  },
  divider: { height: '1px', background: PUB_DIVIDER, margin: '0 0 80px' },
};