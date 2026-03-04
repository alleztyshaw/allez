import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const features = [
  {
    id: 'clients',
    title: 'Clients',
    description: 'Manage your client roster, financial profiles, risk tolerances, and relationship details.',
    route: '/hq/clients',
    status: 'live',
    icon: '👤',
    metricLabel: 'Total Clients',
    metricQuery: 'clients',
  },
  {
    id: 'notes',
    title: 'Notes',
    description: 'Record meeting notes, calls, and emails. Tag by client and type, with AI transcription coming soon.',
    route: '/hq/notes',
    status: 'live',
    icon: '🎙️',
    metricLabel: 'Notes',
    metricQuery: null,
  },
  {
    id: 'crm',
    title: 'CRM',
    description: 'Track client interactions, touchpoints, and communication history in one place.',
    route: '/hq/crm',
    status: 'coming_soon',
    icon: '🤝',
    metricLabel: 'Interactions',
    metricQuery: null,
  },
  {
    id: 'onboarding',
    title: 'Onboarding Tracker',
    description: 'Monitor new client onboarding progress, step completion, and outstanding tasks.',
    route: '/hq/onboarding',
    status: 'coming_soon',
    icon: '📋',
    metricLabel: 'In Progress',
    metricQuery: null,
  },
];

export default function HQ() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [metrics, setMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setFirstName(session.user.user_metadata.display_name || '');
      }
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      setMetricsLoading(true);
      const { data: clientsData } = await supabase.from('clients').select('id');
      setMetrics({ clients: clientsData?.length ?? 0 });
      setMetricsLoading(false);
    }
    fetchMetrics();
  }, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div style={s.page}>
      <div style={s.bgTexture} />

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <p style={s.greeting}>
            {getGreeting()}{firstName ? `, ${firstName}` : ''}
          </p>
          <h1 style={s.title}>Allez HQ</h1>
          <p style={s.date}>{formattedDate}</p>
        </div>
        <div style={s.headerRight}>
          <div style={s.roleBadge}>
            <span style={s.roleDot} />
            <span style={s.roleText}>Admin</span>
            <span style={s.roleComingSoon}>· Role permissions coming soon</span>
          </div>
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
              style={{
                ...s.card,
                ...(isLive ? s.cardLive : s.cardDimmed),
                animationDelay: `${i * 80}ms`,
              }}
              onClick={() => isLive && navigate(feature.route)}
              className="hq-card"
            >
              <div style={s.cardTop}>
                <span style={s.cardIcon}>{feature.icon}</span>
                {isLive ? (
                  <span style={s.liveBadge}>Live</span>
                ) : (
                  <span style={s.soonBadge}>Coming Soon</span>
                )}
              </div>

              <h2 style={{ ...s.cardTitle, ...(isLive ? {} : s.cardTitleDimmed) }}>
                {feature.title}
              </h2>
              <p style={s.cardDesc}>{feature.description}</p>

              <div style={s.cardFooter}>
                {isLive && !metricsLoading && metric !== null ? (
                  feature.id === 'notes' ? (
                    <span style={s.metricLabel}>{metric}</span>
                  ) : (
                    <div style={s.metric}>
                      <span style={s.metricNumber}>{metric}</span>
                      <span style={s.metricLabel}>{feature.metricLabel}</span>
                    </div>
                  )
                ) : (
                  <div />
                )}
                {isLive && (
                  <button
                    style={s.cardButton}
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hq-card {
          animation: fadeUp 0.45s ease both;
        }

        .hq-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.18) !important;
        }
      `}</style>
    </div>
  );
}

const GOLD = '#c9a84c';
const DARK = '#0f1117';
const CARD_BG = '#181c27';
const BORDER = 'rgba(201,168,76,0.18)';
const TEXT_PRIMARY = '#f0ece0';
const TEXT_MUTED = '#7a7d8a';

const s = {
  page: {
    minHeight: '100vh',
    background: DARK,
    padding: '48px 40px 80px',
    position: 'relative',
    fontFamily: "'DM Sans', sans-serif",
    color: TEXT_PRIMARY,
    overflow: 'hidden',
  },
  bgTexture: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(201,168,76,0.06) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 80%, rgba(102,126,234,0.05) 0%, transparent 60%)`,
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    maxWidth: '1100px',
    margin: '0 auto',
    position: 'relative',
  },
  headerLeft: {},
  headerRight: {
    paddingBottom: '8px',
  },
  greeting: {
    fontSize: '14px',
    color: TEXT_MUTED,
    margin: '0 0 6px',
    fontWeight: 300,
    letterSpacing: '0.04em',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '42px',
    fontWeight: 700,
    margin: '0 0 8px',
    color: TEXT_PRIMARY,
    letterSpacing: '-0.5px',
  },
  date: {
    fontSize: '13px',
    color: TEXT_MUTED,
    margin: 0,
    fontWeight: 300,
  },
  roleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(201,168,76,0.08)',
    border: `1px solid ${BORDER}`,
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '12px',
  },
  roleDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: GOLD,
    display: 'inline-block',
  },
  roleText: {
    color: GOLD,
    fontWeight: 500,
  },
  roleComingSoon: {
    color: TEXT_MUTED,
    fontWeight: 300,
  },
  divider: {
    maxWidth: '1100px',
    margin: '28px auto 36px',
    height: '1px',
    background: `linear-gradient(to right, ${BORDER}, transparent)`,
  },
  grid: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  card: {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    padding: '28px 26px 22px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
  },
  cardLive: {
    borderColor: BORDER,
  },
  cardDimmed: {
    opacity: 0.55,
    cursor: 'default',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardIcon: {
    fontSize: '26px',
  },
  liveBadge: {
    background: 'rgba(52,211,153,0.12)',
    color: '#34d399',
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: '12px',
    letterSpacing: '0.04em',
  },
  soonBadge: {
    background: 'rgba(255,255,255,0.05)',
    color: TEXT_MUTED,
    fontSize: '11px',
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: '12px',
    letterSpacing: '0.04em',
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '20px',
    fontWeight: 600,
    margin: '0 0 10px',
    color: TEXT_PRIMARY,
  },
  cardTitleDimmed: {
    color: TEXT_MUTED,
  },
  cardDesc: {
    fontSize: '13px',
    color: TEXT_MUTED,
    lineHeight: '1.6',
    margin: '0',
    fontWeight: 300,
    flex: 1,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: '20px',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metricNumber: {
    fontSize: '26px',
    fontWeight: 600,
    color: GOLD,
    lineHeight: 1,
    fontFamily: "'Playfair Display', serif",
  },
  metricLabel: {
    fontSize: '11px',
    color: TEXT_MUTED,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  cardButton: {
    background: 'transparent',
    border: `1px solid ${BORDER}`,
    color: GOLD,
    borderRadius: '8px',
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  footerNote: {
    maxWidth: '1100px',
    margin: '48px auto 0',
    fontSize: '12px',
    color: TEXT_MUTED,
    textAlign: 'center',
    fontWeight: 300,
    letterSpacing: '0.03em',
  },
};