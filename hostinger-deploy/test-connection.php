<?php
// Test Database Connection

define('DB_HOST', 'localhost');
define('DB_NAME', 'u478906159_lakshmi');
define('DB_USER', 'u478906159_lakshmi');
define('DB_PASS', 'Arunasai@53');

echo "Testing Connection...\n";
echo "Host: " . DB_HOST . "\n";
echo "Database: " . DB_NAME . "\n";
echo "User: " . DB_USER . "\n\n";

try {
    // Connect
    $conn = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS
    );
    echo "✅ Database Connection: SUCCESS\n\n";
    
    // Check users table
    $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Users Table Found\n";
    echo "   Total Users: " . $result['count'] . "\n\n";
    
    // Show users
    $stmt = $conn->query("SELECT * FROM users");
    $users = $stmt->fetchAll();
    echo "Users in Database:\n";
    foreach($users as $user) {
        echo "  - " . $user['username'] . " (Role: " . $user['role'] . ")\n";
    }
    
} catch(PDOException $e) {
    echo "❌ Connection Error:\n";
    echo $e->getMessage();
}
?>
