-- Fills the architecture gap flagged in the previous pass: Resources, Notes,
-- Quizzes and Flashcards had no backend service at all (only artifact_share's
-- share/unshare existed, which assumed these rows existed somewhere).

CREATE TABLE IF NOT EXISTS resource (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES card(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  title VARCHAR(500) NOT NULL,
  mime_type VARCHAR(200) NOT NULL,
  file_type VARCHAR(20) NOT NULL, -- pdf | docx | pptx | xlsx | csv | txt | image
  size_bytes BIGINT,
  storage_key TEXT,               -- object key in the `resource-files` bucket, if a real file was uploaded
  status VARCHAR(20) NOT NULL DEFAULT 'READY', -- PENDING | PROCESSING | READY | FAILED
  extracted_text TEXT,            -- plain-text content used to ground Sarah (RAG)
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resource_card ON resource(card_id);

CREATE TABLE IF NOT EXISTS note (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES card(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_note_card ON note(card_id);

-- Sarah-generated quizzes and flashcard sets, persisted so they survive a refresh
-- and sync across devices/members instead of living only in browser localStorage.
CREATE TABLE IF NOT EXISTS study_artifact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES card(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  type VARCHAR(20) NOT NULL, -- quiz | flashcardset | summary
  title VARCHAR(500) NOT NULL,
  content JSONB NOT NULL,    -- shape depends on `type`; see study/study.ts
  source_resource_id UUID REFERENCES resource(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_artifact_card ON study_artifact(card_id, type);
