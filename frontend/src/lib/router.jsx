import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/** A very small History-API router: just what this site needs (a few pages plus in-page anchors). */
const RouterContext = createContext({ path: '/', hash: '', navigate: () => {} });

const read = () => ({ path: window.location.pathname.replace(/\/+$/, '') || '/', hash: window.location.hash });

export function scrollToHash(hash, smooth = true) {
  const id = decodeURIComponent((hash || '').replace(/^#/, ''));
  if (!id) { window.scrollTo({ top: 0, behavior: smooth && !(typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'smooth' : 'auto' }); return; }
  const el = document.getElementById(id);
  const calm = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (el) el.scrollIntoView({ behavior: smooth && !calm ? 'smooth' : 'auto', block: 'start' });
}

export function RouterProvider({ children }) {
  const [loc, setLoc] = useState(read);

  useEffect(() => {
    const onPop = () => { setLoc(read()); window.dispatchEvent(new Event('homestay:nav')); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const url = new URL(to, window.location.origin);
    const moved = url.pathname !== window.location.pathname || url.hash !== window.location.hash;
    const same = url.pathname.replace(/\/+$/, '') === (window.location.pathname.replace(/\/+$/, '') || '/') || (url.pathname === '/' && window.location.pathname === '/');
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url.pathname + url.search + url.hash);
    setLoc(read());
    if (moved) window.dispatchEvent(new Event('homestay:nav')); // the logo flash listens for this
    if (same) {
      // Same page: just scroll to the anchor (or top).
      requestAnimationFrame(() => scrollToHash(url.hash));
    } else {
      requestAnimationFrame(() => (url.hash ? scrollToHash(url.hash, false) : window.scrollTo(0, 0)));
    }
  }, []);

  const value = useMemo(() => ({ ...loc, navigate }), [loc, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);

/** A normal <a href> that navigates without a full page load. */
export function Link({ to, onClick, children, ...rest }) {
  const { navigate } = useRouter();
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handle} {...rest}>{children}</a>;
}
