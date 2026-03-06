import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  ACCENT, ACCENT_MUTED, ACCENT_BORDER,
  D_BG, D_SURFACE, D_SURFACE_ALT, D_BORDER,
  D_TEXT, D_TEXT_MUTED, D_TEXT_SUBTLE,
  FONT_DISPLAY, FONT_BODY,
  RADIUS_MD, RADIUS_LG, RADIUS_PILL,
  SHADOW_MD,
} from '../utils/hqConstants';

const features = [
  {
    id: 'clients',
    title: 'Clients',
    description: 'Manage your client roster, financial profiles, risk tolerances, and relationship details.',
    route: '/hq/clients',
    status: 'live',
    metricLabel: 'Total Clients',
    metricQuery: 'clients',
  },
  {
    id: 'notes',
    title: 'AI Notes',
    description: 'Record and transcribe meetings. Extract action items, securities mentions, and compliance flags automatically.',
    route: '/hq/notes',
    status: 'live',
    metricLabel: 'Total Notes',
    metricQuery: 'notes',
  },
  {
    id: 'crm',
    title: 'CRM',
    description: 'Track client interactions, touchpoints, and communication history across your entire practice.',
    route: '/hq/crm',
    status: 'coming_soon',
    metricLabel: 'Interactions',
    metricQuery: null,
  },
  {
    id: 'onboarding',
    title: 'Onboarding',
    description: 'Monitor new client onboarding progress, step completion, and outstanding tasks.',
    route: '/hq/onboarding',
    status: 'coming_soon',
    metricLabel: 'In Progress',
    metricQuery: null,
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function HQ() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [metrics, setMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const name = data?.user?.user_metadata?.display_name || '';
      setFirstName(name.split(' ')[0]);
    });

    async function fetchMetrics() {
      const [{ data: clients }, { data: notes }] = await Promise.all([
        supabase.from('clients').select('id'),
        supabase.from('notes').select('id'),
      ]);
      setMetrics({
        clients: clients?.length ?? 0,
        notes: notes?.length ?? 0,
      });
      setMetricsLoading(false);
    }
    fetchMetrics();
  }, []);

  return (
    <div style={s.pageWrapper}>
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hq-card {
          animation: fadeUp 0.4s ease both;
        }

        .hq-card-live:hover {
          border-color: ${ACCENT_BORDER} !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(29, 185, 84, 0.1) !important;
        }

        .hq-card-live {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          cursor: pointer;
        }

        .hq-open-btn:hover {
          background: ${ACCENT} !important;
          color: #fff !important;
        }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Allez HQ</h1>
          <p style={s.date}>{formatDate(new Date())}</p>
        </div>
        <div style={s.roleBadge}>
          <span style={s.roleDot} />
          <span style={s.roleText}>Admin</span>
          <span style={s.roleNote}>· Role permissions coming soon</span>
        </div>
      </div>

      <div style={s.divider} />

      {/* Feature Grid */}
      <div style={s.grid}>
        {features.map((feature, i) => {
          const isLive = feature.status === 'live';
          const metric = feature.metricQuery ? metrics[feature.metricQuery] : null;

          return (
            <div
              key={feature.id}
              className={`hq-card ${isLive ? 'hq-card-live' : ''}`}
              style={{
                ...s.card,
                ...(isLive ? s.cardLive : s.cardDimmed),
                animationDelay: `${i * 80}ms`,
              }}
              onClick={() => isLive && navigate(feature.route)}
              onMouseEnter={() => isLive && setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Status badge */}
              <div style={s.cardTop}>
                {isLive ? (
                  <span style={s.liveBadge}>Live</span>
                ) : (
                  <span style={s.soonBadge}>Coming Soon</span>
                )}
              </div>

              {/* Title */}
              <h2 style={{ ...s.cardTitle, ...(isLive ? {} : { color: D_TEXT_MUTED }) }}>
                {feature.title}
              </h2>

              {/* Description */}
              <p style={s.cardDesc}>{feature.description}</p>

              {/* Footer */}
              <div style={s.cardFooter}>
                {isLive && !metricsLoading && metric !== null ? (
                  <div style={s.metric}>
                    <span style={s.metricNumber}>{metric}</span>
                    <span style={s.metricLabel}>{feature.metricLabel}</span>
                  </div>
                ) : (
                  <div />
                )}
                {isLive && (
                  <button
                    className="hq-open-btn"
                    style={s.openBtn}
                    onClick={(e) => { e.stopPropagation(); navigate(feature.route); }}
                  >
                    Open →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p style={s.footerNote}>
        Allez HQ · Role-based access controls (Admin / Advisor / Viewer) are on the roadmap.
      </p>
    </div>
    </div>
  );
}

const s = {
  pageWrapper: {
    background: D_BG,
    minHeight: '100vh',
    width: '100%',
  },
  page: {
    fontFamily: FONT_BODY,
    color: D_TEXT,
    padding: '120px 40px 80px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '28px',
  },
  greeting: {
    fontFamily: FONT_BODY,
    fontSize: '14px',
    fontWeight: 400,
    color: D_TEXT_MUTED,
    marginBottom: '8px',
    letterSpacing: '0.02em',
  },
  title: {
    fontFamily: FONT_DISPLAY,
    fontSize: '44px',
    fontWeight: 300,
    color: D_TEXT,
    margin: '0 0 6px',
    letterSpacing: '0.01em',
    lineHeight: 1.1,
  },
  date: {
    fontSize: '13px',
    color: D_TEXT_SUBTLE,
    fontWeight: 300,
    letterSpacing: '0.03em',
  },
  roleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: D_SURFACE,
    border: `1px solid ${D_BORDER}`,
    borderRadius: RADIUS_PILL,
    padding: '6px 14px',
    marginBottom: '4px',
  },
  roleDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: ACCENT,
    display: 'inline-block',
    flexShrink: 0,
  },
  roleText: {
    fontSize: '12px',
    fontWeight: 600,
    color: D_TEXT,
    letterSpacing: '0.04em',
  },
  roleNote: {
    fontSize: '11px',
    color: D_TEXT_MUTED,
    fontWeight: 300,
  },
  divider: {
    height: '1px',
    background: D_BORDER,
    marginBottom: '36px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
    marginBottom: '48px',
  },
  card: {
    background: D_SURFACE,
    border: `1px solid ${D_BORDER}`,
    borderRadius: RADIUS_LG,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '220px',
    boxShadow: SHADOW_MD,
  },
  cardLive: {
    background: D_SURFACE,
  },
  cardDimmed: {
    background: D_SURFACE_ALT,
    opacity: 0.6,
  },
  cardTop: {
    marginBottom: '16px',
  },
  liveBadge: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: ACCENT,
    background: ACCENT_MUTED,
    border: `1px solid ${ACCENT_BORDER}`,
    padding: '3px 10px',
    borderRadius: RADIUS_PILL,
  },
  soonBadge: {
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: D_TEXT_MUTED,
    background: 'rgba(255,255,255,0.04)',
    padding: '3px 10px',
    borderRadius: RADIUS_PILL,
  },
  cardTitle: {
    fontFamily: FONT_DISPLAY,
    fontSize: '22px',
    fontWeight: 400,
    color: D_TEXT,
    margin: '0 0 10px',
    letterSpacing: '0.01em',
    lineHeight: 1.2,
  },
  cardDesc: {
    fontSize: '13px',
    color: D_TEXT_MUTED,
    lineHeight: 1.65,
    fontWeight: 300,
    flex: 1,
    margin: '0 0 20px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metricNumber: {
    fontFamily: FONT_DISPLAY,
    fontSize: '32px',
    fontWeight: 400,
    color: ACCENT,
    lineHeight: 1,
  },
  metricLabel: {
    fontSize: '10px',
    color: D_TEXT_MUTED,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 500,
  },
  openBtn: {
    background: 'transparent',
    border: `1px solid ${D_BORDER}`,
    color: ACCENT,
    borderRadius: RADIUS_MD,
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    fontFamily: FONT_BODY,
  },
  footerNote: {
    fontSize: '12px',
    color: D_TEXT_SUBTLE,
    textAlign: 'center',
    fontWeight: 300,
    letterSpacing: '0.04em',
  },
};