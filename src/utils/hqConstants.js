// ============================================================
// ALLEZ HQ — Design Token System
// Brand identity locked March 2025
// One edit here flows through every component automatically.
// ============================================================

// --- ACCENT — Allez Emerald ---
// Dark mode default
export const ACCENT        = '#29C47A'; // Emerald — bright, readable on dark surfaces
export const ACCENT_HOVER  = '#33D988'; // Slightly lighter for hover states
export const ACCENT_MUTED  = 'rgba(41, 196, 122, 0.13)';
export const ACCENT_BORDER = 'rgba(41, 196, 122, 0.25)';
// Light mode variants (deeper for contrast on light surfaces)
export const ACCENT_LIGHT        = '#1A9E5F';
export const ACCENT_HOVER_LIGHT  = '#29C47A';
export const ACCENT_MUTED_LIGHT  = 'rgba(26, 158, 95, 0.12)';
export const ACCENT_BORDER_LIGHT = 'rgba(26, 158, 95, 0.22)';

// AI feature color — used for AI processing buttons, result labels, animated dots
export const AI_COLOR        = '#a78bfa';
export const AI_COLOR_MUTED  = 'rgba(139,92,246,0.12)';
export const AI_COLOR_BORDER = 'rgba(139,92,246,0.4)';

// --- SITE ACCENT — Allez Capital Portfolio (allezcapital.com) ---
export const SITE_ACCENT        = '#667eea'; // Purple — portfolio brand colour
export const SITE_ACCENT_HOVER  = '#5a6fd6';
export const SITE_ACCENT_MUTED  = 'rgba(102, 126, 234, 0.10)';
export const SITE_ACCENT_BORDER = 'rgba(102, 126, 234, 0.25)';

// --- SHARED LAYOUT ---
export const MAX_WIDTH = '1200px'; // Consistent page column width across all pages

// --- LIGHT MODE — "Warm White" ---
export const L_BG          = '#FDFAF6'; // Page background
export const L_SURFACE     = '#FFFFFF'; // Cards, modals
export const L_SURFACE_ALT = '#F8F4EE'; // Subtle inset areas, inputs
export const L_BORDER      = '#EDE6DB'; // Dividers, card outlines
export const L_TEXT        = '#1A1410'; // Primary text
export const L_TEXT_MUTED  = '#7A7068'; // Labels, captions
export const L_TEXT_SUBTLE = '#C0B5A8'; // Placeholder, disabled

// --- DARK MODE — "Midnight Blue" ---
export const D_BG          = '#070D1A'; // Page background
export const D_SURFACE     = '#0E1829'; // Cards, modals
export const D_SURFACE_ALT = '#162035'; // Subtle inset areas, inputs
export const D_BORDER      = '#1F3050'; // Dividers, card outlines
export const D_TEXT        = '#E8F0FE'; // Primary text
export const D_TEXT_MUTED  = '#A8C0E8'; // Labels, captions
export const D_TEXT_SUBTLE = '#A8C0E8'; // Same as TEXT_MUTED in dark mode — contrast range too narrow for a third tier

// --- TYPOGRAPHY ---
export const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif"; // Hero, client names, headlines
export const FONT_BODY    = "'DM Sans', 'Segoe UI', sans-serif";    // All UI text, data, labels

// ── Font weights ──────────────────────────────────────────────────────────────
// Use these instead of hardcoding numbers — keeps weight consistent everywhere.
export const FW_LIGHT    = '300'; // muted text, meta, subtitles, large numbers
export const FW_REGULAR  = '400'; // body text, card content, names
export const FW_MEDIUM   = '500'; // tabs, interactive elements
export const FW_SEMIBOLD = '600'; // labels, badges, buttons, column headers

// --- BORDER RADIUS ---
export const RADIUS_SM   = '6px';
export const RADIUS_MD   = '10px';
export const RADIUS_LG   = '14px';
export const RADIUS_PILL = '999px';

// --- SPACING ---
export const SPACE_XS  = '4px';
export const SPACE_SM  = '8px';
export const SPACE_MD  = '16px';
export const SPACE_LG  = '24px';
export const SPACE_XL  = '40px';
export const SPACE_2XL = '64px';

// --- SHADOWS ---
export const SHADOW_SM = '0 1px 3px rgba(0,0,0,0.08)';

// ── Layout ────────────────────────────────────────────────────────────────────
export const TOPBAR_HEIGHT          = 52;   // px — fixed top bar height
export const SIDEBAR_WIDTH          = 154;  // px — desktop sidebar expanded width
export const SIDEBAR_COLLAPSED_WIDTH = 24;  // px — desktop sidebar collapsed width
export const SIDEBAR_BREAKPOINT     = 900;  // px — sidebar collapses to overlay below this
export const MOBILE_BREAKPOINT      = 900;  // px — single source of truth for isMobile
export const SHADOW_MD = '0 4px 16px rgba(0,0,0,0.12)';
export const SHADOW_LG = '0 8px 32px rgba(0,0,0,0.18)';

// --- CLIENT STATUS BADGES ---
export const STATUS_COLORS = {
  Active:   { bg: ACCENT_MUTED,                 color: ACCENT    },
  Prospect: { bg: 'rgba(96,  165, 250, 0.15)',  color: '#60a5fa' },
  Inactive: { bg: 'rgba(251, 191, 36,  0.15)',  color: '#fbbf24' },

};

// --- DROPDOWN / FORM OPTIONS ---
export const STATUS_OPTIONS = ['Prospect', 'Active', 'Inactive'];

export const ASSET_LEVEL_OPTIONS = [
  'Under $100K',
  '$100K – $250K',
  '$250K – $500K',
  '$500K – $1M',
  '$1M – $5M',
  '$5M – $10M',
  '$10M+',
];

// Maps a raw AUM number to the corresponding asset_level bucket.
// Used to keep asset_level in sync whenever AUM is manually entered or API-synced.
export function aumToAssetLevel(aum) {
  if (!aum || isNaN(aum)) return '';
  const n = Number(aum);
  if (n <    100_000) return 'Under $100K';
  if (n <    250_000) return '$100K – $250K';
  if (n <    500_000) return '$250K – $500K';
  if (n <  1_000_000) return '$500K – $1M';
  if (n <  5_000_000) return '$1M – $5M';
  if (n < 10_000_000) return '$5M – $10M';
  return '$10M+';
}

export const CUSTODIAN_OPTIONS = [
  'Schwab',
  'Fidelity',
  'Pershing',
  'TD Ameritrade',
  'Vanguard',
  'Interactive Brokers',
  'Apex Clearing',
  'Other',
];

export const RISK_TOLERANCE_OPTIONS = [
  'Conservative',
  'Moderately Conservative',
  'Moderate',
  'Moderately Aggressive',
  'Aggressive',
];

export const INVESTMENT_OBJECTIVE_OPTIONS = [
  'Growth',
  'Income',
  'Preservation',
  'Balanced',
];

export const TIME_HORIZON_OPTIONS = [
  'Short (0–3yr)',
  'Medium (3–10yr)',
  'Long (10yr+)',
];

export const CONTACT_METHOD_OPTIONS          = ['Email', 'Phone', 'In-person'];
export const COMMUNICATION_FREQUENCY_OPTIONS = ['Monthly', 'Quarterly', 'Annually'];
export const LIQUIDITY_NEEDS_OPTIONS         = ['Low', 'Medium', 'High'];
export const TAX_BRACKET_OPTIONS             = ['10%', '12%', '22%', '24%', '32%', '35%', '37%'];
export const REFERRAL_SOURCE_OPTIONS         = [
  'Existing Client',
  'LinkedIn',
  'Event',
  'Cold Outreach',
  'Website',
  'Other',
];

// ============================================================
// AI NOTE-TAKER
// Prompt template mirrored here for reference and tuning.
// The authoritative copy used at runtime lives in api/process-note.js.
// Update both if you change the prompt.
// ============================================================
export const AI_NOTE_PROMPT_FIELDS = ['title', 'summary', 'decisions', 'action_items', 'follow_ups'];

// ============================================================
// ROLE TIERS
// Single source of truth for role-based access control.
// Update these arrays when adding new roles — changes cascade
// automatically to every page that imports them.
// ============================================================

// Roles that can see ALL clients in the org (not just assigned ones)
// ── Pipeline ──────────────────────────────────────────────────────────────────

export const PIPELINE_STAGES = [
  { key: 'Lead',       label: 'Lead'       },
  { key: 'Proposal',   label: 'Proposal'   },
  { key: 'Agreement',  label: 'Agreement'  },
  { key: 'Onboarding', label: 'Onboarding' },
  { key: 'Active',     label: 'Active'     },
];

export const PIPELINE_STAGE_COLORS = {
  Lead:       { bg: 'rgba(96,165,250,0.12)',   color: '#60a5fa' },
  Proposal:   { bg: 'rgba(167,139,250,0.12)',  color: '#a78bfa' },
  Agreement:  { bg: 'rgba(251,191,36,0.12)',   color: '#fbbf24' },
  Onboarding: { bg: 'rgba(52,211,153,0.12)',   color: '#34d399' },
  Active:     { bg: 'rgba(46,139,110,0.12)',    color: '#2E8B6E' },
};

// ── Role tiers ────────────────────────────────────────────────────────────────

export const FULL_ACCESS_ROLES = ['admin', 'manager', 'compliance'];

// Roles that can write — create notes, tasks, edit client data
// compliance is excluded (read-only)
export const WRITE_ROLES = ['admin', 'manager', 'advisor', 'associate'];

// Roles that can manage the org — invite members, assign/remove advisors, set primary
export const ORG_ADMIN_ROLES = ['admin'];

// ============================================================
// BACKWARD-COMPATIBLE ALIASES
// These map old token names to the new brand system so that
// Clients.js, ClientDetail.js, Notes.js, and Team.js continue
// to compile without changes. Migrate pages to D_* names over
// time and remove these aliases once all pages are updated.
// ============================================================
export const GOLD         = ACCENT;
export const GREEN        = ACCENT;
export const DARK         = D_BG;
export const CARD_BG      = D_SURFACE;
export const BORDER       = D_BORDER;
export const TEXT_PRIMARY = D_TEXT;
export const TEXT_MUTED   = D_TEXT_MUTED;
export const INPUT_BG     = D_SURFACE_ALT;
export const PAGE_PADDING = '48px 40px 80px';
export const PAGE_FONT    = FONT_BODY;


// ── Standard page layout styles ───────────────────────────────────────────────
// Use in every page: const s = { ...pageStyles(t, isMobile), myCustomStyle: {...} }
// This ensures consistent padding, typography, and structure across all pages.

export function pageStyles(t, isMobile) {
  return {
    pageWrapper: {
      background:  t.BG,
      minHeight:   '100vh',
      width:       '100%',
    },
    page: {
      maxWidth:    '1200px',
      margin:      '0 auto',
      padding:     isMobile ? '28px 16px 60px' : '40px 40px 80px',
      fontFamily:  FONT_BODY,
      color:       t.TEXT,
    },
    header: {
      display:         'flex',
      justifyContent:  'space-between',
      alignItems:      'flex-start',
      marginBottom:    '32px',
    },
    title: {
      fontFamily:     FONT_DISPLAY,
      fontSize:       isMobile ? '32px' : '44px',
      fontWeight:     '300',
      color:          t.TEXT,
      margin:         '0 0 6px',
      letterSpacing:  '0.01em',
      lineHeight:     1.1,
    },
    subtitle: {
      fontSize:    '13px',
      color:       t.TEXT_MUTED,
      margin:      0,
      fontWeight:  '300',
    },
  };
}