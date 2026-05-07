
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
  const jsonData = JSON.stringify(postData);
  console.log("webhooked success length:" + jsonData.length);
  console.log(jsonData);  
  
  // Map Phone Number IDs to destination configurations
  const phoneNumberConfigs = {
    "1008222085716768": {  // Phone Number ID
      name: 'consoltech_solutions_limited',
      hostname: '3a11-105-161-224-70.ngrok-free.app',
      port: 443,
      path: '/whatsapp/whatsapp.php',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData)
      }
    },
    // Add more Phone Number IDs here
    "15550100627": {  // Example for another phone number
      name: 'another_client',
      hostname: 'another-server.com',
      port: 443,
      path: '/api/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData)
      }
    }
  };
  
  // Extract the Phone Number ID from the webhook
  const phoneNumberId = postData?.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
  
  if (!phoneNumberId) {
    console.error("Could not extract phone_number_id from webhook");
    return;
  }
  
  console.log(`Looking up configuration for phone_number_id: ${phoneNumberId}`);
  
  // Find configuration for this phone number
  const targetConfig = phoneNumberConfigs[phoneNumberId];
  
  if (!targetConfig) {
    console.warn(`No configuration found for phone_number_id: ${phoneNumberId}`);
    console.log(`Available phone numbers: ${Object.keys(phoneNumberConfigs).join(', ')}`);
    return;
  }
  
  console.log(`Matched to: ${targetConfig.name}`);
  console.log(`Sending to: ${targetConfig.hostname}${targetConfig.path}`);
  
  const options = {
    hostname: targetConfig.hostname,
    port: targetConfig.port,
    path: targetConfig.path,
    method: targetConfig.method,
    headers: targetConfig.headers
  };

  // Send the request
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Server Response:', data);
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error.message);
    console.error('Request destination:', `${targetConfig.hostname}${targetConfig.path}`);
    console.error('Request headers:', JSON.stringify(targetConfig.headers, null, 2));
    console.error('Request body:', jsonData);
  });
  
  req.write(jsonData);
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
// Updated: 02/05/2026 21:24:29.01 
// Updated: 07/05/2026  5:31:21.69 
// Updated: 07/05/2026  5:44:38.53 
// Updated: 07/05/2026  5:54:54.79 
// Updated: 07/05/2026 10:42:12.21 
