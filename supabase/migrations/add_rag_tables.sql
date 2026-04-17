-- RAG Tables for B-method (RAG + Product Recommendation + Affiliate)
-- Run this in Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 1. documents: 원본 문서 저장
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,           -- 'merck', 'pubmed', 'usda', 'aspca', 'hospital_blog', 'wsava'
  source_url TEXT,
  source_name TEXT,
  title TEXT,
  full_text TEXT NOT NULL,
  reliability TEXT NOT NULL DEFAULT 'medium',  -- 'high', 'medium', 'low'
  language TEXT DEFAULT 'ko',
  crawled_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);
CREATE INDEX IF NOT EXISTS idx_documents_reliability ON documents(reliability);

-- ============================================================
-- 2. chunks: 임베딩 청크 (pgvector)
-- ============================================================
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  token_count INTEGER,
  embedding VECTOR(1536),              -- text-embedding-3-small dimension
  category TEXT NOT NULL,               -- 'dog_joint', 'cat_vomiting', 'food_nutrition', etc.
  keywords TEXT[],
  reliability TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_category ON chunks(category);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_reliability ON chunks(reliability);

-- IVFFlat index for vector similarity search
-- Note: requires at least some rows to exist before creating with lists > 0
-- For initial setup with few rows, use a small lists value
-- Recreate with larger lists (100+) once you have 10k+ chunks
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- ============================================================
-- 3. rag_products: B방식 제품 데이터
-- ============================================================
CREATE TABLE IF NOT EXISTS rag_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,               -- 'joint_supplement', 'dog_food', 'cat_food', etc.
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price_range TEXT,                     -- '30000-45000'
  key_ingredients JSONB,                -- {"글루코사민": "500mg", "콘드로이틴": "400mg"}
  rating REAL,
  review_count INTEGER,
  affiliate_url TEXT,                   -- 쿠팡파트너스 링크
  affiliate_platform TEXT DEFAULT 'coupang_partners',
  checklist_score JSONB,                -- 체크리스트 기준별 충족 여부
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_products_category ON rag_products(category);
CREATE INDEX IF NOT EXISTS idx_rag_products_active ON rag_products(is_active);

-- Updated_at trigger for rag_products
CREATE TRIGGER update_rag_products_updated_at
  BEFORE UPDATE ON rag_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. RLS Policies
-- ============================================================

-- documents: service role only (not public)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to documents"
  ON documents FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- chunks: service role full access, public read for search
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read chunks"
  ON chunks FOR SELECT
  USING (true);

CREATE POLICY "Service role has full access to chunks"
  ON chunks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- rag_products: service role full access, public read
ALTER TABLE rag_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active products"
  ON rag_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role has full access to rag_products"
  ON rag_products FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 5. match_chunks RPC: 벡터 유사도 검색
-- ============================================================
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  category TEXT,
  reliability TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.chunk_text,
    c.category,
    c.reliability,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM chunks c
  WHERE (filter_category IS NULL OR c.category = filter_category)
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON TABLE documents IS 'RAG source documents (Merck, PubMed, USDA, ASPCA, etc.)';
COMMENT ON TABLE chunks IS 'Embedded text chunks for vector similarity search';
COMMENT ON TABLE rag_products IS 'Product data for B-method affiliate recommendations';
COMMENT ON FUNCTION match_chunks IS 'Vector similarity search over chunks table using cosine distance';
