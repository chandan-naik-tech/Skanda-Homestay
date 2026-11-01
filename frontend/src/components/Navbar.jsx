import { useEffect, useState } from 'react';
import { LuMenu, LuX } from 'react-icons/lu';
import { Link, useRouter } from '../lib/router.jsx';
import { useSite } from '../content/SiteContext.jsx';
import { useActiveSection } from '../hooks.js';
import { Logo } from './ui.jsx';
import OwnerChip from './OwnerChip.jsx';

export const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About the Stay' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'host', label: 'Meet the Owner' },
  { id: 'contact', label: 'Contact' },
];
const IDS = NAV_ITEMS.map((n) => n.id);

export default function Navbar() {
  const { path } = useRouter();
  const { content } = useSite();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(IDS);
  const onHome = path === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => { setOpen(false); }, [path]);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="wrap nav__bar">
        <Link to="/#home" className="nav__brand" aria-label={`${content.brand.name}, back to top`} onClick={close}>
          <Logo />
        </Link>

        <nav className="nav__links" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} to={`/#${item.id}`} className={`nav__link ${onHome && active === item.id ? 'is-active' : ''}`} aria-current={onHome && active === item.id ? 'location' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/#book" className="btn btn--primary btn--sm nav__cta" onClick={close}>Check Availability</Link>

        <OwnerChip />

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <LuX aria-hidden="true" /> : <LuMenu aria-hidden="true" />}
        </button>
      </div>

      <div id="mobile-menu" className="nav__panel" inert={!open}>
        <nav className="wrap nav__panel-inner" aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} to={`/#${item.id}`} className="nav__mlink" tabIndex={open ? 0 : -1} onClick={close}>{item.label}</Link>
          ))}
          <Link to="/#book" className="btn btn--primary" tabIndex={open ? 0 : -1} onClick={close}>Check Availability</Link>
        </nav>
      </div>
    </header>
  );
}
