/**
 * Fleet Tracker Pro — Central HTTP Server
 * Serves:
 * - Admin Dashboard: http://localhost:5000/admin/
 * - Driver Mobile Portal: http://localhost:5000/driver/
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT, 10) || 5000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  // Clean trailing slashes & normalize
  if (reqUrl === '/') {
    res.writeHead(302, { 'Location': '/admin/' });
    return res.end();
  }

  if (reqUrl === '/admin') {
    res.writeHead(301, { 'Location': '/admin/' });
    return res.end();
  }

  if (reqUrl === '/driver') {
    res.writeHead(301, { 'Location': '/driver/' });
    return res.end();
  }

  if (reqUrl === '/admin/') {
    reqUrl = '/admin/index.html';
  } else if (reqUrl === '/driver/') {
    reqUrl = '/driver/index.html';
  }

  // Handle direct file requests from subdirs if requested without prefix
  if (reqUrl === '/admin.css' || reqUrl === '/admin.js') {
    reqUrl = '/admin' + reqUrl;
  } else if (reqUrl === '/driver.css' || reqUrl === '/driver.js') {
    reqUrl = '/driver' + reqUrl;
  }

  let filePath = path.join(ROOT_DIR, reqUrl);

  // Security check: ensure path stays within ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>404 — Not Found: ${reqUrl}</h2>
          <p><a href="/admin/">Go to Admin Dashboard</a> | <a href="/driver/">Go to Driver Portal</a></p>
        </div>
      `);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function startServer(portToTry) {
  server.listen(portToTry, () => {
    console.log(`=======================================================`);
    console.log(`  Fleet Tracker Pro is Running!`);
    console.log(`  -----------------------------------------------------`);
    console.log(`  🏢 Admin Operations Dashboard:`);
    console.log(`     👉 http://localhost:${portToTry}/admin/`);
    console.log(``);
    console.log(`  🚚 Driver Mobile Portal (One-Tap Start/Stop):`);
    console.log(`     👉 http://localhost:${portToTry}/driver/`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${portToTry} is busy, trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
