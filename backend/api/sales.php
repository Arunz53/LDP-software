<?php
require_once __DIR__ . '/../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// GET - Get all sales with lines
if ($method === 'GET') {
    $stmt = $conn->query("
        SELECT s.*, 
               u.username as created_by_username,
               v.name as vendor_name, v.code as vendor_code
        FROM sales s
        LEFT JOIN users u ON s.created_by = u.id
        LEFT JOIN vendors v ON s.vendor_id = v.id
        WHERE s.is_deleted = FALSE
        ORDER BY s.date DESC, s.id DESC
    ");
    $sales = $stmt->fetchAll();
    
    // Get lines for each sale
    foreach ($sales as &$sale) {
        $stmt = $conn->prepare("SELECT * FROM sales_lines WHERE sales_id = ?");
        $stmt->execute([$sale['id']]);
        $sale['lines'] = $stmt->fetchAll();
    }
    
    // Convert to camelCase
    $sales = array_map('snakeToCamel', $sales);
    
    sendResponse($sales);
}

// POST - Create sale
if ($method === 'POST') {
    $userId = requireAuth();
    $input = getJsonInput();
    
    try {
        $conn->beginTransaction();
        
        // Insert sale
        $stmt = $conn->prepare("
            INSERT INTO sales (invoice_no, date, vendor_id, state, vehicle_number, driver_name, driver_mobile, status, created_by)
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
        
        $salesId = $conn->lastInsertId();
        
        // Insert sales lines
        $stmt = $conn->prepare("
            INSERT INTO sales_lines (sales_id, compartment, milk_type_id, kg_qty, ltr, fat, clr, snf, temperature, mbrt, acidity, cob, alcohol, adulteration, seal_no)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($input['lines'] as $line) {
            $stmt->execute([
                $salesId,
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
        
        // Fetch and return the created sale with lines
        $stmt = $conn->prepare("SELECT * FROM sales WHERE id = ?");
        $stmt->execute([$salesId]);
        $sale = $stmt->fetch();
        
        $stmt = $conn->prepare("SELECT * FROM sales_lines WHERE sales_id = ?");
        $stmt->execute([$salesId]);
        $sale['lines'] = $stmt->fetchAll();
        
        // Convert to camelCase
        $sale = snakeToCamel($sale);
        
        sendResponse($sale, 201);
        
    } catch (Exception $e) {
        $conn->rollBack();
        sendError('Failed to create sale: ' . $e->getMessage(), 500);
    }
}

// PUT - Update sale status
if ($method === 'PUT') {
    requireAuth();
    $input = getJsonInput();
    $id = $input['id'] ?? null;
    $status = $input['status'] ?? null;
    
    if (!$id || !$status) {
        sendError('Sale ID and status are required');
    }
    
    $stmt = $conn->prepare("UPDATE sales SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    
    sendResponse(['message' => 'Sale status updated successfully']);
}

// DELETE - Soft delete sale
if ($method === 'DELETE') {
    $userId = requireAuth();
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendError('Sale ID is required');
    }
    
    try {
        $stmt = $conn->prepare("
            UPDATE sales 
            SET is_deleted = TRUE, deleted_by = ?, deleted_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$userId, $id]);
        
        sendResponse(['message' => 'Sale moved to recycle bin successfully']);
    } catch (Exception $e) {
        sendError('Failed to delete sale: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed', 405);
