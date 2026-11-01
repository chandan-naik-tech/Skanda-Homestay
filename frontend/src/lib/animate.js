/**
 * Text animations: every heading, paragraph and list item glides in the first time it scrolls into view.
 * Elements are tagged with data-anim (hidden start state, set in CSS) and get data-in when they enter the screen.
 * Content is never hidden if JavaScript is off or the visitor prefers reduced motion (nothing is tagged then).
 */
import { useEffect } from 'react';
import { motionEnabled } from './motion.js';

const SELECTOR = [
  'main h1', 'main h2', 'main h3', 'main h4', 'main p', 'main li', 'main dt', 'main dd', 'main blockquote', 'main figcaption', 'main address', 'main .eyebrow',
  'footer h3', 'footer h4', 'footer p', 'footer li',
].join(',');
// These already have their own entrance animation, or must not move.
const SKIP = '.hero__title, .hero__sub, .hero__actions, .hero__facts, .hero__art, .lightbox, .owner-pop, .splash, .flash, .nav, [data-no-anim], .hp, .todo';

/** Section titles: each word rises out of a hidden line, one after another. Only done for plain-text titles that never change. */
function splitWords(el) {
  if (el.hasAttribute('data-split') || el.childNodes.length !== 1 || el.firstChild.nodeType !== 3) return false;
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((w, i) => {
    if (i) el.appendChild(document.createTextNode(' '));
    const outer = document.createElement('span'); outer.className = 'w';
    const inner = document.createElement('span'); inner.textContent = w; inner.style.setProperty('--wi', String(i));
    outer.appendChild(inner); el.appendChild(outer);
  });
  el.setAttribute('data-split', '');
  return true;
}

function kindOf(el) {
  const t = el.tagName;
  if (el.hasAttribute('data-split')) return 'split';
  if (t === 'H1' || t === 'H2') return 'head';
  if (t === 'H3' || t === 'H4') return 'pop';
  if (t === 'LI' || t === 'DT') return 'slide';
  return 'up';
}

/** `ready` becomes true when the launch screen starts to leave; text before that is prepared but not yet shown. */
export function useTextAnimations(ready) {
  useEffect(() => {
    if (!motionEnabled()) return undefined;
    const seen = new WeakSet();
    let raf = 0;

    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left));
      visible.forEach((e, i) => {
        e.target.style.setProperty('--ad', `${Math.min(i * 90, 540)}ms`); // a short stagger when several appear together
        e.target.setAttribute('data-in', '');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px', threshold: 0.1 });

    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.closest(SKIP)) return;
        if (el.parentElement && el.parentElement.closest('[data-anim]')) return; // a parent already animates, do not double up
        if (!el.hasAttribute('data-anim')) {
          if (el.matches('.section-head h2')) splitWords(el);
          el.setAttribute('data-anim', kindOf(el));
        }
        if (!ready || el.hasAttribute('data-in') || seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { cancelAnimationFrame(raf); io.disconnect(); mo.disconnect(); };
  }, [ready]);
}
