import { LuClock, LuMail, LuMapPin, LuMessageCircle, LuPhone } from 'react-icons/lu';
import { useSite, Fill } from '../content/SiteContext.jsx';
import { filled, isSampleImage } from '../lib/merge.js';
import { Reveal, SectionHead } from './ui.jsx';
import { ContactAction, useContactLinks } from './Host.jsx';

function Detail({ icon: Icon, label, children }) {
  return (
    <li className="detail">
      <span className="detail__icon"><Icon aria-hidden="true" /></span>
      <div><h4>{label}</h4><p>{children}</p></div>
    </li>
  );
}

export default function Contact() {
  const { content, showPlaceholders } = useSite();
  const { contact, location, brand, owner } = content;
  const links = useContactLinks();
  const ownerPhoto = filled(owner.photo) && (!isSampleImage(owner.photo) || showPlaceholders) ? owner.photo : '';

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="wrap">
        <SectionHead id="contact-title" title="Get in touch" lede="Questions about the stay, the area or your dates? Reach the host directly and he will gladly help." />

        <div className="contact__grid">
          <Reveal as="ul" className="details">
            {filled(owner.name) || ownerPhoto ? (
              <li className="detail detail--owner">
                {ownerPhoto ? <img className="detail__photo" src={ownerPhoto} alt={filled(owner.name) ? `Portrait of ${owner.name}` : 'Portrait of the host'} width="72" height="72" loading="lazy" decoding="async" /> : null}
                <div><h4>Your host</h4><p>{filled(owner.name) ? owner.name : null}</p></div>
              </li>
            ) : null}
            {filled(contact.phone) || showPlaceholders ? (
              <Detail icon={LuPhone} label="Phone">
                <Fill value={contact.phone} label="your phone number">{links.tel ? <a href={links.tel}>{contact.phone}</a> : contact.phone}</Fill>
              </Detail>
            ) : null}
            {filled(contact.whatsapp) || showPlaceholders ? (
              <Detail icon={LuMessageCircle} label="WhatsApp">
                <Fill value={contact.whatsapp} label="your WhatsApp number">
                  {links.wa ? <a href={links.waUrl(`Hello! I'd like to know more about ${brand.name}.`)} target="_blank" rel="noopener noreferrer">{contact.whatsapp}</a> : contact.whatsapp}
                </Fill>
              </Detail>
            ) : null}
            {filled(contact.email) || showPlaceholders ? (
              <Detail icon={LuMail} label="Email">
                <Fill value={contact.email} label="your email address">{links.mail ? <a href={links.mail}>{contact.email}</a> : contact.email}</Fill>
              </Detail>
            ) : null}
            {filled(location.general) || showPlaceholders ? (
              <Detail icon={LuMapPin} label="Location"><Fill value={location.general} label="the general location" /></Detail>
            ) : null}
            {filled(contact.hours) || showPlaceholders ? (
              <Detail icon={LuClock} label="Preferred contact hours"><Fill value={contact.hours} label="your preferred contact hours" /></Detail>
            ) : null}
          </Reveal>

          <Reveal className="card contact__card" delay={100}>
            <div className="direct">
              <h3>Contact the host directly</h3>
              <p>Call, message or email {filled(owner.name) ? owner.name : 'the host'} with any question about the stay, the area or your dates.</p>
              <div className="host__actions">
                <ContactAction href={links.tel} icon={LuPhone} label="Call the Owner" hint="Add your phone number to switch this on" />
                <ContactAction href={links.wa ? links.waUrl(`Hello! I'd like to know more about ${brand.name}.`) : null} icon={LuMessageCircle} label="Chat on WhatsApp" hint="Add your WhatsApp number to switch this on" variant="secondary" external />
                <ContactAction href={links.mail} icon={LuMail} label="Send an Email" hint="Add your email address to switch this on" variant="secondary" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
