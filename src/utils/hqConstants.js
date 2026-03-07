// ============================================================
// ALLEZ HQ — Design Token System
// Brand identity locked March 2025
// One edit here flows through every component automatically.
// ============================================================

// --- ACCENT — Allez Vert ---
export const ACCENT        = '#1DB954'; // Neon emerald — same as Spotify
export const ACCENT_HOVER  = '#24E066'; // Slightly brighter for hover states
export const ACCENT_MUTED  = 'rgba(29, 185, 84, 0.13)';
export const ACCENT_BORDER = 'rgba(29, 185, 84, 0.25)';

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
export const D_TEXT_SUBTLE = '#2E4A72'; // Placeholder, disabled

// --- TYPOGRAPHY ---
export const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif"; // Hero, client names, headlines
export const FONT_BODY    = "'DM Sans', 'Segoe UI', sans-serif";    // All UI text, data, labels

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