// src/utils/publicConstants.js
// Self-contained constants for all public-facing pages.
// Intentionally independent of hqConstants — no cross-imports —
// so public pages can move to a separate project cleanly.

// ── Typography ───────────────────────────────────────────────────────────────

export const FONT_DISPLAY = "'Cormorant Garamond', Georgia, serif";
export const FONT_BODY    = "'DM Sans', system-ui, sans-serif";

export const FW_LIGHT    = 300;
export const FW_REGULAR  = 400;
export const FW_MEDIUM   = 500;
export const FW_SEMIBOLD = 600;

export const MOBILE_BREAKPOINT = 768;

// ── Base colors ──────────────────────────────────────────────────────────────

export const PUB_BG          = '#f8f8f5';
export const PUB_TEXT        = '#1a1a1a';
export const PUB_TEXT_MUTED  = 'rgba(26,26,26,0.55)';
export const PUB_TEXT_SUBTLE = 'rgba(26,26,26,0.35)';
export const PUB_ACCENT      = '#6366f1';  // indigo — primary brand accent

// ── Body text opacity variants ───────────────────────────────────────────────

export const PUB_BODY_MUTED  = 'rgba(26,26,26,0.65)';  // standard body copy
export const PUB_BODY_SUBTLE = 'rgba(26,26,26,0.45)';  // secondary / eyebrow text

// ── Surfaces & borders ───────────────────────────────────────────────────────

export const PUB_CARD_BG    = 'rgba(255,255,255,0.6)';
export const PUB_BORDER     = 'rgba(0,0,0,0.08)';
export const PUB_DIVIDER    = 'rgba(0,0,0,0.07)';

// ── CTA gradient ─────────────────────────────────────────────────────────────

export const PUB_GRADIENT = 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)';

// ── Mesh orb gradients ───────────────────────────────────────────────────────

export const PUB_MESH_INDIGO = 'radial-gradient(circle, rgba(99,102,241,0.30) 0%, rgba(99,102,241,0.10) 50%, transparent 70%)';
export const PUB_MESH_TEAL   = 'radial-gradient(circle, rgba(20,184,166,0.25) 0%, rgba(20,184,166,0.08) 50%, transparent 70%)';

// Home page uses a richer multi-orb mesh
export const PUB_MESH_HOME_INDIGO = 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(99,102,241,0.20) 50%, transparent 70%)';
export const PUB_MESH_HOME_PINK   = 'radial-gradient(circle, rgba(236,72,153,0.50) 0%, rgba(236,72,153,0.18) 50%, transparent 70%)';
export const PUB_MESH_HOME_TEAL   = 'radial-gradient(circle, rgba(20,184,166,0.48) 0%, rgba(20,184,166,0.16) 50%, transparent 70%)';
export const PUB_MESH_HOME_AMBER  = 'radial-gradient(circle, rgba(251,146,60,0.45) 0%, rgba(251,146,60,0.15) 70%)';

// ── Tier colors ───────────────────────────────────────────────────────────────

export const PUB_TIER_STARTER = '#29C47A';  // emerald — matches app success color
export const PUB_TIER_PRO     = '#6366f1';  // indigo  — matches PUB_ACCENT

export const PUB_SECTION_ACCESS   = '#6366f1';  // indigo  — Access
export const PUB_SECTION_NOTES    = '#a78bfa';  // purple  — AI Note-taker
export const PUB_SECTION_CRM      = '#14b8a6';  // teal    — CRM
export const PUB_SECTION_PLATFORM = '#fbbf24';  // amber   — Platform

// ── App mockup UI colors (used in ProductPage mockup components) ──────────────
// These simulate the app's design system inside the product page visualizations.

export const PUB_APP_ACCENT        = '#6366f1';
export const PUB_APP_ACCENT_MUTED  = 'rgba(99,102,241,0.10)';
export const PUB_APP_ACCENT_BORDER = 'rgba(99,102,241,0.25)';
export const PUB_COLOR_ERROR       = '#f87171';
export const PUB_COLOR_WARNING     = '#fbbf24';
export const PUB_COLOR_INFO        = '#60a5fa';

// ── HomePage-specific surface tokens ─────────────────────────────────────────

export const PUB_SCROLL_SECTION_BG  = 'rgba(248,248,245,0.35)';
export const PUB_CARD_BG_LG         = 'rgba(255,255,255,0.28)'; // value cards
export const PUB_CARD_BORDER_LG     = 'rgba(255,255,255,0.48)'; // value card borders
export const PUB_CARD_BG_SM         = 'rgba(255,255,255,0.22)'; // trust cards
export const PUB_CARD_BORDER_SM     = 'rgba(255,255,255,0.40)'; // trust card borders

// ── Shared keyframe CSS string ────────────────────────────────────────────────
// Import and drop into a <style> tag on any public page.

export const PUB_FONTS_AND_KEYFRAMES = `
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
`;