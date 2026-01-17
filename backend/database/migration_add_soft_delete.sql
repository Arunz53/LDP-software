-- Migration: Add soft delete columns to purchases and sales tables
-- Run this if you already have an existing database

USE ldp_software;

-- Add columns to purchases table (ignore errors if columns already exist)
-- Check if columns exist before adding

-- For purchases table
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ldp_software' 
    AND TABLE_NAME = 'purchases' 
    AND COLUMN_NAME = 'is_deleted');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE purchases ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER status',
    'SELECT "Column is_deleted already exists in purchases"');
PREPARE stmt FROM @sql;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ldp_software' 
    AND TABLE_NAME = 'purchases' 
    AND COLUMN_NAME = 'deleted_by');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE purchases ADD COLUMN deleted_by INT AFTER is_deleted, ADD FOREIGN KEY (deleted_by) REFERENCES users(id)',
    'SELECT "Column deleted_by already exists in purchases"');
PREPARE stmt FROM @sql;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ldp_software' 
    AND TABLE_NAME = 'purchases' 
    AND COLUMN_NAME = 'deleted_at');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE purchases ADD COLUMN deleted_at TIMESTAMP NULL AFTER deleted_by',
    'SELECT "Column deleted_at already exists in purchases"');
PREPARE stmt FROM @sql;
EXECUTE stmt;

-- For sales table
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ldp_software' 
    AND TABLE_NAME = 'sales' 
    AND COLUMN_NAME = 'is_deleted');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE sales ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER status',
    'SELECT "Column is_deleted already exists in sales"');
PREPARE stmt FROM @sql;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ldp_software' 
    AND TABLE_NAME = 'sales' 
    AND COLUMN_NAME = 'deleted_by');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE sales ADD COLUMN deleted_by INT AFTER is_deleted, ADD FOREIGN KEY (deleted_by) REFERENCES users(id)',
    'SELECT "Column deleted_by already exists in sales"');
PREPARE stmt FROM @sql;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'ldp_software' 
    AND TABLE_NAME = 'sales' 
    AND COLUMN_NAME = 'deleted_at');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE sales ADD COLUMN deleted_at TIMESTAMP NULL AFTER deleted_by',
    'SELECT "Column deleted_at already exists in sales"');
PREPARE stmt FROM @sql;
EXECUTE stmt;

-- Update existing rows to set is_deleted to FALSE if NULL
UPDATE purchases SET is_deleted = FALSE WHERE is_deleted IS NULL;
UPDATE sales SET is_deleted = FALSE WHERE is_deleted IS NULL;
