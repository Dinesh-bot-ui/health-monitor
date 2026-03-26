-- ============================================================
-- Migration: Add is_form_submitted column to users table
-- Run this ONCE in your PostgreSQL health_monitoring database
-- ============================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_form_submitted BOOLEAN NOT NULL DEFAULT FALSE;

-- Verify the column was added:
-- SELECT id, email, is_form_submitted FROM users;
