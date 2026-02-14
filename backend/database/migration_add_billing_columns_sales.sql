-- Add missing billing columns to sales table for Lakshmi Dairy
ALTER TABLE sales
  ADD COLUMN km_charges1 DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN km_charges3 DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN toll_gate_charges DECIMAL(10,2) DEFAULT 0;
