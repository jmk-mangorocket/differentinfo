-- Migration: Add FAQ column to posts table
-- Run this in Supabase SQL Editor

-- Add FAQ column as JSONB array
ALTER TABLE posts ADD COLUMN IF NOT EXISTS faq JSONB;

-- Add comment
COMMENT ON COLUMN posts.faq IS 'FAQ items array: [{question: string, answer: string}]';
