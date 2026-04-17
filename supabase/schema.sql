-- Golf Coupang Blog Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  coupang_url VARCHAR(500),
  coupang_product_id VARCHAR(100),
  product_name VARCHAR(500),
  product_price BIGINT,
  category VARCHAR(100) DEFAULT 'golf',
  tags TEXT[],
  seo_keywords TEXT[],
  view_count INTEGER DEFAULT 0,
  word_count INTEGER,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(is_published, published_at DESC);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_coupang_product_id ON posts(coupang_product_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Public can read published posts"
  ON posts
  FOR SELECT
  USING (is_published = true);

-- Policy: Service role can do everything
CREATE POLICY "Service role has full access"
  ON posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create Storage bucket for images
-- Note: Run this separately in Supabase Dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Storage policy for public read access
-- CREATE POLICY "Public read access for post images"
--   ON storage.objects
--   FOR SELECT
--   USING (bucket_id = 'post-images');

-- Storage policy for service role uploads
-- CREATE POLICY "Service role can upload images"
--   ON storage.objects
--   FOR INSERT
--   WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'service_role');

COMMENT ON TABLE posts IS 'Golf product review blog posts for Coupang affiliate marketing';
