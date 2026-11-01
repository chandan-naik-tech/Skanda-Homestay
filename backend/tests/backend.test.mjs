import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { checkEnquiry, emailContent, mailSettings, handleEnquiry, tooMany } from '../enquiry.mjs';
import { buildMessage, sendMail } from '../smtp.mjs';
import { createApp, listen } from '../server.mjs';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const good = { name: ' Asha Rao ', phone: '+91 98765 43210', email: 'asha@example.com', checkIn: '2027-01-10', checkOut: '2027-01-13', adults: 2, children: 1, requirements: 'Late arrival\nBaby cot', acceptsRules: true, website: '' };
const TODAY = '2026-10-30';

/** A mock SMTP server. mode: 'ok' | 'badauth' | 'badrcpt'. Collects what it received. */
function mockSmtp(mode = 'ok') {
  const got = { auth: null, from: null, rcpt: null, data: '' };
  const server = net.createServer((sock) => {
    let inData = false; let buf = '';
    sock.write('220 mock ESMTP\r\n');
    sock.on('data', (chunk) => {
      buf += chunk.toString('utf8');
      let i;
      while ((i = buf.indexOf('\r\n')) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 2);
        if (inData) {
          if (line === '.') { inData = false; sock.write('250 queued\r\n'); } else got.data += line.replace(/^\.\./, '.') + '\n';
          continue;
        }
        if (line.startsWith('EHLO')) sock.write('250-mock\r\n250 AUTH PLAIN\r\n');
        else if (line.startsWith('AUTH PLAIN')) { got.auth = Buffer.from(line.slice(11), 'base64').toString(); sock.write(mode === 'badauth' ? '535 5.7.8 bad credentials\r\n' : '235 ok\r\n'); }
        else if (line.startsWith('MAIL FROM:')) { got.from = line.slice(10); sock.write('250 ok\r\n'); }
        else if (line.startsWith('RCPT TO:')) { got.rcpt = line.slice(8); sock.write(mode === 'badrcpt' ? '550 no such user\r\n' : '250 ok\r\n'); }
        else if (line === 'DATA') { inData = true; sock.write('354 go\r\n'); }
        else if (line === 'QUIT') { sock.write('221 bye\r\n'); sock.end(); }
      }
    });
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ server, got, port: server.address().port })));
}
const decodeBody = (data) => {
  const [head, ...rest] = data.split('\n\n');
  const headers = Object.fromEntries(head.split('\n').map((l) => [l.slice(0, l.indexOf(':')).toLowerCase(), l.slice(l.indexOf(':') + 1).trim()]));
  return { headers, text: Buffer.from(rest.join('\n').replace(/\n/g, ''), 'base64').toString('utf8') };
};
const unB64 = (h) => Buffer.from(h.match(/=\?UTF-8\?B\?(.*?)\?=/)[1], 'base64').toString('utf8');

const mailEnv = (port) => ({ SMTP_USER: 'host@example.com', SMTP_PASS: 'abcd efgh ijkl mnop', MAIL_TO: 'owner@example.com', SMTP_HOST: '127.0.0.1', SMTP_PORT: String(port), SMTP_SECURE: 'false', SITE_NAME: 'Skanda Homestay' });

test('validation: good enquiry passes and is tidied; each bad field is named', () => {
  const ok = checkEnquiry(good, TODAY);
  assert.equal(ok.ok, true);
  assert.equal(ok.enquiry.name, 'Asha Rao');
  const bad = checkEnquiry({ ...good, name: '', phone: 'abc', email: 'nope', checkIn: '2020-01-01', checkOut: '2020-01-01', adults: 0, acceptsRules: false }, TODAY);
  assert.deepEqual(Object.keys(bad.errors).sort(), ['acceptsRules', 'adults', 'checkIn', 'checkOut', 'email', 'name', 'phone']);
  assert.ok(checkEnquiry({ ...good, checkOut: '2027-01-10' }, TODAY).errors.checkOut);
  assert.ok(checkEnquiry({ ...good, checkOut: '2027-06-10' }, TODAY).errors.checkOut); // over 60 nights
  assert.ok(checkEnquiry({ ...good, checkIn: '2027-02-30', checkOut: '2027-03-02' }, TODAY).errors.checkIn); // impossible date
  assert.ok(checkEnquiry(null, TODAY).errors.name);
  assert.ok(checkEnquiry({ ...good, adults: 'x' }, TODAY).errors.adults);
});

test('email text has every detail', () => {
  const { subject, text } = emailContent(checkEnquiry(good, TODAY).enquiry, 'Skanda Homestay');
  assert.match(subject, /Asha Rao \(10 Jan 2027 to 13 Jan 2027\)/);
  assert.match(text, /Guests: 3 \(2 adults, 1 child\)/);
  assert.match(text, /Check-out: 13 Jan 2027 \(3 nights\)/);
  assert.match(text, /Phone: \+91 98765 43210/);
});

test('settings: spaces in the app password are removed; unconfigured is detected', () => {
  const s = mailSettings({ SMTP_USER: 'a@b.co', SMTP_PASS: 'abcd efgh ijkl mnop' });
  assert.equal(s.pass, 'abcdefghijklmnop'); assert.equal(s.to, 'a@b.co'); assert.equal(s.host, 'smtp.gmail.com'); assert.equal(s.port, 465); assert.equal(s.configured, true);
  assert.equal(mailSettings({}).configured, false);
  assert.equal(mailSettings({ SMTP_USER: 'a@b.co' }).configured, false);
});

test('smtp: signs in, delivers a UTF-8 email with reply-to the guest', async () => {
  const m = await mockSmtp();
  const env = mailEnv(m.server.address().port);
  const out = await handleEnquiry(good, { env, ip: 't1', today: TODAY });
  m.server.close();
  assert.deepEqual(out, { status: 200, json: { ok: true } });
  assert.equal(m.got.auth, '\0host@example.com\0abcdefghijklmnop');
  assert.equal(m.got.from, '<host@example.com>');
  assert.equal(m.got.rcpt, '<owner@example.com>');
  const { headers, text } = decodeBody(m.got.data);
  assert.equal(headers['reply-to'], '<asha@example.com>');
  assert.equal(headers.to, '<owner@example.com>');
  assert.match(unB64(headers.subject), /Availability enquiry from Asha Rao/);
  assert.match(text.replace(/\r/g, ''), /Special requests: Late arrival\nBaby cot/);
});

test('smtp: wrong password and unknown recipient are reported as 502, not success', async () => {
  for (const mode of ['badauth', 'badrcpt']) {
    const m = await mockSmtp(mode);
    const errors = [];
    const out = await handleEnquiry(good, { env: mailEnv(m.server.address().port), ip: `t-${mode}`, today: TODAY, log: (...a) => errors.push(a.join(' ')) });
    m.server.close();
    assert.equal(out.status, 502, mode);
    assert.equal(out.json.error, 'mail-failed');
    assert.match(errors[0], mode === 'badauth' ? /Sign-in/ : /Recipient/);
    assert.ok(!JSON.stringify(out.json).includes('abcd')); // the password never leaves the server
  }
});

test('smtp: a mail server that is down fails quickly and clearly', async () => {
  await assert.rejects(sendMail({ host: '127.0.0.1', port: 1, secure: false, from: 'a@b.co', to: 'c@d.co', subject: 's', text: 't', timeoutMs: 2000 }), /Could not reach/);
});

test('header injection: line breaks in names or subjects cannot add headers; lone dots survive', () => {
  const raw = buildMessage({ from: 'a@b.co', to: 'c@d.co\r\nBcc: evil@x.co', replyTo: 'g@h.co', subject: 'Hi\r\nBcc: evil@x.co', text: 'line\n.\nend', fromName: 'N\r\nX: y' });
  assert.ok(!/^Bcc:/m.test(raw));
  assert.ok(!/^X:/m.test(raw));
  assert.equal((raw.match(/^To:/gm) || []).length, 1);
});

test('endpoint: not connected = 503; spam trap = silent 200 with no email; invalid = 400; too many = 429', async () => {
  assert.equal((await handleEnquiry(good, { env: {}, ip: 'a', today: TODAY })).status, 503);
  let sent = 0;
  const send = async () => { sent += 1; };
  const env = mailEnv(1);
  assert.equal((await handleEnquiry({ ...good, website: 'http://spam' }, { env, ip: 'b', send, today: TODAY })).status, 200);
  assert.equal(sent, 0);
  assert.equal((await handleEnquiry({ ...good, email: 'x' }, { env, ip: 'c', send, today: TODAY })).status, 400);
  const statuses = [];
  for (let i = 0; i < 6; i += 1) statuses.push((await handleEnquiry(good, { env, ip: 'flood', send, today: TODAY })).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
  assert.equal(sent, 5);
  assert.equal(tooMany('z', { limit: 1, now: 0 }), false);
  assert.equal(tooMany('z', { limit: 1, now: 1000 }), true);
  assert.equal(tooMany('z', { limit: 1, now: 11 * 60 * 1000 }), false); // window passed
});

test('http server: API routes, static files, SPA fallback, bad input', async () => {
  const dist = mkdtempSync(join(tmpdir(), 'dist-'));
  writeFileSync(join(dist, 'index.html'), '<h1>site</h1>'); writeFileSync(join(dist, 'a.css'), 'body{}');
  const mails = [];
  const server = createApp({ dist, env: mailEnv(1), send: async (m) => { mails.push(m); } });
  await listen(server, 0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body, raw) => fetch(`${base}/api/enquiry`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: raw ?? JSON.stringify(body) });
  try {
    assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { ok: true, emailConfigured: true });
    assert.equal((await fetch(`${base}/api/enquiry`)).status, 405);
    assert.equal((await fetch(`${base}/api/nothing`)).status, 404);
    assert.equal((await post(null, '{bad json')).status, 400);
    const future = { ...good, checkIn: '2031-01-10', checkOut: '2031-01-13' };
    const ok = await post(future);
    assert.equal(ok.status, 200); assert.deepEqual(await ok.json(), { ok: true });
    assert.equal(mails.length, 1); assert.equal(mails[0].replyTo, 'asha@example.com'); assert.equal(mails[0].to, 'owner@example.com');
    assert.equal((await post({ ...future, phone: '1' })).status, 400);
    assert.equal((await post(null, 'x'.repeat(30000))).status, 413);
    assert.equal(await (await fetch(`${base}/privacy`)).text(), '<h1>site</h1>');
    assert.equal(await (await fetch(`${base}/a.css`)).text(), 'body{}');
    assert.equal((await fetch(`${base}/missing.png`)).status, 404);
    // path traversal must not leak files outside the site folder
    assert.ok(!(await (await fetch(`${base}/..%2f..%2f..%2f..%2fetc%2fpasswd`)).text()).includes('root:'));
  } finally { server.close(); }
});

test('settings file: read with Notepad-style BOM/CRLF/quotes, real environment wins', async () => {
  const { loadEnv } = await import('../server.mjs');
  const f = join(mkdtempSync(join(tmpdir(), 'env-')), 'email-settings.txt');
  writeFileSync(f, '﻿# comment\r\nSMTP_USER_T=a@b.co\r\nSMTP_PASS_T = "abcd efgh"\r\n  # SMTP_X_T=no\r\nKEEP_T=file\r\n');
  process.env.KEEP_T = 'real';
  assert.equal(loadEnv([f, join(tmpdir(), 'nope.env')]), true);
  assert.equal(process.env.SMTP_USER_T, 'a@b.co'); assert.equal(process.env.SMTP_PASS_T, 'abcd efgh');
  assert.equal(process.env.SMTP_X_T, undefined); assert.equal(process.env.KEEP_T, 'real');
  assert.equal(loadEnv([join(tmpdir(), 'nope.env')]), false);
});

test('setup-email: asks, sends a real test email, saves only on success, explains failures', async () => {
  const { main, explain, saveSettings } = await import('../setup-email.mjs');
  const file = join(mkdtempSync(join(tmpdir(), 'setup-')), 'email-settings.txt');
  writeFileSync(file, '# keep me\nSMTP_USER=\nSMTP_PASS=\nMAIL_TO=\nSITE_NAME=Skanda Homestay\n');
  const answers = ['host@example.com', 'abcd efgh ijkl mnop', ''];
  const said = [];
  const base = { SMTP_HOST: '127.0.0.1', SMTP_SECURE: 'false' };

  // wrong password: reported in plain words, nothing saved
  let m = await mockSmtp('badauth');
  let r = await main({ ask: async () => answers.shift() ?? '', say: (t) => said.push(t), file, env: { ...base, SMTP_PORT: String(m.port) } });
  m.server.close();
  assert.equal(r.ok, false);
  assert.match(said.join('\n'), /FAILED[\s\S]*APP PASSWORD/);
  assert.match(readFile(file), /SMTP_PASS=\n/);

  // correct: real SMTP conversation with the mock server, settings saved, other lines kept
  m = await mockSmtp('ok');
  const a2 = ['host@example.com', 'abcd efgh ijkl mnop', 'owner@example.com'];
  said.length = 0;
  r = await main({ ask: async () => a2.shift() ?? '', say: (t) => said.push(t), file, env: { ...base, SMTP_PORT: String(m.port) } });
  m.server.close();
  assert.equal(r.ok, true);
  assert.match(said.join('\n'), /WORKED/);
  assert.equal(m.got.rcpt, '<owner@example.com>');
  assert.match(decodeBody(m.got.data).text, /test message/);
  const saved = readFile(file);
  assert.match(saved, /# keep me/); assert.match(saved, /SMTP_USER=host@example.com/); assert.match(saved, /SMTP_PASS=abcdefghijklmnop/); assert.match(saved, /MAIL_TO=owner@example.com/); assert.match(saved, /SITE_NAME=Skanda Homestay/);

  assert.match(explain('Could not reach the mail server (ENOTFOUND)'), /internet/);
  assert.match(explain('Recipient was refused: 550'), /typed correctly/);
  saveSettings(file, { NEW_KEY: 'x' }); assert.match(readFile(file), /NEW_KEY=x/);
});
function readFile(f) { return readFileSync(f, 'utf8'); }

test('setup-email: first run creates the private settings file from the example, with its comments', async () => {
  const { saveSettings } = await import('../setup-email.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'seed-'));
  writeFileSync(join(dir, 'email-settings.example.txt'), '# explanation\nSMTP_USER=\nSMTP_PASS=\n');
  const file = join(dir, 'email-settings.txt');
  saveSettings(file, { SMTP_USER: 'a@b.co', SMTP_PASS: 'secret' });
  assert.match(readFile(file), /# explanation/); assert.match(readFile(file), /SMTP_PASS=secret/);
  assert.match(readFile(join(dir, 'email-settings.example.txt')), /SMTP_PASS=\n/); // the example is never modified
});
