<?php
require_once __DIR__ . '/../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// GET - Get all milk types
if ($method === 'GET') {
    $stmt = $conn->query("SELECT * FROM milk_types ORDER BY name");
    $milkTypes = $stmt->fetchAll();
    sendResponse($milkTypes);
}

// POST - Create milk type
if ($method === 'POST') {
    requireAuth();
    $input = getJsonInput();
    
    $stmt = $conn->prepare("INSERT INTO milk_types (name, hsn_code) VALUES (?, ?)");
    $stmt->execute([
        $input['name'],
        $input['hsnCode'] ?? null
    ]);
    
    $id = $conn->lastInsertId();
    $stmt = $conn->prepare("SELECT * FROM milk_types WHERE id = ?");
    $stmt->execute([$id]);
    $milkType = $stmt->fetch();
    
    sendResponse($milkType, 201);
}

// PUT - Update milk type
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? null;
    
    if (!$id) {
        sendError('Milk type ID is required');
    }
    
    $stmt = $conn->prepare("UPDATE milk_types SET name = ?, hsn_code = ? WHERE id = ?");
    $stmt->execute([
        $input['name'],
        $input['hsnCode'] ?? null,
        $id
    ]);
    
    $stmt = $conn->prepare("SELECT * FROM milk_types WHERE id = ?");
    $stmt->execute([$id]);
    $milkType = $stmt->fetch();
    
    sendResponse($milkType);
}

// DELETE
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendError('Milk type ID is required');
    }
    
    $stmt = $conn->prepare("DELETE FROM milk_types WHERE id = ?");
    $stmt->execute([$id]);
    
    sendResponse(['message' => 'Milk type deleted successfully']);
}

sendError('Method not allowed', 405);
