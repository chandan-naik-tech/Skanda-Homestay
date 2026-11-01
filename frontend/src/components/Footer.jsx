import { LuFacebook, LuInstagram, LuMail, LuMapPin, LuMessageCircle, LuPhone, LuYoutube } from 'react-icons/lu';
import { Link } from '../lib/router.jsx';
import { useSite } from '../content/SiteContext.jsx';
import { filled } from '../lib/merge.js';
import { httpsUrl } from '../lib/url.js';
import { Logo } from './ui.jsx';
import { NAV_ITEMS } from './Navbar.jsx';
import { useContactLinks } from './Host.jsx';

export default function Footer() {
  const { content } = useSite();
  const { brand, contact, location } = content;
  const links = useContactLinks();
  const social = [
    ['Instagram', httpsUrl(contact.instagram), LuInstagram],
    ['Facebook', httpsUrl(contact.facebook), LuFacebook],
    ['YouTube', httpsUrl(contact.youtube), LuYoutube],
  ].filter(([, url]) => url);

  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <Link to="/#home" aria-label={`${brand.name}, back to top`}><Logo inverse /></Link>
          {filled(brand.description) ? <p>{brand.description}</p> : null}
          {social.length ? (
            <ul className="social" aria-label="Social media">
              {social.map(([label, url, Icon]) => (
                <li key={label}><a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${brand.name} on ${label}`}><Icon aria-hidden="true" /></a></li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Footer">
          <h2 className="footer__h">Explore</h2>
          <ul>
            {NAV_ITEMS.map((item) => <li key={item.id}><Link to={`/#${item.id}`}>{item.label}</Link></li>)}
            <li><Link to="/#book">Check Availability</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="footer__h">Contact</h2>
          <ul className="footer__contact">
            {links.tel ? <li><LuPhone aria-hidden="true" /><a href={links.tel}>{contact.phone}</a></li> : null}
            {links.wa ? <li><LuMessageCircle aria-hidden="true" /><a href={links.waUrl(`Hello! I'd like to know more about ${brand.name}.`)} target="_blank" rel="noopener noreferrer">WhatsApp</a></li> : null}
            {links.mail ? <li><LuMail aria-hidden="true" /><a href={links.mail}>{contact.email}</a></li> : null}
            {filled(location.general) ? <li><LuMapPin aria-hidden="true" /><span>{location.general}</span></li> : null}
            {!links.tel && !links.wa && !links.mail && !filled(location.general) ? <li><span>Details coming soon.</span></li> : null}
          </ul>
        </div>
      </div>

      <div className="wrap footer__legal">
        <p>&copy; {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
        <ul>
          <li><Link to="/privacy">Privacy policy</Link></li>
          <li><Link to="/terms">Terms and conditions</Link></li>
        </ul>
      </div>
    </footer>
  );
}
