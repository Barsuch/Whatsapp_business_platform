const https = require('https');

function getAppAccessToken(appId, appSecret) {6
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'client_credentials'
    });

    const url = `https://graph.facebook.com/oauth/access_token?${params}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => (data += chunk));

      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }

        try {
          const parsed = JSON.parse(data);
          if (!parsed.access_token) {
            return reject(new Error(`Invalid response: ${data}`));
          }
          resolve(parsed.access_token);
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Request error: ${err.message}`));
    });
  });
}

// Usage
const appId     = process.env.META_APP_ID;     // set via environment variable
const appSecret = process.env.META_APP_SECRET; // set via environment variable

if (!appId || !appSecret) {
  console.error('Missing META_APP_ID or META_APP_SECRET environment variables.');
  process.exit(1);
}

getAppAccessToken(appId, appSecret)
  .then((token) => console.log('Access Token:', token))
  .catch((err) => {
    console.error('Failed to retrieve access token:', err.message);
    process.exit(1);
  });// Updated: 01/11/2026 23:40:09.30 
