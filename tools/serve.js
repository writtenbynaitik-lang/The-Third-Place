/**
 * Minimal static server for local preview.
 *
 *   node tools/serve.js <dir> <port>
 *
 * Deliberately small, but not naive: paths are resolved and then checked to be
 * inside the served root, so `..` traversal and symlink escapes both fail.
 */

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import { join, resolve, extname, sep } from 'node:path';

const DIR = resolve(process.argv[2] || 'dist');
const PORT = Number(process.argv[3] || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

let ROOT_REAL = DIR;

function send(res, code, body, headers = {}) {
  res.writeHead(code, { 'content-type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);

    if (pathname.endsWith('/')) pathname += 'index.html';

    // Resolve, then verify containment. Checking the *real* path also defeats
    // a symlink pointing outside the root.
    const candidate = resolve(join(DIR, pathname));
    let real;
    try {
      real = await realpath(candidate);
    } catch {
      return send(res, 404, 'Not found');
    }

    if (real !== ROOT_REAL && !real.startsWith(ROOT_REAL + sep)) {
      return send(res, 403, 'Forbidden');
    }

    const info = await stat(real);
    if (info.isDirectory()) return send(res, 404, 'Not found');

    const ext = extname(real).toLowerCase();
    const type = TYPES[ext] || 'application/octet-stream';

    // Markup, styles and scripts are never cached: during review a rebuild
    // must always be picked up, and a stale app.js is a genuinely confusing
    // thing to debug. Media and fonts are content-stable, so they may cache.
    const cache = ['.html', '.json', '.css', '.js', '.mjs', '.webmanifest'].includes(ext)
      ? 'no-store'
      : 'public, max-age=3600';

    res.writeHead(200, {
      'content-type': type,
      'content-length': info.size,
      'cache-control': cache,
      'x-content-type-options': 'nosniff',
    });
    createReadStream(real).pipe(res);
  } catch (err) {
    send(res, 500, 'Server error');
  }
});

ROOT_REAL = await realpath(DIR);

// Exiting quietly on a busy port means you end up testing somebody else's
// site at the same address and wondering why nothing you change takes effect.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n  Port ${PORT} is already in use by another process.\n` +
        `  Stop it, or run with a different port:\n` +
        `    node tools/serve.js ${process.argv[2] || 'dist'} ${PORT + 1}\n`
    );
  } else {
    console.error(`\n  Server error: ${err.message}\n`);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`\n  Serving ${DIR}`);
  console.log(`  → http://localhost:${PORT}\n`);
});
