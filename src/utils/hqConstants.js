// HQ design tokens — shared across all HQ sub-pages
export const GOLD = '#c9a84c';
export const GREEN = '#51da83';
export const DARK = '#0f1117';
export const CARD_BG = '#1e2330';
export const BORDER = 'rgba(201,168,76,0.18)';
export const TEXT_PRIMARY = '#f0ece0';
export const TEXT_MUTED = '#7a7d8a';
export const INPUT_BG = '#2a3347';

// Client status badge colours
export const STATUS_COLORS = {
  Active:   { bg: 'rgba(81,218,131,0.15)',  color: '#51da83' },
  Prospect: { bg: 'rgba(96,165,250,0.15)',  color: '#60a5fa' },
  Inactive: { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  Former:   { bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
};

// Client form options — used in any form or filter that references client fields
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

export const STATUS_OPTIONS = ['Prospect', 'Active', 'Inactive', 'Former'];

export const CONTACT_METHOD_OPTIONS = ['Email', 'Phone', 'In-person'];

export const COMMUNICATION_FREQUENCY_OPTIONS = ['Monthly', 'Quarterly', 'Annually'];

export const LIQUIDITY_NEEDS_OPTIONS = ['Low', 'Medium', 'High'];

export const TAX_BRACKET_OPTIONS = ['10%', '12%', '22%', '24%', '32%', '35%', '37%'];

export const REFERRAL_SOURCE_OPTIONS = [
  'Existing Client',
  'LinkedIn',
  'Event',
  'Cold Outreach',
  'Website',
  'Other',
];