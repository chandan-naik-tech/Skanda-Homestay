/** Animations are on unless the owner switches them off (settings.animations: false) or the visitor asked their device for less motion. */
import { defaultContent } from '../content/defaultContent.js';

export function motionEnabled() {
  if (defaultContent.settings && defaultContent.settings.animations === false) return false;
  try {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  } catch { /* ignore */ }
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}
