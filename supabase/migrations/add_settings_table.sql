-- Settings table for blog configuration
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  categories JSONB DEFAULT '["기타"]'::jsonb,
  site_name VARCHAR(255) DEFAULT '블로그',
  site_description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT settings_singleton CHECK (id = 1)
);

-- Insert default settings
INSERT INTO settings (id, categories, site_name, site_description)
VALUES (
  1,
  '["태국사업", "태국생활", "태국어공부", "창업·법인", "비자·체류", "투자·부동산", "주거·음식", "의료·건강", "발음·문법", "기타"]'::jsonb,
  '태국라이프',
  '태국 창업·생활·언어까지 — 한국인을 위한 태국 종합 가이드'
)
ON CONFLICT (id) DO NOTHING;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read settings
CREATE POLICY "Public can read settings"
  ON settings
  FOR SELECT
  USING (true);

-- Policy: Service role can update settings
CREATE POLICY "Service role can update settings"
  ON settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
