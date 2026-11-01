/**
 * Sending a "Check availability" enquiry straight to the host's email, with no server of our own.
 *
 * The browser posts the details to a form-to-email service (FormSubmit.co by default). The service emails them to the
 * host. If the service cannot be reached, the visitor is offered a ready-filled email in their own mail app instead,
 * so an enquiry is never silently lost.
 */
import { httpsUrl } from './url.js';
import { gmailUrl, longDate, mailUrl } from './whatsapp.js';
import { nightsBetween } from './validate.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Where enquiries are posted: the owner's own https:// form address if given, otherwise FormSubmit for the host's email. */
export function enquiryEndpoint(contact = {}) {
  const custom = httpsUrl(contact.formEndpoint);
  if (custom) return custom;
  const email = typeof contact.email === 'string' ? contact.email.trim() : '';
  return EMAIL.test(email) ? `https://formsubmit.co/ajax/${encodeURIComponent(email)}` : '';
}

export function guestsText(values) {
  const adults = Number(values.adults) || 0;
  const children = Number(values.children) || 0;
  return `${adults + children} (${adults} adult${adults === 1 ? '' : 's'}${children ? `, ${children} child${children === 1 ? '' : 'ren'}` : ''})`;
}

export function enquirySubject(values, brandName) {
  return `Availability enquiry from ${String(values.name || '').trim()} (${longDate(values.checkIn)} to ${longDate(values.checkOut)}) | ${brandName}`;
}

/** The enquiry as plain readable text. Used for the email fallback and the WhatsApp follow-up. */
export function enquiryText(values, brandName) {
  const nights = nightsBetween(values.checkIn, values.checkOut);
  const lines = [
    `Hello! I'd like to check availability at ${brandName}.`,
    '',
    `Name: ${String(values.name).trim()}`,
    `Phone: ${String(values.phone).trim()}`,
    `Email: ${String(values.email).trim()}`,
    `Check-in: ${longDate(values.checkIn)}`,
    `Check-out: ${longDate(values.checkOut)}${nights ? ` (${nights} night${nights === 1 ? '' : 's'})` : ''}`,
    `Guests: ${guestsText(values)}`,
    'Stay: entire 1BHK (1 room)',
  ];
  const req = String(values.requirements || '').trim();
  if (req) lines.push(`Special requests: ${req}`);
  lines.push('', 'Thank you.');
  return lines.join('\n');
}

/** The fields the host receives as a table in the email. */
export function enquiryPayload(values, brandName) {
  const nights = nightsBetween(values.checkIn, values.checkOut);
  const payload = {
    _subject: enquirySubject(values, brandName),
    _template: 'table',
    _captcha: 'false',
    _honey: '',
    name: String(values.name).trim(),
    email: String(values.email).trim(), // also becomes the reply-to address, so the host can just press Reply
    phone: String(values.phone).trim(),
    check_in: longDate(values.checkIn),
    check_out: longDate(values.checkOut),
    nights: String(nights),
    guests: guestsText(values),
    stay: 'Entire 1BHK (1 room)',
    special_requests: String(values.requirements || '').trim() || '-',
    sent_from: brandName,
  };
  return payload;
}

/** A ready-filled email to the host in the visitor's own mail app (used when the direct send fails). */
export function enquiryMailtoUrl(values, brandName, hostEmail) {
  return mailUrl(hostEmail, enquirySubject(values, brandName), enquiryText(values, brandName));
}

/** Gmail compose link (browser) to the host with the enquiry typed in. Works without any mail app installed. */
export function enquiryGmailUrl(values, brandName, hostEmail) {
  return gmailUrl(hostEmail, enquirySubject(values, brandName), enquiryText(values, brandName));
}

/** The raw form values as the backend (backend/enquiry.mjs) expects them. */
export function backendPayload(values) {
  return {
    name: String(values.name || '').trim(),
    phone: String(values.phone || '').trim(),
    email: String(values.email || '').trim(),
    checkIn: values.checkIn,
    checkOut: values.checkOut,
    adults: Number(values.adults),
    children: Number(values.children || 0),
    requirements: String(values.requirements || '').trim(),
    acceptsRules: !!values.acceptsRules,
    website: String(values.website || ''),
  };
}

async function post(fetchImpl, url, payload, timeoutMs) {
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl?.signal,
    });
    let body = null;
    try { body = await res.json(); } catch { /* some services answer with an empty body */ }
    return { res, body };
  } catch {
    return null; // network failure or timeout
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Sends the enquiry to the host. Resolves { ok: true } or { ok: false, reason } and never throws.
 *   1. our own backend  (POST /api/enquiry, which emails the host)
 *   2. the form-to-email service in `endpoint` (FormSubmit) when the backend is missing or its email is not connected
 * If both fail the page offers the visitor a ready-filled email / WhatsApp message.
 * `fetchImpl`, `backendUrl` ('' turns the backend step off) and `timeoutMs` exist so tests can run without a network.
 */
export async function sendEnquiry(values, brandName, endpoint, { fetchImpl = globalThis.fetch, backendUrl = '/api/enquiry', timeoutMs = 15000 } = {}) {
  if (typeof fetchImpl !== 'function') return { ok: false, reason: 'network', details: ['This browser cannot send the enquiry.'] };
  let reason = 'not-configured';
  const details = []; // what each route answered, shown to the host on the failure screen so the cause is never a mystery
  const said = (r) => (r.body && typeof r.body.message === 'string' && r.body.message ? ` - ${r.body.message.slice(0, 160)}` : '');

  if (backendUrl) {
    const r = await post(fetchImpl, backendUrl, backendPayload(values), timeoutMs);
    if (r && r.res.ok && r.body && r.body.ok === true) return { ok: true };
    if (!r) details.push('Website backend: not reachable.');
    else if (r.res.status === 503) details.push('Website backend: the host email is not connected yet (see backend/README.md).');
    else if (r.res.status === 404 || r.res.status === 405 || (r.res.ok && !r.body)) details.push('Website backend: not installed on this address (a static host or an old copy of the site).');
    else details.push(`Website backend: answered ${r.res.status}${said(r)}`);
    // 400 = the backend says the details are wrong, 429 = too many tries: sending the same thing elsewhere would not help
    if (r && (r.res.status === 400 || r.res.status === 429)) return { ok: false, reason: 'refused', message: r.body && typeof r.body.message === 'string' ? r.body.message : '', details };
    if (r && r.res.status === 502) reason = 'refused'; // backend is set up but the mail server said no: still try the relay
  }

  if (!endpoint) return { ok: false, reason, details };
  const r = await post(fetchImpl, endpoint, enquiryPayload(values, brandName), timeoutMs);
  if (!r) { details.push('FormSubmit: could not connect (offline, or blocked by the network).'); return { ok: false, reason: 'network', details }; }
  const { res, body } = r;
  const refused = body && (body.success === false || body.success === 'false' || body.ok === false);
  if (!res.ok || refused) {
    details.push(`FormSubmit: answered ${res.status}${said(r)}${res.ok ? ' (open the FormSubmit email in the host Gmail and press Activate Form)' : ''}`);
    return { ok: false, reason: 'refused', message: body && typeof body.message === 'string' ? body.message : '', details };
  }
  return { ok: true };
}
