// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

//post to backend server function
function post_to_server(postData) {
  const https = require('https');

  const options = {
      hostname: '14c3c6d4af65.ngrok-free.app',
      port: 443,
      path: '/hotel/emerald/hotel-admin/whatsapp/index.php',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
      }
  };

  const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      
      let data = '';
      res.on('data', (chunk) => {
          data += chunk;
      });
      
      res.on('end', () => {
          console.log('Response:', JSON.parse(data));
      });
  });

  req.on('error', (error) => {
      console.error('Request error:', error);
  });

  req.write(postData);
  req.end();
}

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  var hooked = JSON.stringify(req.body, null, 2);
  console.log(hooked);
  post_to_server(hooked);
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});