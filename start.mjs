#!/usr/bin/env node
// One-click launcher for the homestay website and its backend. No login, no admin, no Python.
//   Windows: double-click start.bat      Mac/Linux: ./start.sh      (or: node start.mjs)
// It serves the ready-built website at http://127.0.0.1:8000 together with the enquiry backend (backend/server.mjs).
// Only when you change files in frontend/ (and the website tools are installed) is the site rebuilt first.
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const front = join(root, 'frontend');
const dist = join(front, 'dist');
const built = join(dist, 'index.html');
const firstPort = Number(process.env.PORT || 8000);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const say = (m = '') => console.log(m);
const fail = (m) => { say(`\nPROBLEM: ${m}`); process.exit(1); };

const run = (args) => spawnSync(npm, args, { cwd: front, stdio: 'inherit', shell: process.platform === 'win32' }).status === 0;

function newest(dir) {
  let t = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    t = Math.max(t, s.isDirectory() ? newest(p) : s.mtimeMs);
  }
  return t;
}

function ensureBuilt() {
  const haveSite = existsSync(built);
  const haveTools = existsSync(join(front, 'node_modules', 'esbuild'));
  const sources = Math.max(newest(join(front, 'src')), newest(join(front, 'public')), statSync(join(front, 'index.html')).mtimeMs);
  const stale = !haveSite || sources > statSync(built).mtimeMs + 2000;

  if (haveSite && (!stale || !haveTools)) return; // the ready-built site is used as it is: no internet needed
  if (!haveTools) {
    say('\n=== Installing the website tools (internet needed, first time only)');
    if (!run(['install', '--no-audit', '--no-fund'])) fail('Installing failed. Check your internet connection and run this file again.');
  }
  say('\n=== Building the website');
  if (!run(['run', 'build'])) fail('Building the website failed. The messages above say why.');
}

say('Homestay website launcher');
if (Number(process.versions.node.split('.')[0]) < 18) fail(`Your Node.js is version ${process.versions.node}. Please install the LTS version from https://nodejs.org`);
ensureBuilt();

const { createApp, listen, loadEnv } = await import('./backend/server.mjs');
const { mailSettings } = await import('./backend/enquiry.mjs');
const hasEnv = loadEnv();
// Port 8000 can be taken by an older copy of this site still open in another window, or by another program.
// In that case use the next free port instead of stopping.
let port = firstPort;
const app = createApp({ dist });
for (;;) {
  try { await listen(app, port); break; } catch (e) {
    if (e.code === 'EADDRINUSE' && port < firstPort + 30) { say(`Port ${port} is busy (maybe an older copy of the site is still open in another window). Trying ${port + 1}...`); port += 1; continue; }
    fail(e.message);
  }
}
const url = `http://127.0.0.1:${port}`;
say(`\n=== The website is running\n  Open: ${url}\n  Stop: press Ctrl+C in this window`);
if (mailSettings().configured) say('  Enquiries: emails are connected, they go straight to the host.');
else say(`  Enquiries: email is NOT connected yet${hasEnv ? ' (backend/email-settings.txt has no app password yet)' : ''}. Enquiries will use the backup route until you do the 2-minute setup in backend/README.md`);
say();
if (!process.argv.includes('--no-browser')) {
  const opener = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(opener[0], opener[1], { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
}
