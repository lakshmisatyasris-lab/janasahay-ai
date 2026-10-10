CREATE TABLE IF NOT EXISTS user_saved_schemes (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  scheme_id BIGINT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, scheme_id)
)