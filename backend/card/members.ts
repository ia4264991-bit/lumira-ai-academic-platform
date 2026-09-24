import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { cardDB, Role, CardMember } from "./card";

// GET /v1/cards/:cardId/members - AD-023, AD-032
export const listMembers = api(
  { expose: true, method: "GET", path: "/v1/cards/:cardId/members", auth: true },
  async ({ cardId }: { cardId: string }): Promise<{ members: CardMember[] }> => {
    const rows = await cardDB.query`
      SELECT card_id as "cardId", user_id as "userId", status, role, joined_at as "joinedAt"
      FROM card_membership
      WHERE card_id = ${cardId}
      ORDER BY joined_at ASC
    `;
    const members: CardMember[] = [];
    for await (const row of rows) {
      members.push({
        cardId: row.cardId,
        userId: row.userId,
        status: row.status,
        role: row.role as Role,
        joinedAt: row.joinedAt.toISOString(),
      });
    }
    return { members };
  }
);

// POST /v1/cards/:cardId/members/:userId/promote - AD-034: Owner only
export const promoteMember = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/members/:userId/promote", auth: true },
  async ({ cardId, userId }: { cardId: string; userId: string }) => {
    const callerId = getAuthData()!.userID;
    // Check if caller is Owner
    const card = await cardDB.queryRow`
      SELECT owner_id as "ownerId" FROM card WHERE id = ${cardId}
    `;
    if (!card || card.ownerId !== callerId) {
      throw APIError.permissionDenied("Only the Course Space Owner can promote members");
    }

    await cardDB.exec`
      UPDATE card_membership SET role = 'ADMIN'
      WHERE card_id = ${cardId} AND user_id = ${userId} AND status = 'ACTIVE'
    `;

    await cardDB.exec`
      INSERT INTO course_space_event (card_id, type, actor_user_id, payload)
      VALUES (${cardId}, 'MEMBER_PROMOTED', ${callerId}, jsonb_build_object('promotedUserId', ${userId}, 'newRole', 'ADMIN'))
    `;

    return { success: true };
  }
);

// POST /v1/cards/:cardId/leave - AD-042: Owner CANNOT leave without transfer/dissolve
export const leaveCourseSpace = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/leave", auth: true },
  async ({ cardId }: { cardId: string }) => {
    const callerId = getAuthData()!.userID;
    const card = await cardDB.queryRow`
      SELECT owner_id as "ownerId" FROM card WHERE id = ${cardId}
    `;
    if (card && card.ownerId === callerId) {
      // AD-042: Owner cannot leave while still Owner
      throw APIError.aborted("Owner cannot leave Course Space without first transferring ownership or dissolving the space");
    }

    await cardDB.exec`
      UPDATE card_membership SET status = 'LEFT'
      WHERE card_id = ${cardId} AND user_id = ${callerId} AND status = 'ACTIVE'
    `;

    await cardDB.exec`
      INSERT INTO course_space_event (card_id, type, actor_user_id, payload)
      VALUES (${cardId}, 'MEMBER_LEFT', ${callerId}, '{}'::jsonb)
    `;

    return { success: true };
  }
);
