<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'ldp_software');
define('DB_USER', 'root');
define('DB_PASS', '');

// CORS Configuration
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $conn;
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}

// Response helpers
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['error' => $message]);
    exit();
}

// Convert snake_case to camelCase
function snakeToCamel($array) {
    if (!is_array($array)) {
        return $array;
    }
    
    $result = [];
    foreach ($array as $key => $value) {
        // Convert snake_case to camelCase
        $camelKey = lcfirst(str_replace('_', '', ucwords($key, '_')));
        
        // Recursively convert nested arrays
        if (is_array($value)) {
            $result[$camelKey] = array_map('snakeToCamel', $value);
        } else {
            $result[$camelKey] = $value;
        }
    }
    return $result;
}

// Get JSON input
function getJsonInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON input', 400);
    }
    return $input;
}

// Session management
session_start();

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        sendError('Unauthorized', 401);
    }
    return $_SESSION['user_id'];
}

function getCurrentUser() {
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email'],
        'role' => $_SESSION['role']
    ];
}
