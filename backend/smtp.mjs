// A tiny SMTP client (no packages needed). Sends one plain-text email.
// Works with Gmail (smtp.gmail.com, port 465, an "App password") and any other SMTP service that offers a secure port 465.
import net from 'node:net';
import tls from 'node:tls';
import { randomUUID } from 'node:crypto';

const clean = (s) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim(); // no line breaks in headers: stops header injection
const angle = (addr) => `<${clean(addr).replace(/[<>\s]/g, '')}>`;
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const wrap76 = (s) => s.replace(/.{1,76}/g, '$&\r\n').trimEnd();

/** Builds the raw email (headers + body) with UTF-8 and CRLF line ends. Exported for tests. */
export function buildMessage({ from, fromName, to, replyTo, subject, text, date = new Date(), domain = 'localhost' }) {
  const head = [
    `Date: ${date.toUTCString().replace('GMT', '+0000')}`,
    `From: ${fromName ? `=?UTF-8?B?${b64(clean(fromName))}?= ` : ''}${angle(from)}`,
    `To: ${angle(to)}`,
  ];
  if (replyTo) head.push(`Reply-To: ${angle(replyTo)}`);
  head.push(
    `Subject: =?UTF-8?B?${b64(clean(subject))}?=`,
    `Message-ID: <${randomUUID()}@${clean(domain) || 'localhost'}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  );
  return `${head.join('\r\n')}\r\n\r\n${wrap76(b64(String(text).replace(/\r?\n/g, '\r\n')))}\r\n`;
}

/**
 * Sends the email. Rejects with an Error (message says which step failed) if anything goes wrong.
 * opts: host, port, secure (true = TLS from the start, port 465), user, pass, from, fromName, to, replyTo, subject, text, timeoutMs, rejectUnauthorized
 */
export function sendMail(opts) {
  const { host, port = 465, secure = true, user, pass, from, to, timeoutMs = 20000, rejectUnauthorized = true } = opts;
  if (!host || !from || !to) return Promise.reject(new Error('SMTP is not configured (host, from, to).'));

  return new Promise((resolve, reject) => {
    const socket = secure
      ? tls.connect({ host, port, servername: host, rejectUnauthorized })
      : net.connect({ host, port });
    let buffer = '';
    let waiter = null;
    let done = false;
    const queue = [];

    const finish = (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      socket.destroy();
      err ? reject(err) : resolve();
    };
    const timer = setTimeout(() => finish(new Error('The mail server did not answer in time.')), timeoutMs);

    const deliver = (reply) => { if (waiter) { const w = waiter; waiter = null; w(reply); } else queue.push(reply); };
    socket.setEncoding('utf8');
    socket.on('data', (chunk) => {
      buffer += chunk;
      let idx;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).replace(/\r$/, '');
        buffer = buffer.slice(idx + 1);
        // a reply ends at the first line shaped "250 text" (continuations are "250-text")
        if (/^\d{3}( |$)/.test(line)) deliver({ code: Number(line.slice(0, 3)), line });
      }
    });
    socket.on('error', (e) => finish(new Error(`Could not reach the mail server (${e.code || e.message}).`)));
    socket.on('close', () => finish(new Error('The mail server closed the connection.')));

    const next = () => (queue.length ? Promise.resolve(queue.shift()) : new Promise((r) => { waiter = r; }));
    const step = async (command, ok, what) => {
      if (command !== null) socket.write(`${command}\r\n`);
      const reply = await next();
      if (!ok.includes(reply.code)) throw new Error(`${what} was refused by the mail server: ${reply.line}`);
    };

    (async () => {
      await step(null, [220], 'Connecting');
      await step(`EHLO ${clean(opts.domain) || 'localhost'}`, [250], 'Hello');
      if (user) await step(`AUTH PLAIN ${b64(`\0${user}\0${pass}`)}`, [235], 'Sign-in (check the email address and the app password)');
      await step(`MAIL FROM:${angle(from)}`, [250], 'Sender');
      await step(`RCPT TO:${angle(to)}`, [250, 251], 'Recipient');
      await step('DATA', [354], 'Message start');
      const raw = buildMessage(opts).replace(/^\./gm, '..'); // dot-stuffing
      await step(`${raw}\r\n.`, [250], 'Message');
      socket.write('QUIT\r\n');
      finish();
    })().catch(finish);
  });
}
