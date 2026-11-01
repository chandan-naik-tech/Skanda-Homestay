import { useCallback, useEffect, useState } from 'react';
import { useRouter, scrollToHash } from './lib/router.jsx';
import { useSite } from './content/SiteContext.jsx';
import { useMeta } from './hooks.js';
import { motionEnabled } from './lib/motion.js';
import { useTextAnimations } from './lib/animate.js';
import { Splash, SectionFlash } from './components/Splash.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Gallery from './components/Gallery.jsx';
import Host from './components/Host.jsx';
import Location from './components/Location.jsx';
import Reviews from './components/Reviews.jsx';
import Booking from './components/Booking.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import { NotFound, Privacy, Terms } from './components/Legal.jsx';

function Home() {
  const { content } = useSite();
  const { brand } = content;
  useMeta(`${brand.name} | ${brand.tagline}`, brand.description);
  return (
    <main id="main" tabIndex={-1}>
      <Hero />
      <About />
      <Gallery />
      <Host />
      <Location />
      <Reviews />
      <Booking />
      <Contact />
    </main>
  );
}

export default function App() {
  const { path, hash } = useRouter();
  const { ready } = useSite();
  const [introOver, setIntroOver] = useState(() => !motionEnabled()); // launch screen finished (or animations are off)
  const [introGone, setIntroGone] = useState(() => !motionEnabled());
  const onLeave = useCallback(() => { document.documentElement.classList.remove('splash-on'); setIntroOver(true); }, []);
  const onDone = useCallback(() => setIntroGone(true), []);
  useTextAnimations(introOver);

  // After the first paint, jump to a #section in the address (for example a shared link).
  useEffect(() => {
    if (!ready || !hash) return;
    const t = setTimeout(() => scrollToHash(hash, false), 60);
    return () => clearTimeout(t);
    // Only on first load: later hash changes are handled by the router links.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);


  let page;
  if (path === '/') page = <Home />;
  else if (path === '/privacy') page = <Privacy />;
  else if (path === '/terms') page = <Terms />;
  else page = <NotFound />;

  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); document.getElementById('main')?.scrollIntoView(); }}>Skip to content</a>
      <Navbar />
      {page}
      <Footer />
      {introGone ? null : <Splash onLeave={onLeave} onDone={onDone} />}
      <SectionFlash />
    </>
  );
}
