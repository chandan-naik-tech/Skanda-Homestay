import { LuQuote, LuStar } from 'react-icons/lu';
import { Link } from '../lib/router.jsx';
import { useSite } from '../content/SiteContext.jsx';
import { filled } from '../lib/merge.js';
import { initials } from '../lib/format.js';
import { Reveal, SectionHead } from './ui.jsx';

/** One genuine guest review. Pass { name, text, rating?, stay? }. */
export function ReviewCard({ name, text, rating, stay }) {
  return (
    <li className="review">
      <LuQuote className="review__quote" aria-hidden="true" />
      {rating ? (
        <p className="review__stars" role="img" aria-label={`${rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((n) => <LuStar key={n} className={n <= rating ? 'is-on' : ''} aria-hidden="true" />)}
        </p>
      ) : null}
      <blockquote>{text}</blockquote>
      <footer>
        <span className="review__avatar" aria-hidden="true">{initials(name)}</span>
        <span>
          <strong>{name}</strong>
          {filled(stay) ? <small>{stay}</small> : null}
        </span>
      </footer>
    </li>
  );
}

export default function Reviews() {
  const { content } = useSite();
  const reviews = (content.reviews || []).filter((r) => filled(r.name) && filled(r.text));

  return (
    <section id="reviews" className="section" aria-labelledby="reviews-title">
      <div className="wrap">
        <SectionHead id="reviews-title" title="Kind words from guests" />
        {reviews.length ? (
          <Reveal as="ul" className="reviews">
            {reviews.map((r) => <ReviewCard key={r.id || r.name} {...r} />)}
          </Reveal>
        ) : (
          <Reveal className="reviews-empty">
            <LuQuote aria-hidden="true" />
            <p>Every great stay begins with a warm welcome. Be among our first guests.</p>
            <Link to="/#book" className="btn btn--primary">{content.booking?.cta || 'Contact for Reservations'}</Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
