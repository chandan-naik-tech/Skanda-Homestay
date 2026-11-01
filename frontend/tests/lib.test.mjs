import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWhatsAppNumber, whatsAppUrl, enquiryMessage, telUrl, mailUrl } from '../src/lib/whatsapp.js';
import { validateEnquiry, validateContact, addDays, isoToday, nightsBetween } from '../src/lib/validate.js';
import { deepMerge, filled, isSampleImage } from '../src/lib/merge.js';
import { minutesFrom, formatMoney, initials } from '../src/lib/format.js';

test('whatsapp number normalisation', () => {
  assert.equal(normalizeWhatsAppNumber('+91 98765 43210'), '919876543210');
  assert.equal(normalizeWhatsAppNumber('98765 43210', '91'), '919876543210');
  assert.equal(normalizeWhatsAppNumber('098765 43210', '91'), '919876543210');
  assert.equal(normalizeWhatsAppNumber('0091 98765 43210'), '919876543210');
  assert.equal(normalizeWhatsAppNumber('+1 (415) 555-2671'), '14155552671');
  assert.equal(normalizeWhatsAppNumber(''), null);
  assert.equal(normalizeWhatsAppNumber('abc'), null);
  assert.equal(normalizeWhatsAppNumber('12345'), null);
  assert.equal(normalizeWhatsAppNumber('+1234567890123456'), null);
  assert.equal(normalizeWhatsAppNumber(null), null);
});

test('whatsapp url is encoded and addressed to the number', () => {
  const values = { name: 'Asha & Co', checkIn: '2027-01-10', checkOut: '2027-01-12', adults: 2, children: 1, requirements: 'Ground floor? 100% quiet #1' };
  const msg = enquiryMessage(values, 'Skanda Homestay', 12);
  assert.match(msg, /Name: Asha & Co/);
  assert.match(msg, /Check-in: 10 Jan 2027/);
  assert.match(msg, /Guests: 3 \(2 adults, 1 child\)/);
  assert.match(msg, /Special requests: Ground floor\? 100% quiet #1/);
  assert.match(msg, /reference on the website: #12/);
  const url = whatsAppUrl('919876543210', msg);
  assert.ok(url.startsWith('https://wa.me/919876543210?text='));
  const text = new URL(url).searchParams.get('text');
  assert.equal(text, msg, 'decoding the link returns the exact message');
  assert.ok(!url.includes(' ') && !url.includes('\n') && !url.includes('&Co'));
  assert.equal(whatsAppUrl(null, 'x'), null);
});

test('guests wording', () => {
  const m = enquiryMessage({ name: 'A', checkIn: '2027-01-10', checkOut: '2027-01-11', adults: 1, children: 0, requirements: '  ' }, 'B');
  assert.match(m, /Guests: 1 \(1 adult\)/);
  assert.doesNotMatch(m, /Special requests/);
});

test('tel and mail links', () => {
  assert.equal(telUrl('+91 98765-43210'), 'tel:+919876543210');
  assert.equal(telUrl('hello'), null);
  assert.equal(telUrl('98765 43210', '91'), 'tel:+919876543210'); // adds the country code when missing
  assert.equal(telUrl('98765 43210'), 'tel:9876543210'); // no country code configured: left as typed
  assert.equal(telUrl('+44 20 7946 0958', '91'), 'tel:+442079460958'); // an explicit + is never changed
  assert.equal(mailUrl('a@b.co', 'Hi there'), 'mailto:a@b.co?subject=Hi%20there');
  assert.equal(mailUrl('nope'), null);
  // a ready-typed message: spaces as %20, line breaks as CRLF, & and ? safe inside the body
  assert.equal(mailUrl('a@b.co', 'Hi', 'Line 1\nLine 2 & more?'), 'mailto:a@b.co?subject=Hi&body=Line%201%0D%0ALine%202%20%26%20more%3F');
  assert.equal(mailUrl('a@b.co', '', 'Only body'), 'mailto:a@b.co?body=Only%20body');
});

const good = () => {
  const today = isoToday();
  return { checkIn: addDays(today, 5), checkOut: addDays(today, 7), adults: 2, children: 1, rooms: 1, name: 'Asha Rao', phone: '+91 98765 43210', email: 'asha@example.com', requirements: '', acceptsRules: true };
};

test('enquiry validation accepts a good form', () => {
  assert.deepEqual(validateEnquiry(good()), {});
});

test('enquiry validation catches date problems', () => {
  const today = isoToday();
  assert.ok(validateEnquiry({ ...good(), checkOut: good().checkIn }).checkOut);
  assert.ok(validateEnquiry({ ...good(), checkOut: addDays(today, 1) }).checkOut);
  assert.ok(validateEnquiry({ ...good(), checkIn: addDays(today, -2), checkOut: addDays(today, 1) }).checkIn);
  assert.ok(validateEnquiry({ ...good(), checkIn: '', checkOut: '' }).checkIn);
  assert.ok(validateEnquiry({ ...good(), checkOut: addDays(good().checkIn, 61) }).checkOut);
});

test('enquiry validation catches guest problems', () => {
  assert.ok(validateEnquiry({ ...good(), adults: 0 }).adults);
  assert.ok(validateEnquiry({ ...good(), adults: 'x' }).adults);
  assert.ok(validateEnquiry({ ...good(), children: -1 }).children);
  assert.ok(validateEnquiry({ ...good(), adults: 3, children: 2 }, { maxGuests: 4 }).adults);
  assert.equal(validateEnquiry({ ...good(), adults: 2, children: 2 }, { maxGuests: 4 }).adults, undefined);
  assert.ok(validateEnquiry({ ...good(), rooms: 2 }, { maxRooms: 1 }).rooms);
  assert.ok(validateEnquiry({ ...good(), acceptsRules: false }).acceptsRules);
});

test('enquiry validation catches contact problems', () => {
  const e = validateEnquiry({ ...good(), name: ' ', phone: 'abc', email: 'nope' });
  assert.ok(e.name && e.phone && e.email);
  assert.ok(validateEnquiry({ ...good(), phone: '' }).phone);
});

test('contact validation', () => {
  assert.deepEqual(validateContact({ name: 'Ravi', email: 'r@x.com', phone: '', subject: 'Parking', message: 'Is there parking?' }), {});
  const e = validateContact({ name: '', email: 'x', phone: '12', subject: '', message: 'hi' });
  assert.ok(e.name && e.email && e.phone && e.subject && e.message);
});

test('date helpers', () => {
  assert.equal(addDays('2027-02-27', 2), '2027-03-01');
  assert.equal(nightsBetween('2027-01-10', '2027-01-12'), 2);
  assert.equal(nightsBetween('', '2027-01-12'), 0);
});

test('deep merge replaces arrays and keeps untouched keys', () => {
  const merged = deepMerge({ a: { b: 1, c: [1, 2] }, d: 'x' }, { a: { c: [9] } });
  assert.deepEqual(merged, { a: { b: 1, c: [9] }, d: 'x' });
  assert.deepEqual(deepMerge({ a: 1 }, { a: '' }), { a: '' });
  // a stale saved sample picture must not hide a real default photo, but a real saved photo always wins
  assert.equal(deepMerge({ img: '/photos/home.jpg' }, { img: '/placeholders/hero.svg' }).img, '/photos/home.jpg');
  assert.equal(deepMerge({ img: '/photos/home.jpg' }, { img: '/uploads/abc.webp' }).img, '/uploads/abc.webp');
  // gallery: an untouched saved list of samples gives way to real default photos; an edited list is kept
  const realDefault = [{ src: '/photos/bedroom-1.jpg' }, { src: '/placeholders/kitchen.svg' }];
  assert.deepEqual(deepMerge({ g: realDefault }, { g: [{ src: '/placeholders/bedroom.svg' }, { src: '/placeholders/kitchen.svg' }] }).g, realDefault);
  assert.deepEqual(deepMerge({ g: realDefault }, { g: [{ src: '/uploads/mine.webp' }] }).g, [{ src: '/uploads/mine.webp' }]);
  assert.deepEqual(deepMerge({ g: realDefault }, { g: [] }).g, []);
  assert.equal(deepMerge({ img: '/placeholders/hero.svg' }, { img: '/placeholders/bedroom.svg' }).img, '/placeholders/bedroom.svg');
  assert.deepEqual(deepMerge({ a: 1 }, null), { a: 1 });
});

test('misc helpers', () => {
  assert.equal(filled(''), false); assert.equal(filled('  '), false); assert.equal(filled(null), false);
  assert.equal(filled([]), false); assert.equal(filled(0), true); assert.equal(filled('x'), true);
  assert.equal(isSampleImage('/placeholders/a.svg'), true); assert.equal(isSampleImage('/uploads/a.webp'), false);
  assert.equal(minutesFrom('30 minutes'), 30); assert.equal(minutesFrom('1 hr 15 min'), 75); assert.equal(minutesFrom('about 2 hours'), 120);
  assert.equal(minutesFrom('soon'), null); assert.equal(minutesFrom(''), null);
  assert.equal(formatMoney(2500), '₹2,500'); assert.equal(formatMoney(null), '');
  assert.equal(initials('Asha Rao'), 'AR'); assert.equal(initials(''), '?');
});
