// The enquiry endpoint logic, shared by the local server (backend/server.mjs) and the Vercel function (api/enquiry.js).
// Checks the enquiry, then emails it to the host. Nothing is stored.
import { sendMail } from './smtp.mjs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const str = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const longDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const validDate = (iso) => ISO.test(iso) && !Number.isNaN(Date.parse(`${iso}T00:00:00Z`)) && new Date(`${iso}T00:00:00Z`).toISOString().slice(0, 10) === iso;
const nightsBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

/** Returns { ok: true, enquiry } or { ok: false, errors: { field: message } }. */
export function checkEnquiry(body, today = new Date().toISOString().slice(0, 10)) {
  const b = body && typeof body === 'object' ? body : {};
  const e = {};
  const name = str(b.name, 120);
  const phone = str(b.phone, 30);
  const email = str(b.email, 160);
  const requirements = str(b.requirements, 1000);
  const checkIn = str(b.checkIn, 10);
  const checkOut = str(b.checkOut, 10);
  const adults = Number(b.adults);
  const children = Number(b.children ?? 0);

  if (name.length < 2) e.name = 'Please enter your name.';
  if (!/^\+?[0-9][0-9 ()\-]{5,24}$/.test(phone) || phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15) e.phone = 'Enter a valid phone number.';
  if (!EMAIL.test(email)) e.email = 'Enter a valid email address.';
  if (!validDate(checkIn)) e.checkIn = 'Choose a valid check-in date.';
  else if (checkIn < today) e.checkIn = "Check-in can't be in the past.";
  if (!validDate(checkOut)) e.checkOut = 'Choose a valid check-out date.';
  else if (validDate(checkIn) && checkOut <= checkIn) e.checkOut = 'Check-out must be after check-in.';
  else if (validDate(checkIn) && nightsBetween(checkIn, checkOut) > 60) e.checkOut = 'For stays over 60 nights, please contact the host directly.';
  if (!Number.isInteger(adults) || adults < 1 || adults > 20) e.adults = 'Enter 1 to 20 adults.';
  if (!Number.isInteger(children) || children < 0 || children > 20) e.children = 'Enter 0 to 20 children.';
  if (b.acceptsRules !== true && b.acceptsRules !== 'true') e.acceptsRules = 'Please accept the house rules.';
  if (Object.keys(e).length) return { ok: false, errors: e };
  return { ok: true, enquiry: { name, phone, email, requirements, checkIn, checkOut, adults, children } };
}

export function emailContent(q, brand = 'the homestay') {
  const nights = nightsBetween(q.checkIn, q.checkOut);
  const guests = `${q.adults + q.children} (${q.adults} adult${q.adults === 1 ? '' : 's'}${q.children ? `, ${q.children} child${q.children === 1 ? '' : 'ren'}` : ''})`;
  const subject = `Availability enquiry from ${q.name} (${longDate(q.checkIn)} to ${longDate(q.checkOut)}) | ${brand}`;
  const text = [
    `New availability enquiry for ${brand}`,
    '',
    `Name: ${q.name}`,
    `Phone: ${q.phone}`,
    `Email: ${q.email}`,
    `Check-in: ${longDate(q.checkIn)}`,
    `Check-out: ${longDate(q.checkOut)} (${nights} night${nights === 1 ? '' : 's'})`,
    `Guests: ${guests}`,
    'Stay: entire 1BHK (1 room)',
    `Special requests: ${q.requirements || '-'}`,
    '',
    'This is an enquiry, not a confirmed booking. Press Reply to answer the guest (their email is the reply-to address).',
  ].join('\n');
  return { subject, text };
}

/** Reads the mail settings from environment variables. configured is false until an app password is set. */
export function mailSettings(env = process.env) {
  const user = (env.SMTP_USER || '').trim();
  const pass = (env.SMTP_PASS || '').replace(/\s+/g, ''); // Google shows app passwords in 4 groups; spaces are fine to paste
  const to = (env.MAIL_TO || user).trim();
  return {
    configured: !!(user && pass && to),
    host: (env.SMTP_HOST || 'smtp.gmail.com').trim(),
    port: Number(env.SMTP_PORT || 465),
    secure: String(env.SMTP_SECURE ?? 'true') !== 'false',
    rejectUnauthorized: String(env.SMTP_REJECT_UNAUTHORIZED ?? 'true') !== 'false',
    user, pass, to,
    from: (env.MAIL_FROM || user).trim(),
    brand: (env.SITE_NAME || 'Skanda Homestay').trim(),
  };
}

// Simple per-visitor limit so the form cannot be used to flood the host's inbox (best effort: memory is per server instance).
const hits = new Map();
export function tooMany(ip, { limit = 5, windowMs = 10 * 60 * 1000, now = Date.now() } = {}) {
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

/**
 * The whole endpoint: body in, { status, json } out. Never throws.
 * status 200 sent | 400 something to fix | 429 too many | 503 backend has no mail settings yet | 502 mail server refused
 */
export async function handleEnquiry(body, { env = process.env, ip = 'unknown', send = sendMail, today, log = console.error } = {}) {
  if (body && typeof body === 'object' && body.website) return { status: 200, json: { ok: true } }; // spam trap filled: pretend it worked, send nothing
  const settings = mailSettings(env);
  if (!settings.configured) return { status: 503, json: { ok: false, error: 'not-configured', message: 'The host has not connected the email yet.' } };
  const checked = checkEnquiry(body, today);
  if (!checked.ok) return { status: 400, json: { ok: false, error: 'invalid', errors: checked.errors } };
  if (tooMany(ip)) return { status: 429, json: { ok: false, error: 'rate-limited', message: 'Too many enquiries from this connection. Please try again later or call the host.' } };
  const { subject, text } = emailContent(checked.enquiry, settings.brand);
  try {
    await send({ host: settings.host, port: settings.port, secure: settings.secure, rejectUnauthorized: settings.rejectUnauthorized, user: settings.user, pass: settings.pass, from: settings.from, fromName: settings.brand, to: settings.to, replyTo: checked.enquiry.email, subject, text });
    return { status: 200, json: { ok: true } };
  } catch (err) {
    log('[enquiry] email failed:', err.message);
    return { status: 502, json: { ok: false, error: 'mail-failed', message: 'The email could not be sent.' } };
  }
}
