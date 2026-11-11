/**
 * Fleet Tracker Pro — Central HTTP Server
 * Serves:
 * - Admin Dashboard: http://localhost:5000/admin/
 * - Driver Mobile Portal: http://localhost:5000/driver/
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT, 10) || 5000;
const ROOT_DIR = __dirname;

// ── Real Indian SMS Gateway Configuration ─────────────────────
// To send REAL SMS to physical mobile phones in India, paste your Fast2SMS API Key below
// Free signup at: https://www.fast2sms.com
const SMS_CONFIG = {
  fast2smsApiKey: process.env.FAST2SMS_API_KEY || '', // <-- Paste Fast2SMS API Key here
};

/**
 * Dispatch real live SMS via Fast2SMS Indian Telecom Gateway
 */
function sendLiveFast2Sms(apiKey, numbers, message, callback) {
  const postData = JSON.stringify({
    route: 'q',
    message: message,
    language: 'english',
    flash: 0,
    numbers: numbers
  });

  const options = {
    hostname: 'www.fast2sms.com',
    port: 443,
    path: '/dev/bulkV2',
    method: 'POST',
    headers: {
      'authorization': apiKey,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      console.log(`[REAL TELECOM SMS] Fast2SMS Live Response:`, data);
      if (callback) callback(null, data);
    });
  });

  req.on('error', (e) => {
    console.error(`[REAL TELECOM SMS] Fast2SMS Live Error:`, e.message);
    if (callback) callback(e);
  });

  req.write(postData);
  req.end();
}

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
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  let reqUrl = req.url.split('?')[0];

  // ── SMS Gateway API Endpoint ─────────────────────────────────
  if (req.method === 'POST' && reqUrl === '/api/send-driver-sms') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const driverName = payload.driverName || 'Driver';
        const phone = payload.phone || '';
        const truckPlate = payload.truckPlate || 'Assigned Truck';
        const tollFree = payload.tollFree || '1800-419-7890';
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const destination = payload.destination || 'Sriperumbudur Logistics Hub';
        const smsContent = `Vanakkam ${driverName}! Ungal Vandi: ${truckPlate} | Enga Ponum: ${destination}. Vandi start panradhuku munnadi intha number-ku oru missed call kuduthutu start pannunga: ${tollFree} (Trip automatic-ah start aagidum). Destination reach aana udane thirumba oru missed call kudunga. - Bharath Swift Logistics`;

        const cleanNumber = phone.replace(/\D/g, '').slice(-10);
        let liveSent = false;

        if (SMS_CONFIG.fast2smsApiKey && cleanNumber.length === 10) {
          sendLiveFast2Sms(SMS_CONFIG.fast2smsApiKey, cleanNumber, smsContent);
          liveSent = true;
        }

        console.log(`\n=======================================================`);
        console.log(`[TELECOM SMS GATEWAY] Dispatching to ${phone} (${driverName}):`);
        console.log(`Message: "${smsContent}"`);
        console.log(`Live Delivery to GSM Handset: ${liveSent ? 'ACTIVE (Fast2SMS)' : 'SIMULATED (Need Fast2SMS API Key for real phone delivery)'}`);
        console.log(`Time: ${timeStr}`);
        console.log(`=======================================================\n`);

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        return res.end(JSON.stringify({
          success: true,
          phone: phone,
          message: smsContent,
          time: timeStr
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

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
