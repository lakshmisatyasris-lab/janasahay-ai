CREATE TABLE IF NOT EXISTS schemes (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  audience TEXT NOT NULL,
  summary TEXT NOT NULL,
  benefits TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  documents TEXT NOT NULL,
  apply_url TEXT NOT NULL,
  official_source TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Central',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)