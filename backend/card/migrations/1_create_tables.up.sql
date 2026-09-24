CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS card (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL DEFAULT 'indigo',
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  share_token VARCHAR(100) UNIQUE,
  require_approval BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS card_membership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES card(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INVITED, LEFT, REMOVED
  role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',   -- OWNER, ADMIN, MEMBER
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AD-060: At most one ACTIVE or INVITED row per (cardId, userId)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_membership 
ON card_membership (card_id, user_id) 
WHERE status IN ('ACTIVE', 'INVITED');

CREATE TABLE IF NOT EXISTS course_space_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES card(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  actor_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS artifact_share (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_type VARCHAR(50) NOT NULL,
  artifact_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES card(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
