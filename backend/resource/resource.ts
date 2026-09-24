import { api, APIError } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";
import { getAuthData } from "~encore/auth";
import { cardDB } from "../card/card";
import { assertSarahAuthorized } from "../sarah/sarah_security";

export type SupportedFileType = "pdf" | "docx" | "pptx" | "xlsx" | "csv" | "txt" | "image";
export type ResourceStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

// Real object storage bucket for uploaded file bytes (PDF/DOCX/PPTX/XLSX/images).
// Text-only resources (pasted notes) skip this and only populate `extractedText`.
export const resourceFiles = new Bucket("resource-files", {});

export interface Resource {
  id: string;
  owningCardId: string;
  title: string;
  mimeType: string;
  fileType: SupportedFileType;
  sizeBytes?: number;
  status: ResourceStatus;
  extractedText?: string;
  hasFile: boolean;
  isShared: boolean;
  createdAt: string;
}

function mimeFor(fileType: SupportedFileType): string {
  const map: Record<SupportedFileType, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
    txt: "text/plain",
    image: "image/*",
  };
  return map[fileType] || "application/octet-stream";
}

function rowToResource(row: any): Resource {
  return {
    id: row.id,
    owningCardId: row.cardId,
    title: row.title,
    mimeType: row.mimeType,
    fileType: row.fileType,
    sizeBytes: row.sizeBytes ? Number(row.sizeBytes) : undefined,
    status: row.status,
    extractedText: row.extractedText,
    hasFile: !!row.storageKey,
    isShared: row.isShared,
    createdAt: row.createdAt.toISOString(),
  };
}

// GET /v1/cards/:cardId/resources
export const listResources = api(
  { expose: true, method: "GET", path: "/v1/cards/:cardId/resources", auth: true },
  async ({ cardId }: { cardId: string }): Promise<{ resources: Resource[] }> => {
    const userId = getAuthData()!.userID;
    await assertSarahAuthorized(userId, cardId);
    const rows = await cardDB.query`
      SELECT id, card_id as "cardId", title, mime_type as "mimeType", file_type as "fileType",
             size_bytes as "sizeBytes", storage_key as "storageKey", status,
             extracted_text as "extractedText", is_shared as "isShared", created_at as "createdAt"
      FROM resource WHERE card_id = ${cardId} ORDER BY created_at DESC
    `;
    const resources: Resource[] = [];
    for await (const row of rows) resources.push(rowToResource(row));
    return { resources };
  }
);

export interface AddTextResourceRequest {
  cardId: string;
  title: string;
  extractedText: string;
  fileType?: SupportedFileType;
}

// POST /v1/cards/:cardId/resources - text-only resource (pasted notes/slide transcript).
// For real file uploads see uploadResourceFile below.
export const addTextResource = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/resources", auth: true },
  async (req: AddTextResourceRequest): Promise<Resource> => {
    const userId = getAuthData()!.userID;
    await assertSarahAuthorized(userId, req.cardId);
    if (!req.title?.trim()) throw APIError.invalidArgument("Title is required");

    const fileType = req.fileType || "txt";
    const row = await cardDB.queryRow`
      INSERT INTO resource (card_id, owner_id, title, mime_type, file_type, status, extracted_text, is_shared)
      VALUES (${req.cardId}, ${userId}, ${req.title.trim()}, ${mimeFor(fileType)}, ${fileType}, 'READY', ${req.extractedText}, true)
      RETURNING id, card_id as "cardId", title, mime_type as "mimeType", file_type as "fileType",
                size_bytes as "sizeBytes", storage_key as "storageKey", status,
                extracted_text as "extractedText", is_shared as "isShared", created_at as "createdAt"
    `;
    if (!row) throw APIError.internal("failed to create resource");

    await cardDB.exec`
      INSERT INTO course_space_event (card_id, type, actor_user_id, payload)
      VALUES (${req.cardId}, 'RESOURCE_ADDED', ${userId}, jsonb_build_object('resourceId', ${row.id}, 'title', ${row.title}))
    `;
    return rowToResource(row);
  }
);

export interface UploadResourceFileRequest {
  cardId: string;
  title: string;
  fileType: SupportedFileType;
  base64Content: string; // small-file MVP path; see docs/REMAINING_ARCHITECTURE.md for signed-URL upload for large files
}

// POST /v1/cards/:cardId/resources/upload - real binary file, stored in the resource-files bucket.
// `status` starts PROCESSING; text extraction is a documented next step (see docs), so
// today it flips to READY immediately with no extractedText until that pipeline exists.
export const uploadResourceFile = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/resources/upload", auth: true },
  async (req: UploadResourceFileRequest): Promise<Resource> => {
    const userId = getAuthData()!.userID;
    await assertSarahAuthorized(userId, req.cardId);
    if (!req.title?.trim()) throw APIError.invalidArgument("Title is required");

    const buffer = Buffer.from(req.base64Content, "base64");
    if (buffer.length > 25 * 1024 * 1024) {
      throw APIError.invalidArgument("File exceeds the 25MB MVP upload limit");
    }

    const row = await cardDB.queryRow`
      INSERT INTO resource (card_id, owner_id, title, mime_type, file_type, size_bytes, status, is_shared)
      VALUES (${req.cardId}, ${userId}, ${req.title.trim()}, ${mimeFor(req.fileType)}, ${req.fileType}, ${buffer.length}, 'PROCESSING', true)
      RETURNING id, card_id as "cardId", title, mime_type as "mimeType", file_type as "fileType",
                size_bytes as "sizeBytes", storage_key as "storageKey", status,
                extracted_text as "extractedText", is_shared as "isShared", created_at as "createdAt"
    `;
    if (!row) throw APIError.internal("failed to create resource");

    const storageKey = `${req.cardId}/${row.id}`;
    try {
      await resourceFiles.upload(storageKey, buffer, { contentType: mimeFor(req.fileType) });
      await cardDB.exec`UPDATE resource SET storage_key = ${storageKey}, status = 'READY' WHERE id = ${row.id}`;
      row.storageKey = storageKey;
      row.status = "READY";
    } catch (err) {
      await cardDB.exec`UPDATE resource SET status = 'FAILED' WHERE id = ${row.id}`;
      row.status = "FAILED";
    }

    await cardDB.exec`
      INSERT INTO course_space_event (card_id, type, actor_user_id, payload)
      VALUES (${req.cardId}, 'RESOURCE_ADDED', ${userId}, jsonb_build_object('resourceId', ${row.id}, 'title', ${row.title}))
    `;
    return rowToResource(row);
  }
);

// GET /v1/resources/:resourceId/download - returns the file as base64.
// (A normal typed endpoint rather than a raw/streaming one, to keep this MVP path
// on APIs we've verified against Encore's docs rather than guessing raw handler semantics.)
export const downloadResourceFile = api(
  { expose: true, method: "GET", path: "/v1/resources/:resourceId/download", auth: true },
  async ({ resourceId }: { resourceId: string }): Promise<{ mimeType: string; title: string; base64Content: string }> => {
    const row = await cardDB.queryRow`
      SELECT storage_key as "storageKey", mime_type as "mimeType", title FROM resource WHERE id = ${resourceId}
    `;
    if (!row?.storageKey) throw APIError.notFound("Resource file not found");
    const data = await resourceFiles.download(row.storageKey);
    return { mimeType: row.mimeType, title: row.title, base64Content: Buffer.from(data).toString("base64") };
  }
);
