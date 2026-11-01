import { Link } from '../lib/router.jsx';
import { useSite, Fill } from '../content/SiteContext.jsx';
import { filled, isSampleImage } from '../lib/merge.js';
import { RuleIcon } from '../lib/icons.jsx';
import { Reveal, SampleBadge } from './ui.jsx';

function Photo({ src, alt, w, h, className }) {
  return (
    <div className={className}>
      <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      {isSampleImage(src) ? <SampleBadge /> : null}
    </div>
  );
}

export default function About() {
  const { content } = useSite();
  const { about, property: p, location } = content;
  const rules = (p.houseRules || []).filter((r) => filled(r.text));

  const details = [
    ['Bedrooms', p.bedrooms, 'bedrooms'],
    ['Living area', p.livingArea, 'living area details'],
    ['Kitchen', p.kitchen, 'kitchen details'],
    ['Bathroom', p.bathroom, 'bathroom details'],
    filled(p.guestsLabel) ? ['Guests', p.guestsLabel, 'guests'] : ['Maximum guests', filled(p.maxGuests) ? `${p.maxGuests} guests` : '', 'maximum guests'],
    ['Parking', p.parking, 'parking details'],
    ['Wi-Fi', p.wifi, 'Wi-Fi details'],
    ['Location', location.general, 'location'],
  ];

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap about__grid">
        <Reveal className="about__copy">
          <h2 id="about-title">{about.heading}</h2>
          <p className="lede lede--large">{p.lead}</p>
          {p.closing ? <p>{p.closing}</p> : null}
          <Link to="/#gallery" className="btn btn--primary">Discover the Stay</Link>
        </Reveal>

        <Reveal className="about__photos" delay={120}>
          <Photo className="about__photo about__photo--a" src={about.imageA} alt={about.imageAAlt || 'Bedroom of the homestay'} w="1200" h="900" />
          <Photo className="about__photo about__photo--b" src={about.imageB} alt={about.imageBAlt || 'Bathroom of the homestay'} w="900" h="1200" />
        </Reveal>
      </div>

      <div className="wrap about__lower">
        <Reveal className="rules" aria-labelledby="rules-title">
          <h3 id="rules-title">Good to know before you book</h3>
          <ul>
            {rules.map((r) => (
              <li key={r.text}><RuleIcon name={r.icon} /><span>{r.text}</span></li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="facts" delay={100}>
          <h3>The stay at a glance</h3>
          <dl>
            {details.map(([label, value, ph]) => {
              if (!filled(value) && !content.settings.showPlaceholders) return null;
              return (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd><Fill value={value} label={ph} /></dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
