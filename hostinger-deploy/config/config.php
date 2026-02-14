<?php
// Complete Production Config for Hostinger - Lakshmi Dairy

// ===== DATABASE CONFIGURATION =====
define('DB_HOST', 'localhost');
define('DB_NAME', 'u478906159_lakshmi');
define('DB_USER', 'u478906159_lakshmi');
define('DB_PASS', 'Arunasai@53');

// ===== CORS HEADERS =====
$allowed_origins = [
    'https://lakshmidairy.site',
    'https://www.lakshmidairy.site'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ===== SESSION =====
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ===== DATABASE CONNECTION FUNCTION =====
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

// ===== RESPONSE FUNCTIONS =====
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

// ===== SNAKE_CASE TO CAMEL_CASE CONVERTER =====
function snakeToCamel($array) {
    if (!is_array($array)) {
        return $array;
    }
    
    $result = [];
    foreach ($array as $key => $value) {
        $camelKey = lcfirst(str_replace('_', '', ucwords($key, '_')));
        if (is_array($value)) {
            $result[$camelKey] = array_map('snakeToCamel', $value);
        } else {
            $result[$camelKey] = $value;
        }
    }
    return $result;
}

// ===== JSON INPUT PARSER =====
function getJsonInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON input', 400);
    }
    return $input ?? [];
}

// ===== AUTHENTICATION FUNCTIONS =====
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        sendError('Authentication required', 401);
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

function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

// ===== TIMEZONE =====
date_default_timezone_set('Asia/Kolkata');
?>

