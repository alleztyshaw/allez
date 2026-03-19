// src/hooks/useWindowWidth.js
// Single source of truth for responsive breakpoint detection.
// Import this instead of defining useWindowWidth locally in each page.

import { useState, useEffect } from 'react';

export default function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}