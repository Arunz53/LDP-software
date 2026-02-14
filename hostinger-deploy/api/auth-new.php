<?php
// Standalone Auth - No dependencies on config.php functions

// CORS Headers first
header('Access-Control-Allow-Origin: https://lakshmidairy.site');
header('Access-Control-Allow-Origin: https://www.lakshmidairy.site');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start session before anything
session_start();

// Database config
$db_host = 'localhost';
$db_name = 'u478906159_lakshmi';
$db_user = 'u478906159_lakshmi';
$db_pass = 'Arunasai@53';

// Connect to DB
try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch(PDOException $e) {
    http_response_code(500);
    exit(json_encode(['error' => 'Database error: ' . $e->getMessage()]));
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// LOGIN
if ($method === 'POST' && $action === 'login') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? '';
    
    if (!$username || !$password || !$role) {
        http_response_code(400);
        exit(json_encode(['error' => 'Missing credentials']));
    }
    
    $sql = "SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ? AND role = ?";
    $stmt = $pdo->prepare($sql);
    
    if (!$stmt->execute([$username, $username, $password, $role])) {
        http_response_code(500);
        exit(json_encode(['error' => 'Query failed']));
    }
    
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        exit(json_encode(['error' => 'Invalid credentials or role mismatch']));
    }
    
    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    
    http_response_code(200);
    echo json_encode([
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);
    exit();
}

// GET CURRENT USER
if ($method === 'GET' && $action === 'me') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        exit(json_encode(['error' => 'Not authenticated']));
    }
    
    http_response_code(200);
    echo json_encode([
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email'],
        'role' => $_SESSION['role']
    ]);
    exit();
}

// LOGOUT
if ($method === 'POST' && $action === 'logout') {
    session_destroy();
    http_response_code(200);
    echo json_encode(['message' => 'Logged out']);
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
?>
