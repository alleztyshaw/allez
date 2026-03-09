import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  FONT_BODY,
  FONT_DISPLAY,
  RADIUS_LG,
  RADIUS_MD,
  RADIUS_PILL,
  SHADOW_MD,
  pageStyles,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import { useOrg } from '../context/OrgContext';

const features = [
  { id: 'clients',    title: 'Clients',     description: 'Manage your client roster, financial profiles, risk tolerances, and relationship details.', status: 'live',        route: '/hq/clients', metricQuery: 'clients', metricLabel: 'Total Clients' },
  { id: 'notes',      title: 'Notes',    description: 'Record and transcribe meetings. Extract action items, securities mentions, and compliance flags automatically.', status: 'live', route: '/hq/notes', metricQuery: 'notes', metricLabel: 'Total Notes' },
  { id: 'crm',        title: 'CRM',         description: 'Track client interactions, touchpoints, and communication history across your entire practice.', status: 'live', route: '/hq/crm' },
  { id: 'onboarding', title: 'Onboarding',  description: 'Monitor new client onboarding progress, step completion, and outstanding tasks.', status: 'soon', route: null },
];


function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function HQ() {
  const navigate = useNavigate();
  const t = useTokens();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  const { orgId } = useOrg();
  const [metrics, setMetrics] = useState({});
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    if (!orgId) return;
    async function fetchMetrics() {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: clients }, { data: notes }, { data: orgData }, { data: membersData }] = await Promise.all([
        supabase.from('clients').select('id').eq('org_id', orgId).is('deleted_at', null),
        supabase.from('notes').select('id').eq('org_id', orgId),
        supabase.from('organizations').select('name').eq('org_id', orgId).single(),
        supabase.rpc('get_org_members', { target_org_id: orgId }),
      ]);
      setMetrics({ clients: clients?.length ?? 0, notes: notes?.length ?? 0 });
      setOrgName(orgData?.name || '');
      const me = (membersData || []).find(m => m.user_id === user?.id);
      setUserRole(me?.role || '');
      setMetricsLoading(false);
    }
    fetchMetrics();
  }, [orgId]);

  const s = {
    ...pageStyles(t, isMobile),
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' },
    date: { fontSize: '13px', color: t.TEXT_SUBTLE, fontWeight: 300, letterSpacing: '0.03em' },
    roleBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_PILL, padding: '6px 14px', marginBottom: '4px' },
    roleDot: { width: '6px', height: '6px', borderRadius: '50%', background: t.ACCENT, display: 'inline-block', flexShrink: 0 },
    roleText: { fontSize: '12px', fontWeight: 600, color: t.TEXT, letterSpacing: '0.04em' },
    divider: { height: '1px', background: t.BORDER, marginBottom: '36px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '48px' },
    card: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '220px', boxShadow: SHADOW_MD },
    cardDimmed: { background: t.SURFACE_ALT, opacity: 0.6 },
    cardTop: { marginBottom: '16px' },
    liveBadge: { fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.ACCENT, background: t.ACCENT_MUTED, border: `1px solid ${t.ACCENT_BORDER}`, padding: '3px 10px', borderRadius: RADIUS_PILL },
    soonBadge: { fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.TEXT_MUTED, background: t.SURFACE_ALT, padding: '3px 10px', borderRadius: RADIUS_PILL },
    cardTitle: { fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: 400, color: t.TEXT, margin: '0 0 10px', letterSpacing: '0.01em', lineHeight: 1.2 },
    cardDesc: { fontSize: '13px', color: t.TEXT_MUTED, lineHeight: 1.65, fontWeight: 300, flex: 1, margin: '0 0 20px' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' },
    metric: { display: 'flex', flexDirection: 'column', gap: '2px' },
    metricNumber: { fontFamily: FONT_BODY, fontSize: '24px', fontWeight: 300, color: t.ACCENT, lineHeight: 1 },
    metricLabel: { fontSize: '10px', color: t.TEXT_MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 },
    openBtn: { background: 'transparent', border: `1px solid ${t.BORDER}`, color: t.ACCENT, borderRadius: RADIUS_MD, padding: '7px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: FONT_BODY },
  };

  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .hq-card { animation: fadeUp 0.4s ease both; }
          .hq-card-live { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; cursor: pointer; }
          .hq-card-live:hover { border-color: ${t.ACCENT_BORDER} !important; transform: translateY(-2px); box-shadow: 0 8px 32px ${t.ACCENT_MUTED} !important; }
          .hq-open-btn:hover { background: ${t.ACCENT} !important; color: #fff !important; }
        `}</style>

        <div style={s.header}>
          <div />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            {orgName && <p style={s.date}>{orgName}</p>}
            <p style={s.date}>{formatDate(new Date())}</p>
            {userRole && (
              <div style={s.roleBadge}>
                <span style={s.roleDot} />
                <span style={s.roleText}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div style={s.divider} />

        <div style={s.grid}>
          {features.map((feature, i) => {
            const isLive = feature.status === 'live';
            const metric = feature.metricQuery ? metrics[feature.metricQuery] : null;
            return (
              <div
                key={feature.id}
                className={`hq-card ${isLive ? 'hq-card-live' : ''}`}
                style={{ ...s.card, ...(isLive ? {} : s.cardDimmed), animationDelay: `${i * 80}ms` }}
                onClick={() => isLive && navigate(feature.route)}
              >
                <div style={s.cardTop}>
                  {!isLive && <span style={s.soonBadge}>Coming Soon</span>}
                </div>
                <h2 style={{ ...s.cardTitle, ...(!isLive ? { color: t.TEXT_MUTED } : {}) }}>
                  {feature.title}
                </h2>
                <p style={s.cardDesc}>{feature.description}</p>
                <div style={s.cardFooter}>
                  {isLive && !metricsLoading && metric !== null ? (
                    <div style={s.metric}>
                      <span style={s.metricNumber}>{metric}</span>
                      <span style={s.metricLabel}>{feature.metricLabel}</span>
                    </div>
                  ) : <div />}
                  {isLive && (
                    <button className="hq-open-btn" style={s.openBtn} onClick={(e) => { e.stopPropagation(); navigate(feature.route); }}>
                      Open →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}