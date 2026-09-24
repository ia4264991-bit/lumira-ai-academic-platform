import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { cardDB } from "../card/card";
import { assertSarahAuthorized } from "../sarah/sarah_security";

export interface Note {
  id: string;
  owningCardId: string;
  title: string;
  content: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

function rowToNote(row: any): Note {
  return {
    id: row.id,
    owningCardId: row.cardId,
    title: row.title,
    content: row.content,
    isShared: row.isShared,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// GET /v1/cards/:cardId/notes
export const listNotes = api(
  { expose: true, method: "GET", path: "/v1/cards/:cardId/notes", auth: true },
  async ({ cardId }: { cardId: string }): Promise<{ notes: Note[] }> => {
    const userId = getAuthData()!.userID;
    await assertSarahAuthorized(userId, cardId);
    const rows = await cardDB.query`
      SELECT id, card_id as "cardId", title, content, is_shared as "isShared",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM note WHERE card_id = ${cardId} ORDER BY created_at DESC
    `;
    const notes: Note[] = [];
    for await (const row of rows) notes.push(rowToNote(row));
    return { notes };
  }
);

export interface CreateNoteRequest {
  cardId: string;
  title: string;
  content: string;
  isShared?: boolean;
}

// POST /v1/cards/:cardId/notes
export const createNote = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/notes", auth: true },
  async (req: CreateNoteRequest): Promise<Note> => {
    const userId = getAuthData()!.userID;
    await assertSarahAuthorized(userId, req.cardId);
    if (!req.title?.trim()) throw APIError.invalidArgument("Title is required");

    const row = await cardDB.queryRow`
      INSERT INTO note (card_id, author_id, title, content, is_shared)
      VALUES (${req.cardId}, ${userId}, ${req.title.trim()}, ${req.content || ""}, ${!!req.isShared})
      RETURNING id, card_id as "cardId", title, content, is_shared as "isShared",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    if (!row) throw APIError.internal("failed to create note");
    return rowToNote(row);
  }
);

export interface UpdateNoteRequest {
  noteId: string;
  title?: string;
  content?: string;
  isShared?: boolean;
}

// PATCH /v1/notes/:noteId
export const updateNote = api(
  { expose: true, method: "PATCH", path: "/v1/notes/:noteId", auth: true },
  async (req: UpdateNoteRequest): Promise<Note> => {
    const userId = getAuthData()!.userID;
    const existing = await cardDB.queryRow`SELECT card_id as "cardId", author_id as "authorId" FROM note WHERE id = ${req.noteId}`;
    if (!existing) throw APIError.notFound("Note not found");
    if (existing.authorId !== userId) throw APIError.permissionDenied("Only the note's author can edit it");

    const row = await cardDB.queryRow`
      UPDATE note SET
        title = COALESCE(${req.title}, title),
        content = COALESCE(${req.content}, content),
        is_shared = COALESCE(${req.isShared}, is_shared),
        updated_at = NOW()
      WHERE id = ${req.noteId}
      RETURNING id, card_id as "cardId", title, content, is_shared as "isShared",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    if (!row) throw APIError.internal("failed to update note");
    return rowToNote(row);
  }
);
