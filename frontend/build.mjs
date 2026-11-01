// Builds the site into ./dist using esbuild.
//   npm run build   -> production build (minified)
//   npm run dev     -> rebuilds on every save; refresh the browser to see changes
import * as esbuild from 'esbuild';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const watch = process.argv.includes('--watch');

function writeHtml(metafile) {
  const outputs = Object.entries(metafile.outputs);
  const entry = outputs.find(([, o]) => o.entryPoint && o.entryPoint.endsWith('src/main.jsx'));
  if (!entry) throw new Error('Entry output not found');
  const js = '/' + relative(dist, join(root, entry[0])).replaceAll('\\', '/');
  const css = outputs.find(([f]) => f.endsWith('.css'));
  const cssHref = css ? '/' + relative(dist, join(root, css[0])).replaceAll('\\', '/') : null;
  let html = readFileSync(join(root, 'index.html'), 'utf8');
  html = html.replace('<!--CSS-->', cssHref ? `<link rel="stylesheet" href="${cssHref}" />` : '')
             .replace('<!--JS-->', `<script type="module" src="${js}"></script>`);
  writeFileSync(join(dist, 'index.html'), html);
}

function copyPublic() {
  const pub = join(root, 'public');
  if (existsSync(pub)) cpSync(pub, dist, { recursive: true });
}

const options = {
  entryPoints: [join(root, 'src/main.jsx')],
  outdir: join(dist, 'assets'),
  entryNames: '[name]-[hash]',
  chunkNames: 'chunk-[hash]',
  bundle: true,
  splitting: true,
  format: 'esm',
  target: ['es2020'],
  jsx: 'automatic',
  minify: !watch,
  sourcemap: watch,
  metafile: true,
  loader: { '.svg': 'dataurl' },
  define: { 'process.env.NODE_ENV': watch ? '"development"' : '"production"' },
  logLevel: 'info',
};

function fresh() {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
}

if (watch) {
  fresh();
  const ctx = await esbuild.context({
    ...options,
    plugins: [{
      name: 'html',
      setup(b) {
        b.onEnd((r) => { if (r.metafile) { copyPublic(); writeHtml(r.metafile); } });
      },
    }],
  });
  await ctx.watch();
  console.log('Watching for changes. Open http://127.0.0.1:8000 (backend must be running).');
} else {
  fresh();
  const result = await esbuild.build(options);
  copyPublic();
  writeHtml(result.metafile);
  console.log('Built to', dist);
}
