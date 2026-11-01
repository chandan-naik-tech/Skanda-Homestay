import { useEffect, useRef } from 'react';
import { LuChevronLeft, LuChevronRight, LuX } from 'react-icons/lu';
import { useLockBodyScroll } from '../hooks.js';
import { isSampleImage } from '../lib/merge.js';
import { SampleBadge } from './ui.jsx';

/** Full-screen photo viewer: arrow keys, Esc, swipe, and a keyboard focus trap. */
export default function Lightbox({ items, index, onClose, onIndex }) {
  const root = useRef(null);
  const closeBtn = useRef(null);
  const touchStart = useRef(null);
  const item = items[index];
  const count = items.length;

  useLockBodyScroll(true);

  const go = (delta) => onIndex((index + delta + count) % count);

  useEffect(() => {
    closeBtn.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'Tab') {
        const focusable = root.current?.querySelectorAll('button:not([disabled])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // Preload the neighbours so next/previous feel instant.
  useEffect(() => {
    [1, -1].forEach((d) => { const n = items[(index + d + count) % count]; if (n) { const img = new Image(); img.src = n.src; } });
  }, [index, items, count]);

  if (!item) return null;

  return (
    <div
      className="lightbox"
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        touchStart.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button ref={closeBtn} type="button" className="lightbox__btn lightbox__close" onClick={onClose} aria-label="Close photo viewer"><LuX aria-hidden="true" /></button>
      {count > 1 ? (
        <>
          <button type="button" className="lightbox__btn lightbox__prev" onClick={() => go(-1)} aria-label="Previous photo"><LuChevronLeft aria-hidden="true" /></button>
          <button type="button" className="lightbox__btn lightbox__next" onClick={() => go(1)} aria-label="Next photo"><LuChevronRight aria-hidden="true" /></button>
        </>
      ) : null}
      <figure className="lightbox__figure">
        <img key={item.src} src={item.src} alt={item.alt || item.category || 'Photo of the stay'} />
        <figcaption>
          <span>{item.alt || item.category}</span>
          <span className="lightbox__count" aria-hidden="true">{index + 1} / {count}</span>
          {isSampleImage(item.src) ? <SampleBadge /> : null}
        </figcaption>
      </figure>
    </div>
  );
}
