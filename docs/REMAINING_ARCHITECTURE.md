# Lumira — Remaining Architecture & Implementation Guide

Status: written after the "production-ready pass" that added real Firebase auth,
real Resource/Note storage, real Gemini AI calls, and a real cache layer. This
document is for whoever (human or AI agent, e.g. Google AI Studio / Antigravity)
picks up the next slice of work. Read it before writing code — it tells you
what's real, what's still a stub, and exactly what secrets/config you need.

## 1. What this pass actually implemented (verify, don't re-build)

| Area | Before | Now |
|---|---|---|
| Auth | Every endpoint hardcoded the same fake UUID. No token was ever checked. | `backend/identity/identity.ts` verifies a real Firebase ID token via `firebase-admin`, maps it to an internal UUID (`app_user` table), and every mutating endpoint uses `auth: true` + `getAuthData()`. |
| Resources/Notes | Fully mocked in the frontend's `localStorage`. No backend service existed. | `backend/resource/resource.ts` and `backend/note/note.ts` — real Postgres tables (`resource`, `note`), real CRUD endpoints. |
| File storage | None. | `backend/resource/resource.ts` declares an Encore Object Storage `Bucket` (`resource-files`). `uploadResourceFile` stores real file bytes there; `downloadResourceFile` reads them back (base64 MVP, see §4). |
| AI (Sarah) | Templated placeholder text; a raw `fetch` to Gemini existed but used `process.env` directly and had no real grounding. | `backend/sarah/sarah.ts` uses `@google/generative-ai`, reads the key via `encore.dev/config`'s `secret()`, and grounds every prompt in the caller's actual `resource.extracted_text` rows (RAG-lite). `generateArtifact` now asks Gemini for real JSON-schema'd quizzes/flashcards and persists them to `study_artifact`. |
| Caching | None. | `backend/sarah/sarah_security.ts` — a Redis `CacheCluster` (`lumira-cache`) with a 30s `StringKeyspace` cache-aside in front of the usage-meter query. |
| Frontend → backend | `api.ts` hit `http://localhost:4000` hardcoded and silently fell back to fake data on any failure, in every environment including production. | Configurable `VITE_API_BASE_URL`; every call sends the real Firebase ID token as `Authorization: Bearer <token>`; resources/notes/quizzes/flashcards call the real endpoints above instead of `localStorage`. |

## 2. Required secrets & config before this runs

```bash
# Firebase Admin SDK — Firebase Console → Project Settings → Service Accounts →
# Generate new private key. Paste the whole JSON file content as the secret value.
encore secret set --type dev,prod FirebaseServiceAccountJSON

# Gemini API key — https://aistudio.google.com/apikey
encore secret set --type dev,prod GeminiApiKey
```

Frontend `.env` (or your host's env var config):
```
VITE_API_BASE_URL=https://<your-encore-env>.encr.app   # or http://localhost:4000 for local dev
```

Without `GeminiApiKey` set, `askWorkspaceSarah` and `generateArtifact` now throw
`APIError.failedPrecondition` rather than silently returning canned text — this
is intentional. A tutor that confidently makes things up is worse than one that
says "not configured yet."

## 3. Architecture decisions made in this pass (append to your AD-log)

- **AD-063 — Firebase UID ↔ internal UUID mapping.** Every existing table uses
  `UUID` for user ids (`card.owner_id`, `card_membership.user_id`, etc.), but
  Firebase UIDs are ~28-char strings, not UUIDs. Rather than migrate every
  column, `identity.app_user` maps `firebase_uid → id (UUID)` and the auth
  handler resolves this on every request (upserting on first sign-in). All
  existing endpoints keep using UUIDs; only the identity service knows about
  Firebase UIDs at all.
- **AD-064 — Resource storage is table + bucket, not bucket-only.** `resource`
  rows hold metadata and (for text resources) `extracted_text` directly in
  Postgres; the `resource-files` bucket holds only the original file bytes
  when one was actually uploaded (`storage_key` is null otherwise). This keeps
  Sarah's grounding queries a simple SQL `SELECT`, no bucket round-trip needed
  per chat turn.
- **AD-065 — Generated study artifacts are persisted, not ephemeral.**
  `study_artifact` stores every Gemini-generated quiz/flashcard set as JSONB,
  keyed by `card_id` + `type`. This is what makes them survive a refresh and
  (once membership-scoped fetching is added — see §4) sync across a Course
  Space's members instead of living in one browser's `localStorage`.

## 4. What's still NOT done — concrete next slices, in priority order

1. **Text extraction pipeline.** `uploadResourceFile` stores raw bytes and
   marks the resource `READY` with `extracted_text = NULL`. Sarah's grounding
   query filters on `extracted_text IS NOT NULL`, so **uploaded PDFs/DOCX/PPTX
   are currently invisible to Sarah** — only pasted-text resources are
   grounded. Next step: an async worker (Encore Pub/Sub `Topic` +
   `Subscription`, or a Postgres-polling cron job) that downloads the bytes
   from `resourceFiles`, runs extraction (e.g. `pdf-parse` for PDF, `mammoth`
   for DOCX, `xlsx`/`node-pptx-parser` equivalents), and writes the result
   back to `resource.extracted_text`, flipping status `PROCESSING → READY`.
2. **Large-file uploads.** The current `uploadResourceFile` endpoint takes
   base64 in a JSON body — fine for the 25MB MVP cap, bad for anything larger
   (JSON/base64 overhead, memory pressure). Switch to `Bucket.signedUploadUrl()`
   (see `encore.dev/storage/objects` docs) so the browser uploads directly to
   the bucket and the backend only writes the `resource` row afterward.
3. **Membership-scoped study artifacts.** `study_artifact` and `resource` are
   currently readable by anyone `assertSarahAuthorized` lets into the card —
   that's correct for Course Spaces, but there's no distinction yet between
   "shared with the whole Course Space" vs "private to me even inside a Course
   Space I own." Add an `is_shared` check (the column already exists on both
   tables) to the list endpoints before returning rows.
4. **Rate limiting.** The `CacheCluster` added in this pass only caches reads.
   `askWorkspaceSarah`/`generateArtifact` have no per-user rate limit — a
   `IntKeyspace` + `increment()` (pattern already shown in Encore's own docs,
   same cluster) in front of both endpoints is the natural next use of the
   same cache cluster.
5. **CI / deployment.** No GitHub Actions workflow, no `encore.app` link to a
   real Encore Cloud environment yet. `encore app link` + a deploy-on-push
   workflow is the natural next step once the above is stable.
6. **Observability.** Encore gives you request tracing and structured logs for
   free in its dashboard once the app is linked (`encore app link`) — nothing
   custom needed here, just link the app and use it.
7. **Quiz/flashcard UI polish.** The frontend now calls
   `LumiraAPI.generateFlashcards` / `generateQuiz`, but `CardWorkspaceModal`'s
   Flashcards/Quizzes tabs still only *read* existing `study_artifact` rows —
   there's no "Generate with Sarah" button wired in the UI yet. That's a
   frontend-only task once you're happy with the backend contract above.

## 5. Rules for whoever implements the above

Same discipline as the rest of this contract: don't invent a new architecture
decision silently. If a next slice above turns out to need a schema change or
a new service, write it here (or in `docs/DECISIONS.md` if that file exists by
then) *before* writing the implementation, the same way this document explains
AD-063 through AD-065 before the tables show up in a migration file.
