// src/pages/CompanyPage.js
// Public-facing company page at /company.

import {
  PUB_BG, PUB_TEXT, PUB_ACCENT, PUB_BODY_MUTED, PUB_DIVIDER, PUB_TEXT_MUTED,
  PUB_MESH_INDIGO, PUB_MESH_TEAL, PUB_FONTS_AND_KEYFRAMES,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM,
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

        {/* Vision */}
        <section style={s.section}>
          <p style={s.eyebrow}>Our vision</p>
          <h1 style={{ ...s.visionTitle, fontSize: isMobile ? '32px' : '48px' }}>
            Built for the relationship.<br />Designed for the practice.
          </h1>
          <p style={s.bodyText}>
            The most sophisticated client relationships share a common thread: a team of
            people whose entire job is to know the client completely. Their financial life,
            their goals, the moments that matter to them. Elite firms today have built their
            entire organizations around that depth of service.
          </p>
          <p style={s.bodyText}>
            Most advisors have always wanted to operate that way. The constraint has never
            been intention — it's been infrastructure. The legacy tools used in the industry
            today were designed to manage transactions and track activity. Not to help an
            advisor know their clients completely, anticipate what they need, and show up
            for every moment that matters.
          </p>
          <p style={{ ...s.bodyText, margin: 0 }}>
            Allez HQ is built on the belief that infrastructure shouldn't be a privilege
            of scale. The standard of service that defines the best client relationships
            should be achievable by any advisor — and the tools to get there should be
            built for that purpose from the start.
          </p>
        </section>

        {/* Pull quote */}
        <div style={s.pullQuoteWrap}>
          <p style={{ ...s.pullQuoteText, fontSize: isMobile ? '22px' : '30px' }}>
            "Infrastructure shouldn't be a privilege of scale."
          </p>
        </div>

        {/* Why We Built This */}
        <section style={s.section}>
          <p style={s.eyebrow}>Why we built this</p>
          <p style={s.bodyText}>
            Legacy platforms were built for a different era and a different kind of work.
            Adding modern capabilities to fragmented, compliance-constrained infrastructure
            is harder than starting over — so most haven't. The result is advisors managing
            their tools as much as their clients.
          </p>
          <p style={{ ...s.bodyText, margin: 0 }}>
            Allez HQ was built on a different premise. One platform, designed from the
            start for this specific kind of work, with the capabilities the relationship
            actually demands.
          </p>
        </section>

        <div style={s.divider} />

        {/* Who We Are */}
        <section style={{ ...s.section, paddingBottom: '40px' }}>
          <p style={s.eyebrow}>Who we are</p>
          <p style={{ ...s.bodyText, margin: 0 }}>
            The Allez HQ team brings together experience across investment and wealth
            management, elite strategy consulting, and building technology inside
            fast-growing companies in highly regulated industries. That combination —
            domain depth, operational rigor, and regulated technology experience — is
            reflected in every decision the product makes.
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
    maxWidth: '960px', margin: '0 auto', width: '100%',
  },
  section: { paddingBottom: '64px' },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 20px',
  },
  visionTitle: {
    fontFamily: FONT_DISPLAY, fontWeight: FW_LIGHT,
    lineHeight: 1.15, letterSpacing: '0.01em',
    color: PUB_TEXT, margin: '0 0 32px',
  },
  bodyText: {
    fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.9,
    color: PUB_BODY_MUTED, margin: '0 0 24px',
  },
  pullQuoteWrap: {
    borderTop: `1px solid rgba(0,0,0,0.07)`,
    borderBottom: `1px solid rgba(0,0,0,0.07)`,
    padding: '48px 0 56px',
    marginBottom: '64px',
    textAlign: 'center',
  },
  pullQuoteText: {
    fontFamily: FONT_DISPLAY, fontWeight: FW_REGULAR, fontStyle: 'italic',
    lineHeight: 1.3, letterSpacing: '0.01em',
    color: PUB_TEXT_MUTED, margin: 0,
  },
  divider: { height: '1px', background: PUB_DIVIDER, margin: '0 0 64px' },
};