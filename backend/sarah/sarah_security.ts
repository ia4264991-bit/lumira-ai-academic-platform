import { APIError } from "encore.dev/api";
import { cardDB } from "../card/card";

export interface SarahUsageMeter {
  userId: string;
  monthlyQuota: number;
  tokensUsedThisMonth: number;
  remainingTokens: number;
  resetDate: string;
}

/**
 * AD-054 & AD-058 & AD-056: Server-Authoritative Live Authorization Before Retrieval.
 * Validates caller's live status in card/space before building LLM context.
 */
export async function assertSarahAuthorized(userId: string, cardId: string): Promise<boolean> {
  // Query authoritative domain state in DB (live check, never client-claimed)
  const cardRow = await cardDB.queryRow`
    SELECT id, owner_id as "ownerId", is_shared as "isShared"
    FROM card
    WHERE id = ${cardId}
  `;
  if (!cardRow) {
    throw APIError.notFound("Workspace not found");
  }

  // If user is owner, unconditionally authorized
  if (cardRow.ownerId === userId) {
    return true;
  }

  // If shared Course Space, caller MUST hold active membership at this exact instant (AD-058)
  if (cardRow.isShared) {
    const memberRow = await cardDB.queryRow`
      SELECT id, status 
      FROM card_membership
      WHERE card_id = ${cardId} AND user_id = ${userId} AND status = 'ACTIVE'
    `;
    if (memberRow) {
      return true;
    }
  }

  throw APIError.permissionDenied("Unauthorized access to workspace context");
}

/**
 * AD-037: Server-Authoritative Usage Metering.
 * The client NEVER calculates its own quota.
 */
export async function getAuthoritativeUsage(userId: string): Promise<SarahUsageMeter> {
  const row = await cardDB.queryRow`
    SELECT COALESCE(SUM((payload->>'tokens')::int), 0) as "tokensUsed"
    FROM course_space_event
    WHERE actor_user_id = ${userId} AND type = 'SARAH_QUERY'
  `;

  const tokensUsed = Number(row?.tokensUsed || 0);
  const monthlyQuota = 150000; // 150k monthly token allowance

  return {
    userId,
    monthlyQuota,
    tokensUsedThisMonth: tokensUsed,
    remainingTokens: Math.max(0, monthlyQuota - tokensUsed),
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
  };
}
