-- LDP Software Database Schema
-- Drop existing database if exists and create new one
DROP DATABASE IF EXISTS ldp_software;
CREATE DATABASE ldp_software CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ldp_software;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('lab-report', 'data-entry', 'transport', 'accounts', 'super-admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vendors Table
CREATE TABLE vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    gst_number VARCHAR(50),
    mobile_number VARCHAR(20),
    whatsapp_number VARCHAR(20),
    state VARCHAR(50) NOT NULL,
    pin_code VARCHAR(10),
    city VARCHAR(50) NOT NULL,
    address TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Milk Types Table
CREATE TABLE milk_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    hsn_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicle Numbers Table
CREATE TABLE vehicle_numbers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers Table
CREATE TABLE drivers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Capacities Table
CREATE TABLE vehicle_capacities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    capacity VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transport Companies Table
CREATE TABLE transport_companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Masters Table
CREATE TABLE vehicle_masters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_number_id INT NOT NULL,
    driver_id INT NOT NULL,
    capacity_id INT NOT NULL,
    transport_company_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_number_id) REFERENCES vehicle_numbers(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (capacity_id) REFERENCES vehicle_capacities(id),
    FOREIGN KEY (transport_company_id) REFERENCES transport_companies(id)
);

-- Purchases Table
CREATE TABLE purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    vendor_id INT NOT NULL,
    state VARCHAR(50) NOT NULL,
    vehicle_number VARCHAR(50),
    driver_name VARCHAR(100),
    driver_mobile VARCHAR(20),
    status ENUM('Delivered', 'Accepted', 'Rejected') DEFAULT 'Delivered',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Purchase Lines Table
CREATE TABLE purchase_lines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT NOT NULL,
    compartment ENUM('Front', 'Middle', 'Back', 'Average') NOT NULL,
    milk_type_id INT NOT NULL,
    kg_qty DECIMAL(10,2) NOT NULL,
    ltr DECIMAL(10,2) NOT NULL,
    fat DECIMAL(10,2) NOT NULL,
    clr DECIMAL(10,2) NOT NULL,
    snf DECIMAL(10,2) NOT NULL,
    temperature DECIMAL(10,2),
    mbrt DECIMAL(10,2),
    acidity DECIMAL(10,2),
    cob DECIMAL(10,2),
    alcohol DECIMAL(10,2),
    adulteration DECIMAL(10,2),
    seal_no INT,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (milk_type_id) REFERENCES milk_types(id)
);

-- Sales Table
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    vendor_id INT NOT NULL,
    state VARCHAR(50) NOT NULL,
    vehicle_number VARCHAR(50),
    driver_name VARCHAR(100),
    driver_mobile VARCHAR(20),
    status ENUM('Delivered', 'Accepted', 'Rejected') DEFAULT 'Delivered',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Sales Lines Table
CREATE TABLE sales_lines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_id INT NOT NULL,
    compartment ENUM('Front', 'Middle', 'Back', 'Average') NOT NULL,
    milk_type_id INT NOT NULL,
    kg_qty DECIMAL(10,2) NOT NULL,
    ltr DECIMAL(10,2) NOT NULL,
    fat DECIMAL(10,2) NOT NULL,
    clr DECIMAL(10,2) NOT NULL,
    snf DECIMAL(10,2) NOT NULL,
    temperature DECIMAL(10,2),
    mbrt DECIMAL(10,2),
    acidity DECIMAL(10,2),
    cob DECIMAL(10,2),
    alcohol DECIMAL(10,2),
    adulteration DECIMAL(10,2),
    seal_no INT,
    FOREIGN KEY (sales_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (milk_type_id) REFERENCES milk_types(id)
);

-- Insert seed data for users
INSERT INTO users (username, email, password, role) VALUES
('lab', 'lab@ldp.com', 'lab123', 'lab-report'),
('data', 'data@ldp.com', 'data123', 'data-entry'),
('transport', 'transport@ldp.com', 'transport123', 'transport'),
('accounts', 'accounts@ldp.com', 'accounts123', 'accounts'),
('admin', 'admin@ldp.com', 'admin123', 'super-admin');

-- Insert seed data for vendors
INSERT INTO vendors (code, name, state, city, owner_name) VALUES
('V001', 'Sri Lakshmi Vendors', 'Tamil Nadu', 'Coimbatore', 'Anand');

-- Insert seed data for milk types
INSERT INTO milk_types (name) VALUES
('RAW CHILLED MILK'),
('TONED MILK');

-- Insert seed data for vehicle numbers
INSERT INTO vehicle_numbers (number) VALUES
('TN38AB1234'),
('TN38CD5678');

-- Insert seed data for drivers
INSERT INTO drivers (name, mobile) VALUES
('Ravi', '9876543210'),
('Kumar', '9876543211');

-- Insert seed data for vehicle capacities
INSERT INTO vehicle_capacities (capacity) VALUES
('5000 Liters'),
('7000 Liters'),
('10000 Liters');

-- Insert seed data for transport companies
INSERT INTO transport_companies (name) VALUES
('Lakshmi Logistics'),
('Sri Transport');

-- Insert seed data for vehicle masters
INSERT INTO vehicle_masters (vehicle_number_id, driver_id, capacity_id, transport_company_id) VALUES
(1, 1, 1, 1);

-- Create indexes for better performance
CREATE INDEX idx_purchases_date ON purchases(date);
CREATE INDEX idx_purchases_vendor ON purchases(vendor_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_vendor ON sales(vendor_id);
CREATE INDEX idx_vendors_code ON vendors(code);
CREATE INDEX idx_vendors_name ON vendors(name);
