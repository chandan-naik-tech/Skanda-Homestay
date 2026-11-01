import test from 'node:test';
import assert from 'node:assert/strict';
import { enquiryEndpoint, enquiryPayload, enquiryText, enquirySubject, enquiryMailtoUrl, enquiryGmailUrl, sendEnquiry } from '../src/lib/enquiry.js';
import { mapEmbedUrl } from '../src/lib/url.js';

const v = { name: ' Asha Rao ', phone: '+91 98765 43210', email: 'asha@example.com', checkIn: '2027-01-10', checkOut: '2027-01-13', adults: '2', children: '1', requirements: 'Late arrival & a baby cot?' };

test('endpoint: host email through FormSubmit, or the owner’s own https address', () => {
  assert.equal(enquiryEndpoint({ email: 'Samarthanaik55@gmail.com' }), 'https://formsubmit.co/ajax/Samarthanaik55%40gmail.com');
  assert.equal(enquiryEndpoint({ email: 'x@y.co', formEndpoint: 'https://formspree.io/f/abc' }), 'https://formspree.io/f/abc');
  assert.equal(enquiryEndpoint({ email: 'x@y.co', formEndpoint: 'http://insecure.example/f' }), 'https://formsubmit.co/ajax/x%40y.co');
  assert.equal(enquiryEndpoint({ email: '' }), '');
  assert.equal(enquiryEndpoint({ email: 'not-an-email' }), '');
  assert.equal(enquiryEndpoint({}), '');
});

test('payload carries every detail the host needs and the visitor as reply-to', () => {
  const p = enquiryPayload(v, 'Skanda Homestay');
  assert.equal(p.name, 'Asha Rao');
  assert.equal(p.email, 'asha@example.com');
  assert.equal(p.phone, '+91 98765 43210');
  assert.equal(p.check_in, '10 Jan 2027');
  assert.equal(p.check_out, '13 Jan 2027');
  assert.equal(p.nights, '3');
  assert.equal(p.guests, '3 (2 adults, 1 child)');
  assert.equal(p.special_requests, 'Late arrival & a baby cot?');
  assert.equal(p._captcha, 'false');
  assert.match(p._subject, /Asha Rao/);
  assert.equal(enquiryPayload({ ...v, requirements: '  ' }, 'B').special_requests, '-');
});

test('email / WhatsApp fallback text and mailto link', () => {
  const t = enquiryText(v, 'Skanda Homestay');
  assert.match(t, /Name: Asha Rao/);
  assert.match(t, /Phone: \+91 98765 43210/);
  assert.match(t, /Check-out: 13 Jan 2027 \(3 nights\)/);
  assert.match(t, /Special requests: Late arrival & a baby cot\?/);
  const link = enquiryMailtoUrl(v, 'Skanda Homestay', 'host@example.com');
  assert.ok(link.startsWith('mailto:host@example.com?subject='));
  const q = new URLSearchParams(link.split('?')[1]);
  assert.equal(q.get('subject'), enquirySubject(v, 'Skanda Homestay'));
  assert.equal(q.get('body').replace(/\r\n/g, '\n'), t);
  assert.equal(enquiryMailtoUrl(v, 'B', ''), null);
});

function fakeFetch(handler) { const calls = []; const f = async (url, init) => { calls.push({ url, init }); return handler(url, init); }; f.calls = calls; return f; }
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => { if (body === undefined) throw new Error('empty'); return body; } });

test('send: success, posts JSON to the endpoint', async () => {
  const f = fakeFetch(() => reply(200, { success: 'true', message: 'The form was submitted successfully.' }));
  const r = await sendEnquiry(v, 'Skanda Homestay', 'https://formsubmit.co/ajax/host%40example.com', { backendUrl: '', fetchImpl: f });
  assert.deepEqual(r, { ok: true });
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].init.method, 'POST');
  assert.equal(f.calls[0].init.headers['Content-Type'], 'application/json');
  assert.equal(JSON.parse(f.calls[0].init.body).guests, '3 (2 adults, 1 child)');
});

test('send: services that answer with an empty body or { ok: true } count as success', async () => {
  assert.equal((await sendEnquiry(v, 'B', 'https://x.example/f', { backendUrl: '', fetchImpl: fakeFetch(() => reply(200)) })).ok, true);
  assert.equal((await sendEnquiry(v, 'B', 'https://x.example/f', { backendUrl: '', fetchImpl: fakeFetch(() => reply(200, { ok: true })) })).ok, true);
});

test('send: refused (needs activation / error status) and network failures are reported, never thrown', async () => {
  let r = await sendEnquiry(v, 'B', 'https://x.example/f', { backendUrl: '', fetchImpl: fakeFetch(() => reply(200, { success: 'false', message: 'This form needs Activation.' })) });
  assert.equal(r.ok, false); assert.equal(r.reason, 'refused'); assert.equal(r.message, 'This form needs Activation.');
  r = await sendEnquiry(v, 'B', 'https://x.example/f', { backendUrl: '', fetchImpl: fakeFetch(() => reply(500, {})) });
  assert.equal(r.ok, false); assert.equal(r.reason, 'refused');
  r = await sendEnquiry(v, 'B', 'https://x.example/f', { backendUrl: '', fetchImpl: async () => { throw new TypeError('Failed to fetch'); } });
  assert.equal(r.ok, false); assert.equal(r.reason, 'network');
  assert.equal((await sendEnquiry(v, 'B', '', { backendUrl: '', fetchImpl: fakeFetch(() => reply(200, {})) })).reason, 'not-configured');
});

test('send: a hung request times out', async () => {
  const hang = (url, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(new Error('aborted'))));
  const r = await sendEnquiry(v, 'B', 'https://x.example/f', { backendUrl: '', fetchImpl: hang, timeoutMs: 20 });
  assert.equal(r.ok, false); assert.equal(r.reason, 'network');
});

test('map embed addresses', () => {
  assert.ok(mapEmbedUrl('https://www.google.com/maps?q=Hegde%2C%20Kumta&output=embed'));
  assert.ok(mapEmbedUrl('https://www.google.com/maps/embed?pb=!1m18'));
  assert.ok(mapEmbedUrl('https://maps.google.com/maps?q=Kumta&z=14&output=embed'));
  assert.equal(mapEmbedUrl('https://www.google.com/maps?q=Kumta'), '', 'a plain maps page cannot be embedded');
  assert.equal(mapEmbedUrl('https://evil.example/maps?output=embed'), '');
  assert.equal(mapEmbedUrl('javascript:alert(1)'), '');
});

// ---- backend first, relay second ----
const routed = (map) => { const calls = []; const f = async (url, init) => { calls.push({ url, body: init && init.body && JSON.parse(init.body) }); const h = map[url]; if (!h) throw new TypeError('no route'); return h(); }; f.calls = calls; return f; };
const RELAY = 'https://formsubmit.co/ajax/host%40example.com';

test('backend: success stops there and posts the raw form values', async () => {
  const f = routed({ '/api/enquiry': () => reply(200, { ok: true }), [RELAY]: () => reply(200, {}) });
  const r = await sendEnquiry({ ...v, acceptsRules: true, website: '' }, 'B', RELAY, { fetchImpl: f });
  assert.deepEqual(r, { ok: true });
  assert.deepEqual(f.calls.map((c) => c.url), ['/api/enquiry']);
  assert.equal(f.calls[0].body.checkIn, '2027-01-10');
  assert.equal(f.calls[0].body.adults, 2);
  assert.equal(f.calls[0].body.acceptsRules, true);
});

test('backend missing (404), not connected (503) or unreachable: falls back to the relay', async () => {
  for (const status of [404, 405, 503, 502]) {
    const f = routed({ '/api/enquiry': () => reply(status, { ok: false }), [RELAY]: () => reply(200, { success: 'true' }) });
    assert.deepEqual(await sendEnquiry(v, 'B', RELAY, { fetchImpl: f }), { ok: true }, `status ${status}`);
    assert.equal(f.calls.length, 2);
  }
  const down = routed({ [RELAY]: () => reply(200, { success: 'true' }) }); // /api/enquiry throws
  assert.deepEqual(await sendEnquiry(v, 'B', RELAY, { fetchImpl: down }), { ok: true });
  const html = routed({ '/api/enquiry': () => reply(200), [RELAY]: () => reply(200, {}) }); // static host answers 200 with index.html, not JSON
  assert.deepEqual(await sendEnquiry(v, 'B', RELAY, { fetchImpl: html }), { ok: true });
  assert.equal(html.calls.length, 2);
});

test('backend 400 / 429 are final (no second send); both routes failing is reported', async () => {
  for (const status of [400, 429]) {
    const f = routed({ '/api/enquiry': () => reply(status, { ok: false, message: 'Too many' }), [RELAY]: () => reply(200, {}) });
    const r = await sendEnquiry(v, 'B', RELAY, { fetchImpl: f });
    assert.equal(r.ok, false); assert.equal(r.reason, 'refused');
    assert.equal(f.calls.length, 1);
  }
  const both = routed({ '/api/enquiry': () => reply(503, {}), [RELAY]: () => reply(200, { success: 'false' }) });
  assert.equal((await sendEnquiry(v, 'B', RELAY, { fetchImpl: both })).reason, 'refused');
  const none = routed({ '/api/enquiry': () => reply(503, {}) });
  assert.equal((await sendEnquiry(v, 'B', '', { fetchImpl: none })).reason, 'not-configured');
});

test('owner map pin and street view embeds are accepted', () => {
  assert.ok(mapEmbedUrl('https://www.google.com/maps?q=14.4558158,74.4183203&z=16&output=embed'));
  assert.ok(mapEmbedUrl('https://www.google.com/maps/embed?pb=!4v1793384600171!6m8!1m7!1ssntbV7m4Je1OBdpXXkG1fA!2m2!1d14.45581580465077!2d74.4183203392351!3f167.84!4f-28.38!5f0.78'));
});

test('gmail link goes to the host with subject and message filled in', () => {
  const link = enquiryGmailUrl(v, 'Skanda Homestay', 'Samarthanaik55@gmail.com');
  const u = new URL(link);
  assert.equal(u.origin + u.pathname, 'https://mail.google.com/mail/');
  assert.equal(u.searchParams.get('view'), 'cm');
  assert.equal(u.searchParams.get('to'), 'Samarthanaik55@gmail.com');
  assert.equal(u.searchParams.get('su'), enquirySubject(v, 'Skanda Homestay'));
  assert.equal(u.searchParams.get('body'), enquiryText(v, 'Skanda Homestay'));
  assert.equal(enquiryGmailUrl(v, 'B', 'not-an-email'), null);
  assert.equal(enquiryGmailUrl(v, 'B', ''), null);
});

test('failed sends explain what each route answered', async () => {
  const f = routed({ '/api/enquiry': () => reply(503, { ok: false }), [RELAY]: () => reply(200, { success: 'false', message: 'This form needs Activation.' }) });
  const r = await sendEnquiry(v, 'B', RELAY, { fetchImpl: f });
  assert.equal(r.reason, 'refused');
  assert.match(r.details[0], /email is not connected/);
  assert.match(r.details[1], /FormSubmit: answered 200 - This form needs Activation\./);
  assert.match(r.details[1], /Activate Form/);
  const down = await sendEnquiry(v, 'B', RELAY, { fetchImpl: async () => { throw new TypeError('x'); } });
  assert.match(down.details.join(' '), /not reachable/); assert.match(down.details.join(' '), /could not connect/);
  const old = await sendEnquiry(v, 'B', RELAY, { fetchImpl: routed({ '/api/enquiry': () => reply(404, {}), [RELAY]: () => reply(500, {}) }) });
  assert.match(old.details[0], /not installed on this address/);
});
