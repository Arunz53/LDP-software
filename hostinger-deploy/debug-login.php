<?php
header('Content-Type: application/json');

// EXACT same credentials as Hostinger
define('DB_HOST', 'localhost');
define('DB_NAME', 'u478906159_lakshmi');
define('DB_USER', 'u478906159_lakshmi');
define('DB_PASS', 'Arunasai@53');

$debug = [];

try {
    // Connect
    $conn = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS
    );
    $debug['connection'] = 'SUCCESS';
    
    // Test exact login query
    $username = 'lab';
    $password = 'lab123';
    $role = 'lab-report';
    
    $debug['test_login'] = [
        'username' => $username,
        'password' => $password,
        'role' => $role
    ];
    
    // Run exact query
    $stmt = $conn->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ? AND role = ?");
    $stmt->execute([$username, $username, $password, $role]);
    $user = $stmt->fetch();
    
    if ($user) {
        $debug['result'] = 'LOGIN SUCCESS';
        $debug['user'] = $user;
    } else {
        $debug['result'] = 'NO USER FOUND';
        
        // Check if user exists at all
        $stmt2 = $conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt2->execute([$username]);
        $user2 = $stmt2->fetch();
        
        if ($user2) {
            $debug['user_found'] = $user2;
            $debug['password_match'] = ($user2['password'] === $password) ? 'YES' : 'NO';
            $debug['role_match'] = ($user2['role'] === $role) ? 'YES' : 'NO';
        } else {
            $debug['user_in_db'] = 'NO';
        }
    }
    
} catch(Exception $e) {
    $debug['error'] = $e->getMessage();
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>
