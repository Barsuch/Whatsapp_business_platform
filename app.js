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
  
  // Convert to JSON string
  const jsonData = JSON.stringify(postData);
  console.log("webhooked success length:"+jsonData.length);
  
  const options = {
      hostname: '201d2636b4db.ngrok-free.app',
      port: 443,
      path: '/hotel/emerald/hotel-admin/whatsapp/index.php',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json', // Changed from application/text
          'Content-Length': Buffer.byteLength(jsonData)
      }
  };

  const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
          data += chunk;
      });
      
      res.on('end', () => {
          console.log('PHP Response:', data);
      });
  });

  req.on('error', (error) => {
      console.error('Request error:', error);
  });

  req.write(jsonData); // Send JSON string
  req.end();
}

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  post_to_server(req.body);
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
