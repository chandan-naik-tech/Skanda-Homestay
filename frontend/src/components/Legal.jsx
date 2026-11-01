import { useSite } from '../content/SiteContext.jsx';
import { filled } from '../lib/merge.js';
import { formatMoney } from '../lib/format.js';
import { Link } from '../lib/router.jsx';
import { useMeta } from '../hooks.js';

function Page({ title, children }) {
  const { content, showPlaceholders } = useSite();
  useMeta(`${title} | ${content.brand.name}`, `${title} for ${content.brand.name}.`);
  return (
    <main id="main" className="legal wrap" tabIndex={-1}>
      <p className="legal__back"><Link to="/">&larr; Back to the homestay</Link></p>
      <h1>{title}</h1>
      {showPlaceholders ? (
        <p className="draft-note">
          This is a plain-language template that follows how this website actually works. It is not legal advice. Please read it,
          adjust it to your situation, and have it checked locally before you go live. This note is only visible while setup mode is on.
        </p>
      ) : null}
      {children}
    </main>
  );
}

export function Privacy() {
  const { content } = useSite();
  const { brand, contact, owner } = content;
  const who = filled(owner.name) ? `${owner.name}, the host of ${brand.name}` : `the host of ${brand.name}`;
  return (
    <Page title="Privacy policy">
      <p>This page explains what happens to the details you give us on this website. We keep it short and simple.</p>

      <h2>What we collect</h2>
      <p>This website has no accounts and keeps no database of visitors. If you use the <strong>Check availability</strong> form, the details you type (your name, phone number, email address, dates, number of guests and any message) are sent by email to the host through this website&apos;s own email system (or, as a backup, the form-to-email service FormSubmit). You can also simply call, WhatsApp or email the host yourself.</p>

      <h2>Why we collect it</h2>
      <p>When you contact the host, your details are used only to reply to you, to check availability, and to look after your stay if the host confirms it. They are not used for advertising and are not sold or shared.</p>

      <h2>Who sees what you send</h2>
      <p>An enquiry form submission, call, WhatsApp message or email reaches {who} directly. The host keeps it for as long as needed to deal with your enquiry or stay, and deletes it when it is no longer needed.</p>

      <h2>Other services</h2>
      <ul>
        <li>The enquiry form sends your details by email to the host. The website does not store them. Only if its own email system is unavailable are they passed to FormSubmit (formsubmit.co), whose privacy policy then applies to that step. If sending fails, you are offered a ready-filled email or WhatsApp message instead.</li>
        <li>If you tap the WhatsApp button, WhatsApp opens with your message ready. Nothing is sent until you press send, and WhatsApp&apos;s own privacy policy applies from there.</li>
        <li>Fonts are loaded from Google Fonts, and the map (when shown) is provided by Google Maps or OpenStreetMap. These services may receive your device&apos;s IP address when the page loads.</li>
        <li>This website does not use advertising or tracking cookies.</li>
      </ul>

      <h2>Your choices</h2>
      <p>You can ask to see, correct or delete the details you sent us at any time{filled(contact.email) ? <> by writing to <a href={`mailto:${contact.email}`}>{contact.email}</a></> : ' by contacting the host'}.</p>
    </Page>
  );
}

export function Terms() {
  const { content } = useSite();
  const { brand, property, pricing } = content;
  const rules = (property.houseRules || []).filter((r) => filled(r.text));
  const currency = pricing.currency || '₹';
  return (
    <Page title="Terms and conditions">
      <p>These terms apply to stays at {brand.name}. By contacting the host about a stay you confirm that you have read them.</p>

      <h2>Enquiries and bookings</h2>
      <ul>
        <li>Contacting the host through this website (the enquiry form, a call, WhatsApp or email) is a request to check availability. It is <strong>not a confirmed booking</strong>.</li>
        <li>A stay is confirmed only when the host replies and says the dates are available and agreed.</li>
        {filled(pricing.pricePerNight) ? <li>The nightly rate shown is {formatMoney(pricing.pricePerNight, currency)}. The host confirms the final amount before you stay.</li> : <li>The host will tell you the rate and any other charges before the stay is confirmed.</li>}
      </ul>

      {rules.length ? (
        <>
          <h2>House rules</h2>
          <ul>{rules.map((r) => <li key={r.text}>{r.text}</li>)}</ul>
          <p>The host may ask guests who do not follow the house rules to leave.</p>
        </>
      ) : null}

      <h2>Cancellations</h2>
      <p>{filled(pricing.cancellationPolicy) ? pricing.cancellationPolicy : 'Please talk to the host about cancellations when your stay is confirmed.'}</p>

      <h2>Care of the property</h2>
      <p>Please treat the home with care. Guests are responsible for damage beyond normal wear and tear during their stay.</p>

      <h2>Photographs and information</h2>
      <p>We try to keep everything on this website accurate. Distances and drive times are approximate and can vary with traffic and weather.</p>
    </Page>
  );
}

export function NotFound() {
  const { content } = useSite();
  useMeta(`Page not found | ${content.brand.name}`);
  return (
    <main id="main" className="legal wrap" tabIndex={-1}>
      <h1>We couldn&apos;t find that page</h1>
      <p>The link may be old or mistyped.</p>
      <p><Link to="/" className="btn btn--primary">Go to the homepage</Link></p>
    </main>
  );
}
