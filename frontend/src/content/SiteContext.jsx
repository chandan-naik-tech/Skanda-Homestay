import { createContext, useContext, useMemo } from 'react';
import { defaultContent } from './defaultContent.js';

const SiteContext = createContext(null);

/** All the website's text and photos come from defaultContent.js. There is no server and no dashboard. */
export function SiteProvider({ children }) {
  const value = useMemo(() => ({
    content: defaultContent,
    ready: true,
    showPlaceholders: !!defaultContent.settings.showPlaceholders,
  }), []);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);

/** Shows `children` (or the value) when filled; otherwise a dashed "Add ..." marker in setup mode, or nothing. */
export function Fill({ value, label, children, className = '' }) {
  const { showPlaceholders } = useSite();
  if (filled(value)) return <>{children ?? value}</>;
  if (!showPlaceholders) return null;
  return <span className={`todo ${className}`} title="Not added yet. Add this in defaultContent.js">Add {label}</span>;
}

import { filled } from '../lib/merge.js';
