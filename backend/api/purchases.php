<?php
require_once __DIR__ . '/../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// GET - Get all purchases with lines
if ($method === 'GET') {
    $stmt = $conn->query("
        SELECT p.*, 
               p.km_charges1, p.km_charges3, p.toll_gate_charges,
               u.username as created_by_username,
               v.name as vendor_name, v.code as vendor_code
        FROM purchases p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN vendors v ON p.vendor_id = v.id
        WHERE p.is_deleted = FALSE
        ORDER BY p.date DESC, p.id DESC
    ");
    $purchases = $stmt->fetchAll();
    // Get lines for each purchase
    foreach ($purchases as &$purchase) {
        $stmt = $conn->prepare("SELECT * FROM purchase_lines WHERE purchase_id = ?");
        $stmt->execute([$purchase['id']]);
        $purchase['lines'] = $stmt->fetchAll();
    }
    // Convert to camelCase
    $purchases = array_map('snakeToCamel', $purchases);
    sendResponse($purchases);
}

// POST - Create purchase
if ($method === 'POST') {
    $userId = requireAuth();
    $input = getJsonInput();
    try {
        $conn->beginTransaction();
        // Insert purchase with billing fields
        $stmt = $conn->prepare("
            INSERT INTO purchases (
                invoice_no, date, vendor_id, state, vehicle_number, driver_name, driver_mobile, status, created_by,
                km_charges1, km_charges3, toll_gate_charges
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            $userId,
            $input['kmCharges1'] ?? 0,
            $input['kmCharges3'] ?? 0,
            $input['tollGateCharges'] ?? 0
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
        
        // Convert to camelCase
        $purchase = snakeToCamel($purchase);
        
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
    $kmCharges1 = $input['kmCharges1'] ?? null;
    $kmCharges3 = $input['kmCharges3'] ?? null;
    $tollGateCharges = $input['tollGateCharges'] ?? null;
    if (!$id) {
        sendError('Purchase ID is required');
    }
    $fields = [];
    $params = [];
    if ($status) {
        $fields[] = "status = ?";
        $params[] = $status;
    }
    if ($kmCharges1 !== null) {
        $fields[] = "km_charges1 = ?";
        $params[] = $kmCharges1;
    }
    if ($kmCharges3 !== null) {
        $fields[] = "km_charges3 = ?";
        $params[] = $kmCharges3;
    }
    if ($tollGateCharges !== null) {
        $fields[] = "toll_gate_charges = ?";
        $params[] = $tollGateCharges;
    }
    if (empty($fields)) {
        sendError('No fields to update');
    }
    $params[] = $id;
    $sql = "UPDATE purchases SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    sendResponse(['message' => 'Purchase updated successfully']);
}

// DELETE - Soft delete purchase
if ($method === 'DELETE') {
    $userId = requireAuth();
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendError('Purchase ID is required');
    }
    
    try {
        $stmt = $conn->prepare("
            UPDATE purchases 
            SET is_deleted = TRUE, deleted_by = ?, deleted_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$userId, $id]);
        
        sendResponse(['message' => 'Purchase moved to recycle bin successfully']);
    } catch (Exception $e) {
        sendError('Failed to delete purchase: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed', 405);
