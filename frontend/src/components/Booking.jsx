import { useEffect, useRef, useState } from 'react';
import { LuCircleAlert, LuCircleCheck, LuMail, LuMessageCircle, LuSend } from 'react-icons/lu';
import { useSite } from '../content/SiteContext.jsx';
import { filled } from '../lib/merge.js';
import { formatMoney } from '../lib/format.js';
import { addDays, isoToday, nightsBetween, validateEnquiry } from '../lib/validate.js';
import { enquiryEndpoint, enquiryGmailUrl, enquiryMailtoUrl, enquiryText, sendEnquiry } from '../lib/enquiry.js';
import { normalizeWhatsAppNumber, whatsAppUrl } from '../lib/whatsapp.js';
import { FormField, Reveal, SectionHead, Spinner } from './ui.jsx';

const EMPTY = { checkIn: '', checkOut: '', adults: '2', children: '0', name: '', phone: '', email: '', requirements: '', acceptsRules: false, website: '' };

export default function Booking() {
  const { content, showPlaceholders } = useSite();
  const { brand, property, pricing, contact } = content;
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const [failure, setFailure] = useState('');
  const [failureDetails, setFailureDetails] = useState([]);
  const doneRef = useRef(null);
  const today = isoToday();

  const endpoint = enquiryEndpoint(contact);
  const hostEmail = filled(contact.email) ? contact.email.trim() : '';
  const wa = normalizeWhatsAppNumber(contact.whatsapp, contact.defaultCountryCode);
  const canSend = !!endpoint;

  useEffect(() => { if (status === 'sent' || status === 'failed') doneRef.current?.focus(); }, [status]);

  // Nothing to send an enquiry to: hide the whole section from visitors (a reminder shows while setting up).
  if (!canSend && !wa && !showPlaceholders) return null;

  const set = (name) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((cur) => {
      const next = { ...cur, [name]: v };
      // keep the check-out after the check-in
      if (name === 'checkIn' && v && next.checkOut && next.checkOut <= v) next.checkOut = '';
      return next;
    });
    if (errors[name]) setErrors((cur) => ({ ...cur, [name]: undefined }));
  };
  const common = (name) => ({
    id: `enq-${name}`,
    name,
    value: values[name],
    onChange: set(name),
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `enq-${name}-error` : undefined,
  });

  const maxGuests = Number(property.maxGuests) || null;
  const nights = nightsBetween(values.checkIn, values.checkOut);

  async function submit(e) {
    e.preventDefault();
    if (status === 'sending') return;
    const found = validateEnquiry({ ...values, rooms: 1 }, { maxGuests, maxRooms: 1, today });
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`enq-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    if (values.website) { setStatus('sent'); return; } // hidden spam-trap field was filled: pretend it worked, send nothing
    setStatus('sending');
    const result = await sendEnquiry(values, brand.name, endpoint);
    if (result.ok) { setStatus('sent'); return; }
    setFailure(result.reason);
    setFailureDetails(Array.isArray(result.details) ? result.details : []);
    setStatus('failed');
  }

  const resetForm = () => { setValues(EMPTY); setErrors({}); setStatus('idle'); setFailure(''); setFailureDetails([]); };
  const waLink = wa ? whatsAppUrl(wa, enquiryText(values, brand.name)) : null;
  const mailLink = hostEmail ? enquiryMailtoUrl(values, brand.name, hostEmail) : null;
  const gmailLink = hostEmail ? enquiryGmailUrl(values, brand.name, hostEmail) : null;

  return (
    <section id="book" className="section section--tint" aria-labelledby="book-title">
      <div className="wrap">
        <SectionHead
          id="book-title"
          title="Check availability"
          lede="Tell us your dates and a few details. Your enquiry goes straight to the host, who will reply to you. This is an enquiry, not a confirmed booking."
        />

        <div className="booking__grid">
          <Reveal className="card">
            {status === 'sent' ? (
              <div className="sent" role="status">
                <LuCircleCheck className="sent__icon" aria-hidden="true" />
                <h3 ref={doneRef} tabIndex={-1}>Your enquiry has been sent to the host</h3>
                <p>Thank you, {values.name.trim().split(/\s+/)[0] || 'friend'}. The host will reply to you on <strong>{values.phone.trim()}</strong> or at <strong>{values.email.trim()}</strong>.</p>
                <p><strong>This is not a confirmed booking yet.</strong> Your stay is confirmed only when the host replies and agrees the dates with you.</p>
                <div className="sent__actions">
                  {waLink ? <a className="btn btn--secondary" href={waLink} target="_blank" rel="noopener noreferrer"><LuMessageCircle aria-hidden="true" />Also message on WhatsApp</a> : null}
                  <button type="button" className="btn btn--ghost" onClick={resetForm}>Send another enquiry</button>
                </div>
                {waLink ? <p className="sent__note">Want a quicker answer? Tap WhatsApp: your details are already typed, you only press send.</p> : null}
              </div>
            ) : status === 'failed' ? (
              <div className="sent" role="alert">
                <LuCircleAlert className="sent__icon" style={{ color: 'var(--bad)' }} aria-hidden="true" />
                <h3 ref={doneRef} tabIndex={-1}>We could not send it from here</h3>
                <p>{failure === 'network' ? 'The connection did not go through.' : 'The enquiry could not be delivered automatically.'} Your details are safe. Please send them to the host in one tap instead:</p>
                <div className="sent__actions">
                  {gmailLink ? <a className="btn btn--primary" href={gmailLink} target="_blank" rel="noopener noreferrer"><LuMail aria-hidden="true" />Send with Gmail</a> : null}
                  {mailLink ? <a className="btn btn--secondary" href={mailLink}><LuMail aria-hidden="true" />Open in mail app</a> : null}
                  {waLink ? <a className="btn btn--secondary" href={waLink} target="_blank" rel="noopener noreferrer"><LuMessageCircle aria-hidden="true" />Send on WhatsApp</a> : null}
                  <button type="button" className="btn btn--ghost" onClick={() => { setStatus('idle'); setFailure(''); }}>Try again</button>
                </div>
                <p className="sent__note">Gmail opens in a new tab, addressed to the host, with your enquiry already written. You only press Send. WhatsApp works the same way.</p>
                {failureDetails.length ? (
                  <details className="sent__tech">
                    <summary>Details for the host</summary>
                    <ul>{failureDetails.map((d) => <li key={d}>{d}</li>)}</ul>
                  </details>
                ) : null}
              </div>
            ) : !canSend ? (
              <div className="direct">
                <h3>Enquiry form</h3>
                <p><span className="todo">Add your email address in defaultContent.js (contact.email) to switch the enquiry form on</span></p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate aria-label="Availability enquiry">
                <fieldset>
                  <legend>Your stay</legend>
                  <div className="grid2">
                    <FormField id="enq-checkIn" label="Check-in date" required error={errors.checkIn}>
                      <input type="date" {...common('checkIn')} min={today} />
                    </FormField>
                    <FormField id="enq-checkOut" label="Check-out date" required error={errors.checkOut}>
                      <input type="date" {...common('checkOut')} min={values.checkIn ? addDays(values.checkIn, 1) : addDays(today, 1)} />
                    </FormField>
                  </div>
                  <div className="grid2">
                    <FormField id="enq-adults" label="Adults" required error={errors.adults} hint={maxGuests ? `Up to ${maxGuests} guests in total` : undefined}>
                      <input type="number" inputMode="numeric" min="1" max="20" {...common('adults')} />
                    </FormField>
                    <FormField id="enq-children" label="Children" error={errors.children}>
                      <input type="number" inputMode="numeric" min="0" max="20" {...common('children')} />
                    </FormField>
                  </div>
                  <p className="field__hint">You are enquiring for the entire 1BHK (1 room).{nights > 0 ? ` ${nights} night${nights === 1 ? '' : 's'} selected.` : ''}</p>
                </fieldset>

                <fieldset>
                  <legend>Your details</legend>
                  <FormField id="enq-name" label="Full name" required error={errors.name}>
                    <input type="text" autoComplete="name" maxLength={120} {...common('name')} />
                  </FormField>
                  <div className="grid2">
                    <FormField id="enq-phone" label="Phone number" required error={errors.phone} hint="So the host can call or WhatsApp you">
                      <input type="tel" autoComplete="tel" placeholder="+91 98765 43210" maxLength={30} {...common('phone')} />
                    </FormField>
                    <FormField id="enq-email" label="Email address" required error={errors.email}>
                      <input type="email" autoComplete="email" maxLength={160} {...common('email')} />
                    </FormField>
                  </div>
                  <FormField id="enq-requirements" label="Special requirements" error={errors.requirements} hint="For example: arrival time, a baby cot, questions about the area">
                    <textarea maxLength={1000} {...common('requirements')} />
                  </FormField>
                  <div className="hp" aria-hidden="true">
                    <label htmlFor="enq-website">Leave this empty</label>
                    <input type="text" id="enq-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
                  </div>
                </fieldset>

                <div className={`check ${errors.acceptsRules ? 'check--error' : ''}`}>
                  <input type="checkbox" id="enq-acceptsRules" name="acceptsRules" checked={values.acceptsRules} onChange={set('acceptsRules')} aria-invalid={errors.acceptsRules ? 'true' : undefined} aria-describedby={errors.acceptsRules ? 'enq-acceptsRules-error' : undefined} />
                  <label htmlFor="enq-acceptsRules">We are a family and we accept the house rules (no pets, smoking, alcohol or parties).</label>
                </div>
                {errors.acceptsRules ? <p className="field__error" id="enq-acceptsRules-error" role="alert">{errors.acceptsRules}</p> : null}

                <button type="submit" className="btn btn--primary btn--lg booking__submit" disabled={status === 'sending'}>
                  {status === 'sending' ? <><Spinner label="Sending" />Sending your enquiry...</> : <><LuSend aria-hidden="true" />Send enquiry to the host</>}
                </button>
                <p className="field__hint">Your details are emailed to the host so he can reply. They are not shown anywhere on this website.</p>
              </form>
            )}
          </Reveal>

          <Reveal className="booking__aside" delay={100}>
            <div className="card steps">
              <h3>How it works</h3>
              <ol>
                <li><span>1</span>Choose your dates and tell us who is coming.</li>
                <li><span>2</span>Your enquiry is emailed to the host at once.</li>
                <li><span>3</span>The host replies and confirms if the dates are free.</li>
              </ol>
            </div>
            {filled(pricing.pricePerNight) ? (
              <div className="card rates">
                <h3>Rate</h3>
                <p className="rates__price"><strong>{formatMoney(pricing.pricePerNight, pricing.currency || '₹')}</strong> per night</p>
                <p className="field__hint">The host confirms the final amount before your stay.</p>
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
