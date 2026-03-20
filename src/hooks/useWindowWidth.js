// src/hooks/useWindowWidth.js
// Single source of truth for responsive breakpoint detection.
// Reads devMobileOverride from OrgContext — returns 375 when active
// so every page's isMobile check works without any page-level changes.

import { useState, useEffect, useContext } from 'react';
import { OrgContext } from '../context/OrgContext';
import { MOBILE_BREAKPOINT } from '../utils/hqConstants';

export default function useWindowWidth() {
  const { devMobileOverride } = useContext(OrgContext) || {};
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Return a value below MOBILE_BREAKPOINT when mobile is simulated
  return devMobileOverride ? MOBILE_BREAKPOINT - 1 : width;
}