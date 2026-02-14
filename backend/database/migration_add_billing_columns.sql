-- Add missing billing columns to purchases table for Lakshmi Dairy
ALTER TABLE purchases
  ADD COLUMN km_charges1 DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN km_charges3 DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN toll_gate_charges DECIMAL(10,2) DEFAULT 0;
