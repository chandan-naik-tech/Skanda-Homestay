import { LuBedDouble, LuHouse, LuMapPin, LuUsers } from 'react-icons/lu';
import { Link } from '../lib/router.jsx';
import { useSite, Fill } from '../content/SiteContext.jsx';
import { filled, isSampleImage } from '../lib/merge.js';
import { SampleBadge } from './ui.jsx';
import DriveCard from './DriveCard.jsx';

export default function Hero() {
  const { content } = useSite();
  const { hero, property, location, brand, booking } = content;
  const headline = hero.headline || brand.tagline;
  const lines = hero.lines || (headline.includes('–')
    ? [`${headline.split(/\s*–\s*/)[0]} –`, headline.split(/\s*–\s*/).slice(1).join(' – ')]
    : (headline.includes(',') ? [`${headline.split(/,\s*/)[0]},`, headline.split(/,\s*/).slice(1).join(', ')] : [headline]));
  const drive = (location.driveTimes || []).filter((d) => filled(d.place) && filled(d.time));

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            {lines.map((l, i) => (
              <span className="hero__line" key={l}><span style={{ '--i': i }}>{l}</span></span>
            ))}
          </h1>
          <p className="hero__sub">{hero.subtext}</p>
          <div className="hero__actions">
            <Link to="/#about" className="btn btn--primary btn--lg">Explore the Stay</Link>
            <Link to="/#book" className="btn btn--secondary btn--lg">{booking?.cta || 'Contact for Reservations'}</Link>
          </div>
        <DriveCard drive={drive} />
        </div>

        <figure className="hero__art">
          <span className="hero__sun" aria-hidden="true" />
          <div className="hero__arch">
            <img src={hero.image} alt={hero.imageAlt} width="1000" height="1250" fetchPriority="high" decoding="async" />
            {isSampleImage(hero.image) ? <SampleBadge /> : null}
          </div>
        </figure>

        <dl className="hero__facts" aria-label="The stay at a glance">
          <div>
            <LuHouse aria-hidden="true" />
            <dt>Accommodation</dt>
            <dd>{property.accommodation || 'Comfortable 1BHK Stay'}</dd>
          </div>
          <div>
            <LuUsers aria-hidden="true" />
            <dt>Target visitors</dt>
            <dd>
              {filled(property.guestsLabel)
                ? property.guestsLabel
                : <Fill value={property.maxGuests} label="guest count">{`Up to ${property.maxGuests} guests`}</Fill>}
            </dd>
          </div>
          <div>
            <LuBedDouble aria-hidden="true" />
            <dt>Bedrooms</dt>
            <dd><Fill value={property.bedrooms} label="bedrooms" /></dd>
          </div>
          <div>
            <LuMapPin aria-hidden="true" />
            <dt>Location</dt>
            <dd><Fill value={location.general} label="location" /></dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
