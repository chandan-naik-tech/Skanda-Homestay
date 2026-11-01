import { LuBus, LuMapPin, LuNavigation, LuPlaneLanding, LuTrainFront, LuUtensils } from 'react-icons/lu';
import { useSite, Fill } from '../content/SiteContext.jsx';
import { filled } from '../lib/merge.js';
import { httpsUrl, mapEmbedUrl } from '../lib/url.js';
import { Reveal, SectionHead } from './ui.jsx';
import DriveCard from './DriveCard.jsx';

function Transport({ icon: Icon, label, value, hint }) {
  const { showPlaceholders } = useSite();
  if (!filled(value) && !showPlaceholders) return null;
  return (
    <li className="transport">
      <span className="transport__icon"><Icon aria-hidden="true" /></span>
      <div>
        <h4>{label}</h4>
        <p><Fill value={value} label={hint} /></p>
      </div>
    </li>
  );
}

export default function Location() {
  const { content, showPlaceholders } = useSite();
  const { location, brand } = content;
  const embed = mapEmbedUrl(location.mapEmbedUrl);
  const directions = httpsUrl(location.directionsUrl);
  const drive = (location.driveTimes || []).filter((d) => filled(d.place) && filled(d.time));
  const attractions = (location.attractions || []).filter((a) => filled(a.name));
  const showMap = !!embed || !!directions || showPlaceholders; // no empty map box on the public site
  const hasTransport = [location.station, location.busStand, location.airport, location.restaurants].some(filled);

  return (
    <section id="location" className="section section--tint" aria-labelledby="location-title">
      <div className="wrap">
        <SectionHead
          id="location-title"
          title="Where you will be staying"
          lede={<Fill value={location.general} label="the general location of the stay" />}
        />

        <div className={`location__grid ${showMap ? '' : 'location__grid--nomap'}`}>
          {showMap ? <Reveal className="location__map">
            {embed ? (
              <iframe
                title={`Map showing the location of ${brand.name}`}
                src={embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="map-empty">
                <LuMapPin aria-hidden="true" />
                <p>{showPlaceholders ? 'Add your map location in defaultContent.js (Google Maps > Share > Embed a map) to show an interactive map here.' : 'The map will appear here soon. Please ask the host for directions.'}</p>
              </div>
            )}
            {directions ? (
              <a className="btn btn--primary location__directions" href={directions} target="_blank" rel="noopener noreferrer">
                <LuNavigation aria-hidden="true" />Get Directions
              </a>
            ) : showPlaceholders ? (
              <button type="button" className="btn btn--primary location__directions" disabled title="Add a Google Maps link in defaultContent.js to switch this on">
                <LuNavigation aria-hidden="true" />Get Directions
              </button>
            ) : null}
          </Reveal> : null}

          <div className="location__info">
            {drive.length ? <Reveal delay={80}><DriveCard drive={drive} className="trip--wide" /></Reveal> : null}

            {attractions.length || showPlaceholders ? (
              <Reveal className="attractions" delay={140}>
                <h3>Nearby attractions</h3>
                {attractions.length ? (
                  <ul>
                    {attractions.map((a) => (
                      <li key={a.name}>
                        <strong>{a.name}</strong>
                        {filled(a.distance) ? <span className="attractions__dist">{a.distance}</span> : null}
                        {filled(a.note) ? <p>{a.note}</p> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p><span className="todo">Add nearby attractions</span></p>
                )}
              </Reveal>
            ) : null}
          </div>
        </div>

        {hasTransport || showPlaceholders ? (
          <Reveal as="ul" className="transports" delay={100}>
            <Transport icon={LuTrainFront} label="Nearest railway station" value={location.station} hint="the nearest railway station and distance" />
            <Transport icon={LuBus} label="Nearest bus stand" value={location.busStand} hint="the nearest bus stand and distance" />
            <Transport icon={LuPlaneLanding} label="Nearest airport" value={location.airport} hint="the nearest airport and distance" />
            <Transport icon={LuUtensils} label="Restaurants and shops nearby" value={location.restaurants} hint="nearby restaurants and shops" />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
