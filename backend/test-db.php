<?php
header('Content-Type: application/json');

// Test database connection
define('DB_HOST', 'localhost');
define('DB_NAME', 'ldp_software');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $conn = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS
    );
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'database' => DB_NAME,
        'php_version' => phpversion()
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
