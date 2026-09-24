CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Maps Firebase's own UID (a ~28-char string, not a UUID) to a stable internal
-- UUID used everywhere else in the schema (card.owner_id, card_membership.user_id,
-- course_space_event.actor_user_id, etc). This indirection means we did NOT have
-- to migrate every existing UUID column when wiring up real auth.
CREATE TABLE IF NOT EXISTS app_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
