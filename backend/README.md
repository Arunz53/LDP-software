# LDP Software Backend API

Backend API for LDP Software built with PHP and MySQL.

## Setup Instructions

### 1. Database Setup

1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Click on "Import" tab
3. Choose file: `backend/database/schema.sql`
4. Click "Go" to import

OR run this command in MySQL:
```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Configure PHP

Make sure XAMPP Apache is running:
- Start XAMPP Control Panel
- Start Apache
- Start MySQL

### 3. Test API

Open browser and test:
- http://localhost/LDP%20software/LDP-Software/backend/api/vendors.php
- http://localhost/LDP%20software/LDP-Software/backend/api/milktypes.php

### 4. Update Frontend

The frontend React app needs to be updated to use these APIs instead of localStorage.

## API Endpoints

### Authentication
- POST `/api/auth.php?action=login` - Login user
- POST `/api/auth.php?action=logout` - Logout user
- GET `/api/auth.php?action=me` - Get current user

### Vendors
- GET `/api/vendors.php` - Get all vendors
- POST `/api/vendors.php` - Create vendor
- PUT `/api/vendors.php` - Update vendor
- DELETE `/api/vendors.php?id={id}` - Delete vendor

### Milk Types
- GET `/api/milktypes.php` - Get all milk types
- POST `/api/milktypes.php` - Create milk type
- PUT `/api/milktypes.php` - Update milk type
- DELETE `/api/milktypes.php?id={id}` - Delete milk type

### Purchases
- GET `/api/purchases.php` - Get all purchases
- POST `/api/purchases.php` - Create purchase
- PUT `/api/purchases.php` - Update purchase status

### Sales
- GET `/api/sales.php` - Get all sales
- POST `/api/sales.php` - Create sale
- PUT `/api/sales.php` - Update sale status

### Vehicles
- GET `/api/vehicles.php?type=vehicle-numbers` - Get vehicle numbers
- GET `/api/vehicles.php?type=drivers` - Get drivers
- GET `/api/vehicles.php?type=vehicle-capacities` - Get capacities
- GET `/api/vehicles.php?type=transport-companies` - Get companies
- GET `/api/vehicles.php?type=vehicle-masters` - Get vehicle masters

## Database Schema

- users - User accounts
- vendors - Vendor master data
- milk_types - Milk type master data
- purchases - Purchase transactions
- purchase_lines - Purchase line items
- sales - Sales transactions
- sales_lines - Sales line items
- vehicle_numbers - Vehicle number master
- drivers - Driver master
- vehicle_capacities - Vehicle capacity master
- transport_companies - Transport company master
- vehicle_masters - Vehicle master data

## Security Notes

⚠️ **Important for Production:**
1. Change database password in `config/config.php`
2. Use password hashing (bcrypt/argon2) instead of plain text
3. Add JWT or session-based authentication
4. Enable HTTPS
5. Add rate limiting
6. Validate and sanitize all inputs
7. Use environment variables for sensitive data
