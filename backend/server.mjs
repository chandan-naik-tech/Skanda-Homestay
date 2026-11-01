// The homestay backend: serves the website and receives "Check availability" enquiries, then emails them to the host.
// No admin page, no login, no database. Run it with start.bat (Windows) / ./start.sh (Mac, Linux), or: node backend/server.mjs
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleEnquiry, mailSettings } from './enquiry.mjs';

const here = dirname(fileURLToPath(import.meta.url));

/** Reads backend/email-settings.txt (or .env), KEY=VALUE lines, into process.env without overriding real environment variables. */
export function loadEnv(files = [join(here, 'email-settings.txt'), join(here, '.env')]) {
  const found = [].concat(files).filter((f) => existsSync(f));
  for (const file of found) for (const raw of readFileSync(file, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const m = raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || raw.trim().startsWith('#')) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
  return found.length > 0;
}

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
};
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };

function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let size = 0; const parts = [];
    req.on('data', (c) => { size += c.length; if (size > limit) reject(Object.assign(new Error('too large'), { tooLarge: true })); else if (size <= limit) parts.push(c); });
    req.on('end', () => resolve(Buffer.concat(parts).toString('utf8')));
    req.on('error', reject);
  });
}

/** Creates the HTTP server. `dist` is the built website folder. `env` can be replaced in tests. */
export function createApp({ dist, env = process.env, send } = {}) {
  return createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

      if (urlPath === '/api/health') return json(res, 200, { ok: true, emailConfigured: mailSettings(env).configured });

      if (urlPath === '/api/enquiry') {
        if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { ok: false, error: 'method' }); }
        let body;
        try { body = JSON.parse(await readBody(req)); } catch (e) { return json(res, e.tooLarge ? 413 : 400, { ok: false, error: 'invalid', errors: {} }); }
        const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
        const out = await handleEnquiry(body, { env, ip, send });
        return json(res, out.status, out.json);
      }
      if (urlPath.startsWith('/api/')) return json(res, 404, { ok: false, error: 'not-found' });

      const file = normalize(join(dist, urlPath));
      if (file.startsWith(dist + sep) && existsSync(file) && statSync(file).isFile()) {
        res.writeHead(200, { 'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream' });
        return createReadStream(file).pipe(res);
      }
      if (extname(urlPath)) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); // pages such as /privacy
      createReadStream(join(dist, 'index.html')).pipe(res);
    } catch {
      if (!res.headersSent) json(res, 500, { ok: false, error: 'server' }); else res.end();
    }
  });
}

/** Starts listening. Resolves with the running server, rejects with a readable message. */
export function listen(server, port, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    server.once('error', (e) => reject(Object.assign(new Error(e.code === 'EADDRINUSE' ? `Port ${port} is already in use. The website may already be running at http://${host}:${port}` : String(e)), { code: e.code })));
    server.listen(port, host, () => resolve(server));
  });
}

// Run directly: node backend/server.mjs
if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  loadEnv();
  const dist = join(here, '..', 'frontend', 'dist');
  const port = Number(process.env.PORT || 8000);
  if (!existsSync(join(dist, 'index.html'))) { console.log('The website is not built yet. Run start.bat / ./start.sh once, or: cd frontend && npm install && npm run build'); process.exit(1); }
  listen(createApp({ dist }), port, process.env.HOST || '127.0.0.1')
    .then(() => console.log(`Website and backend running at http://${process.env.HOST || '127.0.0.1'}:${port}  (email ${mailSettings().configured ? 'connected' : 'NOT connected yet: see backend/README.md'})`))
    .catch((e) => { console.log(`PROBLEM: ${e.message}`); process.exit(1); });
}
