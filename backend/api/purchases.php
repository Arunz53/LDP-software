<?php
require_once __DIR__ . '/../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// GET - Get all purchases with lines
if ($method === 'GET') {
    $stmt = $conn->query("
        SELECT p.*, 
               u.username as created_by_username,
               v.name as vendor_name, v.code as vendor_code
        FROM purchases p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN vendors v ON p.vendor_id = v.id
        ORDER BY p.date DESC, p.id DESC
    ");
    $purchases = $stmt->fetchAll();
    
    // Get lines for each purchase
    foreach ($purchases as &$purchase) {
        $stmt = $conn->prepare("SELECT * FROM purchase_lines WHERE purchase_id = ?");
        $stmt->execute([$purchase['id']]);
        $purchase['lines'] = $stmt->fetchAll();
    }
    
    sendResponse($purchases);
}

// POST - Create purchase
if ($method === 'POST') {
    $userId = requireAuth();
    $input = getJsonInput();
    
    try {
        $conn->beginTransaction();
        
        // Insert purchase
        $stmt = $conn->prepare("
            INSERT INTO purchases (invoice_no, date, vendor_id, state, vehicle_number, driver_name, driver_mobile, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['invoiceNo'],
            $input['date'],
            $input['vendorId'],
            $input['state'],
            $input['vehicleNumber'] ?? null,
            $input['driverName'] ?? null,
            $input['driverMobile'] ?? null,
            $input['status'] ?? 'Delivered',
            $userId
        ]);
        
        $purchaseId = $conn->lastInsertId();
        
        // Insert purchase lines
        $stmt = $conn->prepare("
            INSERT INTO purchase_lines (purchase_id, compartment, milk_type_id, kg_qty, ltr, fat, clr, snf, temperature, mbrt, acidity, cob, alcohol, adulteration, seal_no)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($input['lines'] as $line) {
            $stmt->execute([
                $purchaseId,
                $line['compartment'],
                $line['milkTypeId'],
                $line['kgQty'],
                $line['ltr'],
                $line['fat'],
                $line['clr'],
                $line['snf'],
                $line['temperature'] ?? null,
                $line['mbrt'] ?? null,
                $line['acidity'] ?? null,
                $line['cob'] ?? null,
                $line['alcohol'] ?? null,
                $line['adulteration'] ?? null,
                $line['sealNo'] ?? null
            ]);
        }
        
        $conn->commit();
        
        // Fetch and return the created purchase with lines
        $stmt = $conn->prepare("SELECT * FROM purchases WHERE id = ?");
        $stmt->execute([$purchaseId]);
        $purchase = $stmt->fetch();
        
        $stmt = $conn->prepare("SELECT * FROM purchase_lines WHERE purchase_id = ?");
        $stmt->execute([$purchaseId]);
        $purchase['lines'] = $stmt->fetchAll();
        
        sendResponse($purchase, 201);
        
    } catch (Exception $e) {
        $conn->rollBack();
        sendError('Failed to create purchase: ' . $e->getMessage(), 500);
    }
}

// PUT - Update purchase status
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? null;
    $status = $input['status'] ?? null;
    
    if (!$id || !$status) {
        sendError('Purchase ID and status are required');
    }
    
    $stmt = $conn->prepare("UPDATE purchases SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    
    sendResponse(['message' => 'Purchase status updated successfully']);
}

sendError('Method not allowed', 405);
