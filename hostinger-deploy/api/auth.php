<?php
require_once __DIR__ . '/../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Get action from query parameter
$action = $_GET['action'] ?? '';

// Login
if ($method === 'POST' && $action === 'login') {
    $input = getJsonInput();
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? '';
    
    if (empty($username) || empty($password) || empty($role)) {
        sendError('Username, password, and role are required');
    }
    
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ? AND role = ?");
    $stmt->execute([$username, $username, $password, $role]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendError('Invalid credentials or role mismatch', 401);
    }
    
    // Set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    
    sendResponse([
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);
}

// Logout
if ($method === 'POST' && $action === 'logout') {
    session_destroy();
    sendResponse(['message' => 'Logged out successfully']);
}

// Get current user
if ($method === 'GET' && $action === 'me') {
    $user = getCurrentUser();
    if ($user) {
        sendResponse($user);
    } else {
        sendError('Not authenticated', 401);
    }
}

sendError('Not found', 404);
