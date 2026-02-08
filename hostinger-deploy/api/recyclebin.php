<?php
require_once __DIR__ . '/../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// GET - Get all deleted items (purchases and sales)
if ($method === 'GET') {
    requireAuth();
    
    $type = $_GET['type'] ?? 'all'; // 'purchases', 'sales', or 'all'
    
    $deletedItems = [];
    
    // Get deleted purchases
    if ($type === 'all' || $type === 'purchases') {
        $stmt = $conn->query("
            SELECT 
                p.id,
                p.invoice_no,
                p.date,
                p.vendor_id,
                p.state,
                p.vehicle_number,
                p.driver_name,
                p.driver_mobile,
                p.status,
                p.deleted_at,
                p.created_by,
                p.deleted_by,
                'purchase' as type,
                u.username as created_by_username,
                d.username as deleted_by_username,
                v.name as vendor_name,
                v.code as vendor_code
            FROM purchases p
            LEFT JOIN users u ON p.created_by = u.id
            LEFT JOIN users d ON p.deleted_by = d.id
            LEFT JOIN vendors v ON p.vendor_id = v.id
            WHERE p.is_deleted = TRUE
            ORDER BY p.deleted_at DESC
        ");
        $purchases = $stmt->fetchAll();
        
        // Get lines for each purchase
        foreach ($purchases as &$purchase) {
            $stmt = $conn->prepare("SELECT * FROM purchase_lines WHERE purchase_id = ?");
            $stmt->execute([$purchase['id']]);
            $purchase['lines'] = $stmt->fetchAll();
        }
        
        $deletedItems = array_merge($deletedItems, $purchases);
    }
    
    // Get deleted sales
    if ($type === 'all' || $type === 'sales') {
        $stmt = $conn->query("
            SELECT 
                s.id,
                s.invoice_no,
                s.date,
                s.vendor_id,
                s.state,
                s.vehicle_number,
                s.driver_name,
                s.driver_mobile,
                s.status,
                s.deleted_at,
                s.created_by,
                s.deleted_by,
                'sale' as type,
                u.username as created_by_username,
                d.username as deleted_by_username,
                v.name as vendor_name,
                v.code as vendor_code
            FROM sales s
            LEFT JOIN users u ON s.created_by = u.id
            LEFT JOIN users d ON s.deleted_by = d.id
            LEFT JOIN vendors v ON s.vendor_id = v.id
            WHERE s.is_deleted = TRUE
            ORDER BY s.deleted_at DESC
        ");
        $sales = $stmt->fetchAll();
        
        // Get lines for each sale
        foreach ($sales as &$sale) {
            $stmt = $conn->prepare("SELECT * FROM sales_lines WHERE sales_id = ?");
            $stmt->execute([$sale['id']]);
            $sale['lines'] = $stmt->fetchAll();
        }
        
        $deletedItems = array_merge($deletedItems, $sales);
    }
    
    // Sort by deleted_at DESC
    usort($deletedItems, function($a, $b) {
        return strtotime($b['deleted_at']) - strtotime($a['deleted_at']);
    });
    
    // Convert to camelCase
    $deletedItems = array_map('snakeToCamel', $deletedItems);
    
    sendResponse($deletedItems);
}

// POST - Restore an item from recycle bin
if ($method === 'POST') {
    requireAuth();
    $input = getJsonInput();
    
    $id = $input['id'] ?? null;
    $type = $input['type'] ?? null;
    
    if (!$id || !$type) {
        sendError('ID and type are required');
    }
    
    try {
        if ($type === 'purchase') {
            $stmt = $conn->prepare("
                UPDATE purchases 
                SET is_deleted = FALSE, deleted_by = NULL, deleted_at = NULL 
                WHERE id = ?
            ");
            $stmt->execute([$id]);
        } elseif ($type === 'sale') {
            $stmt = $conn->prepare("
                UPDATE sales 
                SET is_deleted = FALSE, deleted_by = NULL, deleted_at = NULL 
                WHERE id = ?
            ");
            $stmt->execute([$id]);
        } else {
            sendError('Invalid type');
        }
        
        sendResponse(['message' => 'Item restored successfully']);
    } catch (Exception $e) {
        sendError('Failed to restore item: ' . $e->getMessage(), 500);
    }
}

// DELETE - Permanently delete an item
if ($method === 'DELETE') {
    requireAuth();
    
    $id = $_GET['id'] ?? null;
    $type = $_GET['type'] ?? null;
    
    if (!$id || !$type) {
        sendError('ID and type are required');
    }
    
    try {
        if ($type === 'purchase') {
            $stmt = $conn->prepare("DELETE FROM purchases WHERE id = ? AND is_deleted = TRUE");
            $stmt->execute([$id]);
        } elseif ($type === 'sale') {
            $stmt = $conn->prepare("DELETE FROM sales WHERE id = ? AND is_deleted = TRUE");
            $stmt->execute([$id]);
        } else {
            sendError('Invalid type');
        }
        
        sendResponse(['message' => 'Item permanently deleted']);
    } catch (Exception $e) {
        sendError('Failed to delete item: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed', 405);
