<?php
require_once __DIR__ . '/../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// GET - Get all vendors
if ($method === 'GET') {
    $stmt = $conn->query("SELECT * FROM vendors WHERE is_deleted = 0 ORDER BY code");
    $vendors = $stmt->fetchAll();
    sendResponse($vendors);
}

// POST - Create vendor
if ($method === 'POST') {
    requireAuth();
    $input = getJsonInput();
    
    $stmt = $conn->prepare("INSERT INTO vendors (code, name, owner_name, gst_number, mobile_number, whatsapp_number, state, pin_code, city, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['code'],
        $input['name'],
        $input['ownerName'] ?? null,
        $input['gstNumber'] ?? null,
        $input['mobileNumber'] ?? null,
        $input['whatsappNumber'] ?? null,
        $input['state'],
        $input['pinCode'] ?? null,
        $input['city'],
        $input['address'] ?? null
    ]);
    
    $id = $conn->lastInsertId();
    $stmt = $conn->prepare("SELECT * FROM vendors WHERE id = ?");
    $stmt->execute([$id]);
    $vendor = $stmt->fetch();
    
    sendResponse($vendor, 201);
}

// PUT - Update vendor
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? null;
    
    if (!$id) {
        sendError('Vendor ID is required');
    }
    
    $stmt = $conn->prepare("UPDATE vendors SET code = ?, name = ?, owner_name = ?, gst_number = ?, mobile_number = ?, whatsapp_number = ?, state = ?, pin_code = ?, city = ?, address = ? WHERE id = ?");
    $stmt->execute([
        $input['code'],
        $input['name'],
        $input['ownerName'] ?? null,
        $input['gstNumber'] ?? null,
        $input['mobileNumber'] ?? null,
        $input['whatsappNumber'] ?? null,
        $input['state'],
        $input['pinCode'] ?? null,
        $input['city'],
        $input['address'] ?? null,
        $id
    ]);
    
    $stmt = $conn->prepare("SELECT * FROM vendors WHERE id = ?");
    $stmt->execute([$id]);
    $vendor = $stmt->fetch();
    
    sendResponse($vendor);
}

// DELETE - Soft delete vendor
if ($method === 'DELETE') {
    requireAuth();
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendError('Vendor ID is required');
    }
    
    $stmt = $conn->prepare("UPDATE vendors SET is_deleted = 1 WHERE id = ?");
    $stmt->execute([$id]);
    
    sendResponse(['message' => 'Vendor deleted successfully']);
}

sendError('Method not allowed', 405);
