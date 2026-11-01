import { LuGlobe, LuMail, LuMapPin, LuMessageCircle, LuPhone, LuQuote, LuUser } from 'react-icons/lu';
import { useSite, Fill } from '../content/SiteContext.jsx';
import { filled, isSampleImage } from '../lib/merge.js';
import { mailUrl, normalizeWhatsAppNumber, telUrl, whatsAppUrl } from '../lib/whatsapp.js';
import { Reveal, SampleBadge } from './ui.jsx';

/** Contact action that is a real link when configured, and a disabled button (setup mode) or nothing (launch mode) otherwise. */
export function ContactAction({ href, icon: Icon, label, hint, variant = 'primary', external = false }) {
  const { showPlaceholders } = useSite();
  if (href) {
    return (
      <a className={`btn btn--${variant}`} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        <Icon aria-hidden="true" />{label}
      </a>
    );
  }
  if (!showPlaceholders) return null;
  return (
    <button type="button" className={`btn btn--${variant}`} disabled title={hint}>
      <Icon aria-hidden="true" />{label}
    </button>
  );
}

/** The message that is already typed when a visitor opens the email link. The visitor can edit it before sending. */
export function defaultEmailMessage({ brand, owner }) {
  const to = filled(owner?.name) ? owner.name.trim() : 'there';
  return [
    `Hello ${to},`,
    '',
    `I found ${brand.name} on your website and would like to know more about the stay.`,
    '',
    'My name:',
    'Preferred dates:',
    'Number of guests:',
    'My question:',
    '',
    'Thank you.',
  ].join('\n');
}

export function useContactLinks() {
  const { content } = useSite();
  const c = content.contact;
  const wa = normalizeWhatsAppNumber(c.whatsapp, c.defaultCountryCode);
  return {
    wa,
    waUrl: (msg) => whatsAppUrl(wa, msg),
    tel: telUrl(c.phone, c.defaultCountryCode),
    mail: mailUrl(c.email, `Enquiry about ${content.brand.name}`, defaultEmailMessage(content)),
  };
}

export default function Host() {
  const { content, showPlaceholders } = useSite();
  const { owner, contact, brand } = content;
  const links = useContactLinks();
  const welcome = (owner.welcome || '').split(/\n{2,}/).map((t) => t.trim()).filter(Boolean);
  const anyContact = links.wa || links.tel || links.mail;

  return (
    <section id="host" className="section host" aria-labelledby="host-title">
      <div className="wrap host__grid">
        <Reveal className="host__portrait">
          <div className="host__arch">
            <img src={owner.photo} alt={filled(owner.name) ? `Portrait of ${owner.name}, the host` : 'Portrait of the host'} width="1000" height="1250" loading="lazy" decoding="async" />
            {isSampleImage(owner.photo) ? <SampleBadge>Placeholder portrait: add your photo</SampleBadge> : null}
          </div>
        </Reveal>

        <Reveal className="host__card" delay={100}>
          <h2 id="host-title">Meet Your Host</h2>
          <p className="host__name"><Fill value={owner.name} label="your full name" /></p>
          <p className="host__intro"><Fill value={owner.intro} label="a short introduction about yourself" /></p>

          <dl className="host__facts">
            <div><dt><LuMapPin aria-hidden="true" />From</dt><dd><Fill value={owner.hometown} label="your hometown" /></dd></div>
            <div><dt><LuGlobe aria-hidden="true" />Speaks</dt><dd><Fill value={owner.languages} label="languages you speak" /></dd></div>
            {filled(owner.background) || showPlaceholders ? (
              <div><dt><LuUser aria-hidden="true" />Background</dt><dd><Fill value={owner.background} label="your background (optional)" /></dd></div>
            ) : null}
            {filled(contact.phone) ? <div><dt><LuPhone aria-hidden="true" />Phone</dt><dd>{links.tel ? <a href={links.tel}>{contact.phone}</a> : contact.phone}</dd></div> : null}
            {filled(contact.whatsapp) ? <div><dt><LuMessageCircle aria-hidden="true" />WhatsApp</dt><dd>{links.wa ? <a href={links.waUrl(`Hello! I'd like to know more about ${brand.name}.`)} target="_blank" rel="noopener noreferrer">{contact.whatsapp}</a> : contact.whatsapp}</dd></div> : null}
            {filled(contact.email) ? <div><dt><LuMail aria-hidden="true" />Email</dt><dd>{links.mail ? <a href={links.mail}>{contact.email}</a> : contact.email}</dd></div> : null}
          </dl>

          {filled(owner.philosophy) ? (
            <figure className="host__philosophy">
              <LuQuote aria-hidden="true" />
              <blockquote>{owner.philosophy}</blockquote>
              <figcaption>How I host</figcaption>
            </figure>
          ) : null}

          {welcome.length ? (
            <div className="host__welcome">
              {welcome.map((t) => <p key={t}>{t}</p>)}
              {showPlaceholders ? <p className="draft-note">Sample welcome message. Edit it so it sounds like you.</p> : null}
            </div>
          ) : null}

          <div className="host__actions">
            <ContactAction href={links.wa ? links.waUrl(`Hello! I'd like to know more about ${brand.name}.`) : null} icon={LuMessageCircle} label="Chat on WhatsApp" hint="Add your WhatsApp number to switch this on" external />
            <ContactAction href={links.tel} icon={LuPhone} label="Call the Owner" hint="Add your phone number to switch this on" variant="secondary" />
            <ContactAction href={links.mail} icon={LuMail} label="Send an Email" hint="Add your email address to switch this on" variant="secondary" />
          </div>
          {!anyContact && showPlaceholders ? <p className="draft-note">These buttons switch on as soon as you add your phone, WhatsApp and email.</p> : null}
        </Reveal>
      </div>
    </section>
  );
}
