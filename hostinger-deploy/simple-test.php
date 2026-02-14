<?php
echo "TEST START\n\n";

echo "PHP Version: " . phpversion() . "\n";
echo "Memory: " . ini_get('memory_limit') . "\n\n";

// Test connection
echo "Attempting Database Connection...\n";
echo "Host: localhost\n";
echo "DB: u478906159_lakshmi\n";
echo "User: u478906159_lakshmi\n\n";

try {
    $conn = new PDO(
        "mysql:host=localhost;dbname=u478906159_lakshmi;charset=utf8mb4",
        "u478906159_lakshmi",
        "Arunasai@53",
        [PDO::ATTR_TIMEOUT => 5]
    );
    echo "✅ CONNECTION SUCCESS\n\n";
    
    // Count users
    $result = $conn->query("SELECT COUNT(*) as cnt FROM users")->fetch();
    echo "Total Users: " . $result['cnt'] . "\n";
    
} catch(Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\nTEST END";
?>
