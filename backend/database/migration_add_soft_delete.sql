-- Migration: Add soft delete columns to purchases and sales tables
-- Run this if you already have an existing database
-- For phpMyAdmin: Make sure you have selected your database before importing
-- NOTE: If you just imported schema.sql, you DON'T need this migration!

-- ==============================================================================
-- PURCHASES TABLE
-- ==============================================================================

-- Add is_deleted column to purchases
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'purchases' 
    AND COLUMN_NAME = 'is_deleted');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE purchases ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER status',
    'SELECT "Column is_deleted already exists in purchases" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add deleted_by column to purchases
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'purchases' 
    AND COLUMN_NAME = 'deleted_by');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE purchases ADD COLUMN deleted_by INT AFTER is_deleted',
    'SELECT "Column deleted_by already exists in purchases" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add deleted_at column to purchases
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'purchases' 
    AND COLUMN_NAME = 'deleted_at');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE purchases ADD COLUMN deleted_at TIMESTAMP NULL AFTER deleted_by',
    'SELECT "Column deleted_at already exists in purchases" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==============================================================================
-- SALES TABLE
-- ==============================================================================

-- Add is_deleted column to sales
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'sales' 
    AND COLUMN_NAME = 'is_deleted');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE sales ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER status',
    'SELECT "Column is_deleted already exists in sales" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add deleted_by column to sales
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'sales' 
    AND COLUMN_NAME = 'deleted_by');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE sales ADD COLUMN deleted_by INT AFTER is_deleted',
    'SELECT "Column deleted_by already exists in sales" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add deleted_at column to sales
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'sales' 
    AND COLUMN_NAME = 'deleted_at');

SET @sql := IF(@exist = 0, 
    'ALTER TABLE sales ADD COLUMN deleted_at TIMESTAMP NULL AFTER deleted_by',
    'SELECT "Column deleted_at already exists in sales" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==============================================================================
-- UPDATE EXISTING DATA
-- ==============================================================================

-- Update existing rows to set is_deleted to FALSE if NULL
UPDATE purchases SET is_deleted = FALSE WHERE is_deleted IS NULL;
UPDATE sales SET is_deleted = FALSE WHERE is_deleted IS NULL;
