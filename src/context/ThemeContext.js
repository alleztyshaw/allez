import { createContext, useContext, useState, useEffect } from 'react';
import {
  D_BG, D_SURFACE, D_SURFACE_ALT, D_BORDER,
  D_TEXT, D_TEXT_MUTED, D_TEXT_SUBTLE,
  L_BG, L_SURFACE, L_SURFACE_ALT, L_BORDER,
  L_TEXT, L_TEXT_MUTED, L_TEXT_SUBTLE,
  ACCENT,        ACCENT_HOVER,        ACCENT_MUTED,        ACCENT_BORDER,
  ACCENT_LIGHT,  ACCENT_HOVER_LIGHT,  ACCENT_MUTED_LIGHT,  ACCENT_BORDER_LIGHT,
} from '../utils/hqConstants';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('allez-theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('allez-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// useTheme — for the toggle button in the nav
export function useTheme() {
  return useContext(ThemeContext);
}

// useTokens — returns theme-aware colour tokens.
// Pages still import non-colour tokens (FONT_*, RADIUS_*, etc.) directly from hqConstants.
export function useTokens() {
  const { theme } = useContext(ThemeContext);
  const dark = theme === 'dark';

  return {
    BG:          dark ? D_BG          : L_BG,
    SURFACE:     dark ? D_SURFACE     : L_SURFACE,
    SURFACE_ALT: dark ? D_SURFACE_ALT : L_SURFACE_ALT,
    BORDER:      dark ? D_BORDER      : L_BORDER,
    TEXT:        dark ? D_TEXT        : L_TEXT,
    TEXT_MUTED:  dark ? D_TEXT_MUTED  : L_TEXT_MUTED,
    TEXT_SUBTLE: dark ? D_TEXT_SUBTLE : L_TEXT_SUBTLE,
    ACCENT:        dark ? ACCENT        : ACCENT_LIGHT,
    ACCENT_HOVER:  dark ? ACCENT_HOVER  : ACCENT_HOVER_LIGHT,
    ACCENT_MUTED:  dark ? ACCENT_MUTED  : ACCENT_MUTED_LIGHT,
    ACCENT_BORDER: dark ? ACCENT_BORDER : ACCENT_BORDER_LIGHT,
    theme,
    isDark: dark,
  };
}