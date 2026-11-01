import { useEffect, useRef, useState } from 'react';
import { useSite } from '../content/SiteContext.jsx';
import LogoMark from './LogoMark.jsx';

const SHOW_MS = 2500; // the logo animation plays for this long, then the screen fades away
const FADE_MS = 700;

/** Launch screen: the logo draws itself, the name appears, then the page is revealed. Click or press a key to skip. */
export function Splash({ onLeave, onDone }) {
  const { content } = useSite();
  const { name, tagline } = content.brand;
  const [leaving, setLeaving] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    const leave = () => {
      setLeaving((was) => {
        if (!was) {
          onLeave?.();
          timers.current.push(setTimeout(() => onDone?.(), FADE_MS));
        }
        return true;
      });
    };
    timers.current.push(setTimeout(leave, SHOW_MS));
    const skip = (e) => { if (e.type === 'keydown' && e.key === 'Tab') return; leave(); };
    window.addEventListener('keydown', skip);
    return () => { window.removeEventListener('keydown', skip); timers.current.forEach(clearTimeout); timers.current = []; };
  }, [onLeave, onDone]);

  const skipByClick = () => {
    if (leaving) return;
    setLeaving(true); onLeave?.();
    timers.current.push(setTimeout(() => onDone?.(), FADE_MS));
  };

  return (
    <div className={`splash ${leaving ? 'is-leaving' : ''}`} aria-hidden="true" onClick={skipByClick}>
      <div className="splash__inner">
        <div className="splash__markwrap">
          <span className="splash__ring" />
          <span className="splash__ring splash__ring--2" />
          <LogoMark animated size={132} />
        </div>
        <div className="splash__name">
          {[...String(name || '')].map((ch, i) => <span key={i} style={{ '--i': i }}>{ch === ' ' ? ' ' : ch}</span>)}
        </div>
        {tagline ? <div className="splash__tag">{tagline}</div> : null}
      </div>
    </div>
  );
}

/** For one second after a visitor moves to another section or page, the logo appears over the page and fades out. */
export function SectionFlash() {
  const { content } = useSite();
  const [key, setKey] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    const show = () => {
      if (document.documentElement.classList.contains('splash-on')) return; // the launch screen is still showing
      setKey((k) => k + 1);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setKey(0), 1000);
    };
    window.addEventListener('homestay:nav', show);
    return () => { window.removeEventListener('homestay:nav', show); clearTimeout(timer.current); };
  }, []);

  if (!key) return null;
  return (
    <div className="flash" key={key} aria-hidden="true">
      <div className="flash__card">
        <LogoMark animated size={92} />
        <span className="flash__name">{content.brand.name}</span>
      </div>
    </div>
  );
}
