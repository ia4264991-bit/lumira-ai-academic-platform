import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { cardDB, Role } from "./card";

export interface ResourceItem {
  id: string;
  owningCardId?: string;
  owningUserId?: string;
  title: string;
  mimeType: string;
  status: "READY" | "FAILED";
  extractedText: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  owningCardId: string;
  title: string;
  content: string;
  isShared: boolean;
  createdAt: string;
}

export interface ShareArtifactRequest {
  artifactType: "resource" | "note" | "quiz" | "flashcardset" | "summary";
  artifactId: string;
  cardId: string;
}

// POST /v1/artifacts/:artifactType/:artifactId/share - Explicit share record (AD-045)
export const shareArtifact = api(
  { expose: true, method: "POST", path: "/v1/artifacts/:artifactType/:artifactId/share", auth: true },
  async ({ artifactType, artifactId, cardId }: ShareArtifactRequest) => {
    const userId = getAuthData()!.userID;

    await cardDB.exec`
      INSERT INTO artifact_share (artifact_type, artifact_id, card_id, shared_by)
      VALUES (${artifactType}, ${artifactId}, ${cardId}, ${userId})
      ON CONFLICT DO NOTHING
    `;

    // Record audit event (AD-026)
    await cardDB.exec`
      INSERT INTO course_space_event (card_id, type, actor_user_id, payload)
      VALUES (${cardId}, 'CONTENT_SHARED', ${userId}, jsonb_build_object('artifactType', ${artifactType}, 'artifactId', ${artifactId}))
    `;

    return { success: true };
  }
);

// DELETE /v1/artifacts/:artifactType/:artifactId/share/:cardId - Unshare (AD-044, AD-046)
export const unshareArtifact = api(
  { expose: true, method: "DELETE", path: "/v1/artifacts/:artifactType/:artifactId/share/:cardId", auth: true },
  async ({ artifactType, artifactId, cardId }: { artifactType: string; artifactId: string; cardId: string }) => {
    const userId = getAuthData()!.userID;

    await cardDB.exec`
      DELETE FROM artifact_share 
      WHERE artifact_type = ${artifactType} AND artifact_id = ${artifactId} AND card_id = ${cardId}
    `;

    await cardDB.exec`
      INSERT INTO course_space_event (card_id, type, actor_user_id, payload)
      VALUES (${cardId}, 'CONTENT_UNSHARED', ${userId}, jsonb_build_object('artifactType', ${artifactType}, 'artifactId', ${artifactId}))
    `;

    return { success: true };
  }
);
