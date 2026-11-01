/**
 * WhatsApp helpers. No API needed: we build a https://wa.me link that opens WhatsApp
 * with the message ready to send. The visitor presses Send themselves.
 */

/** Returns digits-only international number (e.g. "919876543210") or null if invalid. */
export function normalizeWhatsAppNumber(raw, defaultCountryCode = '') {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!/^\+?[0-9 ()\-.]+$/.test(trimmed)) return null;
  let digits = trimmed.replace(/\D/g, '');
  const hasPlus = trimmed.startsWith('+');
  if (!hasPlus) {
    if (digits.startsWith('00')) digits = digits.slice(2);
    else if (defaultCountryCode) {
      if (digits.startsWith('0')) digits = digits.slice(1);
      // A bare national number (10 digits for India and many others) gets the country code.
      if (digits.length <= 10) digits = defaultCountryCode + digits;
    }
  }
  if (digits.length < 8 || digits.length > 15 || digits.startsWith('0')) return null;
  return digits;
}

export function whatsAppUrl(number, message = '') {
  if (!number) return null;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function telUrl(raw, defaultCountryCode = '') {
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  const digits = t.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  // With a country code on file, dial in full international form so the link also works from abroad.
  const international = defaultCountryCode ? normalizeWhatsAppNumber(t, defaultCountryCode) : null;
  if (international) return `tel:+${international}`;
  return `tel:${t.startsWith('+') ? '+' : ''}${digits}`;
}

/** mailto: link that opens the visitor's mail app with the address, a subject and a ready-typed message. */
export function mailUrl(email, subject = '', body = '') {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return null;
  const parts = [];
  if (subject) parts.push(`subject=${encodeURIComponent(subject)}`);
  if (body) parts.push(`body=${encodeURIComponent(String(body).replace(/\r?\n/g, '\r\n'))}`);
  return `mailto:${email.trim()}${parts.length ? `?${parts.join('&')}` : ''}`;
}

/** Gmail in the browser, with the host's address, subject and message already filled in. Works without any mail app installed. */
export function gmailUrl(email, subject = '', body = '') {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return null;
  const q = [`view=cm`, `fs=1`, `to=${encodeURIComponent(email.trim())}`];
  if (subject) q.push(`su=${encodeURIComponent(subject)}`);
  if (body) q.push(`body=${encodeURIComponent(String(body).replace(/\r?\n/g, '\n'))}`);
  return `https://mail.google.com/mail/?${q.join('&')}`;
}

export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

/** The prefilled message for a booking enquiry. */
export function enquiryMessage(values, brandName, reference) {
  const adults = Number(values.adults) || 0;
  const children = Number(values.children) || 0;
  const guests = `${adults + children} (${adults} adult${adults === 1 ? '' : 's'}${children ? `, ${children} child${children === 1 ? '' : 'ren'}` : ''})`;
  const lines = [
    `Hello! I'd like to check availability at ${brandName}.`,
    '',
    `Name: ${values.name}`,
    `Check-in: ${longDate(values.checkIn)}`,
    `Check-out: ${longDate(values.checkOut)}`,
    `Guests: ${guests}`,
  ];
  if (values.requirements && values.requirements.trim()) lines.push(`Special requests: ${values.requirements.trim()}`);
  if (reference) lines.push('', `My enquiry reference on the website: #${reference}`);
  return lines.join('\n');
}
