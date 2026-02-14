<?php
header('Content-Type: application/json');

$results = [];

// Test Vendors API
echo "Testing APIs...\n\n";

$apis = [
    'vendors' => 'https://lakshmidairy.site/api/vendors.php',
    'purchases' => 'https://lakshmidairy.site/api/purchases.php',
    'sales' => 'https://lakshmidairy.site/api/sales.php',
    'milktypes' => 'https://lakshmidairy.site/api/milktypes.php',
    'vehicles' => 'https://lakshmidairy.site/api/vehicles.php'
];

foreach($apis as $name => $url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $results[$name] = [
        'status' => $httpCode,
        'response' => $response ? json_decode($response, true) : 'No response'
    ];
    
    echo "$name API (Status: $httpCode)\n";
    echo "Response: " . substr($response, 0, 200) . "...\n\n";
}

echo "Full Results:\n";
echo json_encode($results, JSON_PRETTY_PRINT);
?>
