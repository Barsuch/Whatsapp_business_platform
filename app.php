<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get port and verify token from environment variables or defaults
$port = getenv('PORT') ?: 3000;
$verifyToken = getenv('VERIFY_TOKEN') ?: '';

// Handle CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Route for GET requests
if ($method === 'GET') {
    // Get query parameters
    $mode = $_GET['hub.mode'] ?? '';
    $challenge = $_GET['hub.challenge'] ?? '';
    $token = $_GET['hub.verify_token'] ?? '';
    
    if ($mode === 'subscribe' && $token === $verifyToken) {
        error_log('WEBHOOK VERIFIED');
        http_response_code(200);
        header('Content-Type: text/plain');
        echo $challenge;
    } else {
        http_response_code(403);
    }
    exit();
}

// Route for POST requests
if ($method === 'POST') {
    // Get the raw POST data
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    
    $timestamp = date('Y-m-d H:i:s');
    error_log("\n\nWebhook received $timestamp\n");
    error_log(json_encode($data, JSON_PRETTY_PRINT));
    
    http_response_code(200);
    exit();
}

// If no route matches, return 404
http_response_code(404);
echo 'Not Found';