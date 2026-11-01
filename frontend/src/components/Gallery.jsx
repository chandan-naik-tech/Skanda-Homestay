import { useMemo, useRef, useState } from 'react';
import { useSite } from '../content/SiteContext.jsx';
import { filled, isSampleImage } from '../lib/merge.js';
import { Reveal, SampleBadge, SectionHead } from './ui.jsx';
import Lightbox from './Lightbox.jsx';

export const GALLERY_CATEGORIES = ['Bedroom', 'Kitchen', 'Bathroom', 'Exterior', 'Nearby'];

export default function Gallery() {
  const { content } = useSite();
  const items = (content.gallery || []).filter((g) => filled(g.src));
  const [category, setCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(null);
  const opener = useRef(null);

  const categories = useMemo(() => {
    const present = new Set(items.map((g) => g.category).filter(Boolean));
    const ordered = [...GALLERY_CATEGORIES.filter((c) => present.has(c)), ...[...present].filter((c) => !GALLERY_CATEGORIES.includes(c))];
    return ordered;
  }, [items]);

  if (!items.length) return null;
  // "All" is the house itself. Photos of places nearby appear only under their own "Nearby" button.
  const houseItems = items.filter((g) => g.category !== 'Nearby');
  const shown = category === 'All' ? (houseItems.length ? houseItems : items) : items.filter((g) => g.category === category);
  const hasSamples = items.some((g) => isSampleImage(g.src));
  const hasReal = items.some((g) => !isSampleImage(g.src));

  const close = () => {
    setOpenIndex(null);
    requestAnimationFrame(() => opener.current?.focus?.());
  };

  return (
    <section id="gallery" className="section" aria-labelledby="gallery-title">
      <div className="wrap">
        <SectionHead
          id="gallery-title"
          title="Take a look around"
          lede={hasSamples ? (hasReal ? 'Pictures marked "Sample" are placeholder illustrations. Real photographs of the stay will replace them. Tap any picture to see it full screen.' : 'The pictures below are sample illustrations. Real photographs of the stay will replace them.') : 'Tap a photo to see it full screen.'}
        />
        {categories.length > 1 ? (
          <div className="chips" role="group" aria-label="Filter photos by room">
            {['All', ...categories].map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        ) : null}

        <Reveal as="ul" className="masonry">
          {shown.map((g, i) => (
            <li key={g.id}>
              <button
                type="button"
                className="shot"
                aria-label={`Open photo: ${g.alt || g.category}`}
                onClick={(e) => { opener.current = e.currentTarget; setOpenIndex(i); }}
              >
                <img src={g.thumb || g.src} alt={g.alt || g.category} width={g.width || undefined} height={g.height || undefined} loading="lazy" decoding="async" />
                {g.category && category === 'All' ? <span className="shot__label">{g.category}</span> : null}
                {isSampleImage(g.src) ? <SampleBadge>Sample</SampleBadge> : null}
              </button>
            </li>
          ))}
        </Reveal>
      </div>
      {openIndex !== null ? <Lightbox items={shown} index={openIndex} onClose={close} onIndex={setOpenIndex} /> : null}
    </section>
  );
}
