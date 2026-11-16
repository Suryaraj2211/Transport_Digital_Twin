const https = require('https');

/**
 * Dispatch real live SMS via Fast2SMS Indian Telecom Gateway
 */
function sendLiveFast2Sms(apiKey, numbers, message) {
  return new Promise((resolve, reject) => {
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
        resolve(data);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const driverName = payload.driverName || 'Driver';
    const phone = payload.phone || '';
    const truckPlate = payload.truckPlate || 'Assigned Truck';
    const tollFree = payload.tollFree || '1800-419-7890';
    const destination = payload.destination || 'Sriperumbudur Logistics Hub';

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const smsContent = `Vanakkam ${driverName}! Ungal Vandi: ${truckPlate} | Enga Ponum: ${destination}. Vandi start panradhuku munnadi intha number-ku oru missed call kuduthutu start pannunga: ${tollFree} (Trip automatic-ah start aagidum). Destination reach aana udane thirumba oru missed call kudunga. - V3 Logistics`;

    const cleanNumber = phone.replace(/\D/g, '').slice(-10);
    const apiKey = process.env.FAST2SMS_API_KEY || '';
    let liveSent = false;

    if (apiKey && cleanNumber.length === 10) {
      try {
        await sendLiveFast2Sms(apiKey, cleanNumber, smsContent);
        liveSent = true;
      } catch (err) {
        console.error('[SMS Gateway] Fast2SMS Live Error:', err.message);
      }
    }

    console.log(`[SMS Gateway] Dispatched to ${phone} (${driverName}) | Live: ${liveSent}`);

    return res.status(200).json({
      success: true,
      phone: phone,
      message: smsContent,
      time: timeStr,
      liveSent: liveSent
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
};

