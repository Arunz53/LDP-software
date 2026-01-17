<?php
require_once __DIR__ . '/../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

// Vehicle Numbers
if (strpos($_SERVER['REQUEST_URI'], '/vehicle-numbers') !== false) {
    if ($method === 'GET') {
        $stmt = $conn->query("SELECT * FROM vehicle_numbers ORDER BY number");
        $data = $stmt->fetchAll();
        $data = array_map('snakeToCamel', $data);
        sendResponse($data);
    }
    if ($method === 'POST') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO vehicle_numbers (number) VALUES (?)");
        $stmt->execute([$input['number']]);
        $id = $conn->lastInsertId();
        sendResponse(['id' => $id, 'number' => $input['number']], 201);
    }
    if ($method === 'PUT') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("UPDATE vehicle_numbers SET number = ? WHERE id = ?");
        $stmt->execute([$input['number'], $input['id']]);
        sendResponse(['success' => true]);
    }
    if ($method === 'DELETE') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("DELETE FROM vehicle_numbers WHERE id = ?");
        $stmt->execute([$input['id']]);
        sendResponse(['success' => true]);
    }
}

// Drivers
if (strpos($_SERVER['REQUEST_URI'], '/drivers') !== false) {
    if ($method === 'GET') {
        $stmt = $conn->query("SELECT * FROM drivers ORDER BY name");
        $data = $stmt->fetchAll();
        $data = array_map('snakeToCamel', $data);
        sendResponse($data);
    }
    if ($method === 'POST') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO drivers (name, mobile) VALUES (?, ?)");
        $stmt->execute([$input['name'], $input['mobile']]);
        $id = $conn->lastInsertId();
        sendResponse(['id' => $id, 'name' => $input['name'], 'mobile' => $input['mobile']], 201);
    }
    if ($method === 'PUT') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("UPDATE drivers SET name = ?, mobile = ? WHERE id = ?");
        $stmt->execute([$input['name'], $input['mobile'], $input['id']]);
        sendResponse(['success' => true]);
    }
    if ($method === 'DELETE') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("DELETE FROM drivers WHERE id = ?");
        $stmt->execute([$input['id']]);
        sendResponse(['success' => true]);
    }
}

// Vehicle Capacities
if (strpos($_SERVER['REQUEST_URI'], '/vehicle-capacities') !== false) {
    if ($method === 'GET') {
        $stmt = $conn->query("SELECT * FROM vehicle_capacities ORDER BY capacity");
        $data = $stmt->fetchAll();
        $data = array_map('snakeToCamel', $data);
        sendResponse($data);
    }
    if ($method === 'POST') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO vehicle_capacities (capacity) VALUES (?)");
        $stmt->execute([$input['capacity']]);
        $id = $conn->lastInsertId();
        sendResponse(['id' => $id, 'capacity' => $input['capacity']], 201);
    }
    if ($method === 'PUT') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("UPDATE vehicle_capacities SET capacity = ? WHERE id = ?");
        $stmt->execute([$input['capacity'], $input['id']]);
        sendResponse(['success' => true]);
    }
    if ($method === 'DELETE') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("DELETE FROM vehicle_capacities WHERE id = ?");
        $stmt->execute([$input['id']]);
        sendResponse(['success' => true]);
    }
}

// Transport Companies
if (strpos($_SERVER['REQUEST_URI'], '/transport-companies') !== false) {
    if ($method === 'GET') {
        $stmt = $conn->query("SELECT * FROM transport_companies ORDER BY name");
        $data = $stmt->fetchAll();
        $data = array_map('snakeToCamel', $data);
        sendResponse($data);
    }
    if ($method === 'POST') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO transport_companies (name) VALUES (?)");
        $stmt->execute([$input['name']]);
        $id = $conn->lastInsertId();
        sendResponse(['id' => $id, 'name' => $input['name']], 201);
    }
    if ($method === 'PUT') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("UPDATE transport_companies SET name = ? WHERE id = ?");
        $stmt->execute([$input['name'], $input['id']]);
        sendResponse(['success' => true]);
    }
    if ($method === 'DELETE') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("DELETE FROM transport_companies WHERE id = ?");
        $stmt->execute([$input['id']]);
        sendResponse(['success' => true]);
    }
}

// Vehicle Masters
if (strpos($_SERVER['REQUEST_URI'], '/vehicle-masters') !== false) {
    if ($method === 'GET') {
        $stmt = $conn->query("
            SELECT vm.*, 
                   vn.number as vehicle_number,
                   d.name as driver_name,
                   d.mobile as driver_mobile,
                   vc.capacity,
                   tc.name as transport_company
            FROM vehicle_masters vm
            JOIN vehicle_numbers vn ON vm.vehicle_number_id = vn.id
            JOIN drivers d ON vm.driver_id = d.id
            JOIN vehicle_capacities vc ON vm.capacity_id = vc.id
            JOIN transport_companies tc ON vm.transport_company_id = tc.id
            ORDER BY vm.id DESC
        ");
        $data = $stmt->fetchAll();
        $data = array_map('snakeToCamel', $data);
        sendResponse($data);
    }
    if ($method === 'POST') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO vehicle_masters (vehicle_number_id, driver_id, capacity_id, transport_company_id) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $input['vehicleNumberId'],
            $input['driverId'],
            $input['capacityId'],
            $input['transportCompanyId']
        ]);
        $id = $conn->lastInsertId();
        sendResponse(['id' => $id], 201);
    }
    if ($method === 'PUT') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("UPDATE vehicle_masters SET vehicle_number_id = ?, driver_id = ?, capacity_id = ?, transport_company_id = ? WHERE id = ?");
        $stmt->execute([
            $input['vehicleNumberId'],
            $input['driverId'],
            $input['capacityId'],
            $input['transportCompanyId'],
            $input['id']
        ]);
        sendResponse(['success' => true]);
    }
    if ($method === 'DELETE') {
        requireAuth();
        $input = getJsonInput();
        $stmt = $conn->prepare("DELETE FROM vehicle_masters WHERE id = ?");
        $stmt->execute([$input['id']]);
        sendResponse(['success' => true]);
    }
}

sendError('Not found', 404);
