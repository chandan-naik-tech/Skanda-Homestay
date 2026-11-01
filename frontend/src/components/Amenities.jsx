import { LuPlus } from 'react-icons/lu';
import { useSite } from '../content/SiteContext.jsx';
import { filled } from '../lib/merge.js';
import { AmenityIcon } from '../lib/icons.jsx';
import { Reveal, SectionHead } from './ui.jsx';

/** One amenity tile. Reusable: pass { icon, title, text }. */
export function AmenityCard({ icon, title, text }) {
  return (
    <li className="amenity">
      <span className="amenity__icon"><AmenityIcon name={icon} /></span>
      <h3>{title}</h3>
      {filled(text) ? <p>{text}</p> : null}
    </li>
  );
}

export default function Amenities() {
  const { content, showPlaceholders } = useSite();
  const all = content.amenities || [];
  const confirmed = all.filter((a) => a.enabled && filled(a.title));
  const unconfirmed = all.filter((a) => !a.enabled).length;
  if (!confirmed.length && !showPlaceholders) return null;

  return (
    <section id="amenities" className="section section--tint" aria-labelledby="amenities-title">
      <div className="wrap">
        <SectionHead id="amenities-title" title="Everything you can count on" lede="Only what is genuinely available at the stay is listed here." />
        <Reveal as="ul" className="amenities">
          {confirmed.map((a) => <AmenityCard key={a.id} icon={a.icon} title={a.title} text={a.text} />)}
          {showPlaceholders ? (
            <li className="amenity amenity--todo">
              <span className="amenity__icon"><LuPlus aria-hidden="true" /></span>
              <h3>Add confirmed amenities</h3>
              <p>{unconfirmed ? `${unconfirmed} more are ready to switch on` : 'Add your own'} in defaultContent.js. Only amenities you confirm are shown to visitors.</p>
            </li>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
