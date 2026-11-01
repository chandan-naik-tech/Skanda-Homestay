/** Client-side validation. The server validates again; this is for fast, friendly feedback. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isoToday(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = Date.parse(`${checkIn}T00:00:00Z`);
  const b = Date.parse(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}

export function addDays(iso, days) {
  const t = Date.parse(`${iso}T00:00:00Z`) + days * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

export function validPhone(v) {
  const digits = String(v || '').replace(/\D/g, '');
  return /^\+?[0-9][0-9 ()\-]{5,24}$/.test(String(v || '').trim()) && digits.length >= 7 && digits.length <= 15;
}

export const validEmail = (v) => EMAIL.test(String(v || '').trim());

/**
 * @param {object} v  { checkIn, checkOut, adults, children, rooms, name, phone, email, requirements, acceptsRules }
 * @param {object} limits { maxGuests, maxRooms, today }
 */
export function validateEnquiry(v, { maxGuests = null, maxRooms = 1, today = isoToday() } = {}) {
  const e = {};
  if (!v.checkIn) e.checkIn = 'Choose your check-in date.';
  else if (v.checkIn < today) e.checkIn = "Check-in can't be in the past.";
  if (!v.checkOut) e.checkOut = 'Choose your check-out date.';
  else if (v.checkIn && v.checkOut <= v.checkIn) e.checkOut = 'Check-out must be after check-in.';
  else if (nightsBetween(v.checkIn, v.checkOut) > 60) e.checkOut = 'For stays over 60 nights, please contact the host directly.';

  const adults = Number(v.adults);
  const children = Number(v.children || 0);
  const rooms = Number(v.rooms);
  if (!Number.isInteger(adults) || adults < 1) e.adults = 'At least 1 adult is needed.';
  else if (adults > 20) e.adults = 'For groups this large, please contact the host.';
  if (!Number.isInteger(children) || children < 0) e.children = 'Enter 0 or more children.';
  if (!e.adults && !e.children && maxGuests && adults + children > maxGuests) {
    e.adults = `This stay sleeps up to ${maxGuests} guests in total.`;
  }
  if (!Number.isInteger(rooms) || rooms < 1) e.rooms = 'Enter at least 1.';
  else if (rooms > maxRooms) e.rooms = `Only ${maxRooms} room${maxRooms === 1 ? '' : 's'} available to book.`;

  if (!String(v.name || '').trim() || String(v.name).trim().length < 2) e.name = 'Please enter your name.';
  if (!String(v.phone || '').trim()) e.phone = 'Enter a phone number the host can reach you on.';
  else if (!validPhone(v.phone)) e.phone = 'Enter a valid phone number, like +91 98765 43210.';
  if (!String(v.email || '').trim()) e.email = 'Enter your email address.';
  else if (!validEmail(v.email)) e.email = 'Enter a valid email address, like name@example.com.';
  if (String(v.requirements || '').length > 1000) e.requirements = 'Please keep this under 1000 characters.';
  if (!v.acceptsRules) e.acceptsRules = 'Please confirm that you are a family and accept the house rules.';
  return e;
}

export function validateContact(v) {
  const e = {};
  if (!String(v.name || '').trim() || String(v.name).trim().length < 2) e.name = 'Please enter your name.';
  if (!String(v.email || '').trim()) e.email = 'Enter your email address.';
  else if (!validEmail(v.email)) e.email = 'Enter a valid email address, like name@example.com.';
  if (String(v.phone || '').trim() && !validPhone(v.phone)) e.phone = 'Enter a valid phone number, or leave it empty.';
  if (!String(v.subject || '').trim() || String(v.subject).trim().length < 2) e.subject = 'Add a short subject.';
  const msg = String(v.message || '').trim();
  if (!msg) e.message = 'Write your message.';
  else if (msg.length < 10) e.message = 'Please write at least 10 characters.';
  else if (msg.length > 3000) e.message = 'Please keep your message under 3000 characters.';
  return e;
}
