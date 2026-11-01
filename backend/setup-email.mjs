// Connects the host's Gmail to the website and PROVES it works by sending a real test email.
//   Windows: double-click setup-email.bat      Mac/Linux: ./setup-email.sh      (or: node backend/setup-email.mjs)
//   Only test the saved settings:  node backend/setup-email.mjs --check
import { createInterface } from 'node:readline';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mailSettings } from './enquiry.mjs';
import { sendMail } from './smtp.mjs';
import { loadEnv } from './server.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const SETTINGS_FILE = process.env.EMAIL_SETTINGS_FILE || join(here, 'email-settings.txt');

/** Plain-words advice for the errors people actually meet. */
export function explain(message) {
  const m = String(message);
  if (/Sign-in|535|534|530|Username and Password|Application-specific/i.test(m)) return 'Gmail did not accept the sign-in. Use the 16-letter APP PASSWORD from https://myaccount.google.com/apppasswords (not your normal Gmail password). 2-Step Verification must be switched on first.';
  if (/Could not reach|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ECONNRESET|did not answer/i.test(m)) return 'Could not connect to Gmail. Check the internet connection (and that a firewall or antivirus is not blocking Node.js), then try again.';
  if (/Recipient|550|553/i.test(m)) return 'Gmail would not deliver to that address. Check that the "deliver enquiries to" address is typed correctly.';
  return 'The mail server refused the message. The text above says why.';
}

/** Writes the settings file, keeping any other lines it already had. */
export function saveSettings(file, values) {
  // first run: start from the example file (it has the explanation comments); the real file is created next to it
  const example = join(dirname(file), 'email-settings.example.txt');
  const source = existsSync(file) ? file : existsSync(example) ? example : null;
  const lines = source ? readFileSync(source, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/) : [];
  const left = { ...values };
  const out = lines.map((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (m && !line.trim().startsWith('#') && m[1] in left) { const v = left[m[1]]; delete left[m[1]]; return `${m[1]}=${v}`; }
    return line;
  });
  for (const [k, v] of Object.entries(left)) out.push(`${k}=${v}`);
  writeFileSync(file, `${out.join('\n').replace(/\n+$/, '')}\n`);
}

/** Sends the test email. Returns { ok, error }. */
export async function sendTest(s, send = sendMail) {
  try {
    await send({
      host: s.host, port: s.port, secure: s.secure, rejectUnauthorized: s.rejectUnauthorized, user: s.user, pass: s.pass,
      from: s.from || s.user, fromName: s.brand, to: s.to,
      subject: `Test: enquiry emails are connected | ${s.brand}`,
      text: `This is a test message from the ${s.brand} website setup.\n\nIf you can read this in your inbox, guests who press "Send enquiry to the host" will reach you here, and pressing Reply answers the guest.\n`,
    });
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
}

export async function main({ ask, say = console.log, file = SETTINGS_FILE, env = process.env, checkOnly = false, send = sendMail } = {}) {
  loadEnv(file);
  let s = mailSettings(env);
  if (!checkOnly) {
    say('\nConnect the homestay email (so enquiries arrive in your inbox)\n');
    say('You need a Gmail APP PASSWORD (16 letters):');
    say('  1. Turn on 2-Step Verification: https://myaccount.google.com/security');
    say('  2. Create an app password:     https://myaccount.google.com/apppasswords\n');
    const user = (await ask(`Gmail address to send from [${s.user || 'Samarthanaik55@gmail.com'}]: `)).trim() || s.user || 'Samarthanaik55@gmail.com';
    const pass = (await ask('Paste the app password (spaces are fine): ')).replace(/\s+/g, '') || s.pass;
    const to = (await ask(`Deliver enquiries to [${s.to || user}]: `)).trim() || s.to || user;
    s = mailSettings({ ...env, SMTP_USER: user, SMTP_PASS: pass, MAIL_TO: to });
  }
  if (!s.configured) { say('\nNo app password yet. Run this again when you have it.'); return { ok: false, error: 'not-configured' }; }

  say(`\nSending a test email to ${s.to} ...`);
  const r = await sendTest(s, send);
  if (!r.ok) {
    say(`\nFAILED: ${r.error}\n${explain(r.error)}\n`);
    say('Nothing was saved. Fix the problem above and run this again.');
    return r;
  }
  if (!checkOnly) saveSettings(file, { SMTP_USER: s.user, SMTP_PASS: s.pass, MAIL_TO: s.to, SITE_NAME: s.brand });
  say(`\nWORKED. A test email was sent to ${s.to}. Open that inbox (and Spam) to see it.`);
  if (!checkOnly) say('Your settings are saved. Close the website window and start it again with start.bat. For Vercel, copy the same values into Settings > Environment Variables.');
  return r;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answers = [];
  let closed = false;
  rl.on('close', () => { closed = true; });
  const queue = [];
  const waiting = [];
  rl.on('line', (l) => (waiting.length ? waiting.shift()(l) : queue.push(l)));
  const ask = (q) => new Promise((res) => { process.stdout.write(q); if (queue.length) { const a = queue.shift(); process.stdout.write('\n'); res(a); } else if (closed) res(''); else waiting.push(res); });
  const r = await main({ ask, checkOnly: process.argv.includes('--check') });
  rl.close();
  process.exit(r.ok ? 0 : 1);
}
