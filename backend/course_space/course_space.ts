import { api, APIError } from "encore.dev/api";
import { cardDB, Card, Role } from "../card/card";

export interface JoinResponse {
  card: Card;
  role: Role;
  joinedAt: string;
}

export interface ShareLinkResponse {
  shareToken: string;
  url: string;
  requireApproval: boolean;
}

// POST /v1/cards/:cardId/share-link - Generate/Reset link (AD-024, AD-062)
export const resetShareLink = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/share-link" },
  async ({ cardId }: { cardId: string }): Promise<ShareLinkResponse> => {
    const newToken = Math.random().toString(36).substring(2, 12);
    await cardDB.exec`
      UPDATE card 
      SET share_token = ${newToken}, is_shared = true
      WHERE id = ${cardId}
    `;

    return {
      shareToken: newToken,
      url: `https://lumira.study/join/${newToken}`,
      requireApproval: false,
    };
  }
);

// POST /v1/join/:shareToken - Join Course Space (AD-025, AD-033)
export const joinCourseSpace = api(
  { expose: true, method: "POST", path: "/v1/join/:shareToken" },
  async ({ shareToken }: { shareToken: string }): Promise<JoinResponse> => {
    const originCard = await cardDB.queryRow`
      SELECT id, name, color, is_shared as "isShared" 
      FROM card 
      WHERE share_token = ${shareToken} AND is_shared = true
    `;
    if (!originCard) {
      throw APIError.notFound("Invite link invalid or expired");
    }

    const joinerUserId = "00000000-0000-0000-0000-000000000002"; // joiner persona

    // AD-025: joining auto-creates a new member Card with origin references
    const joinerCard = await cardDB.queryRow`
      INSERT INTO card (owner_id, name, color, is_shared)
      VALUES (${joinerUserId}, ${originCard.name + " (Joined)"}, ${originCard.color}, true)
      RETURNING id, owner_id as "ownerId", name, color, is_shared as "isShared", created_at as "createdAt"
    `;

    // Create ACTIVE membership on the origin Course Space
    await cardDB.exec`
      INSERT INTO card_membership (card_id, user_id, status, role)
      VALUES (${originCard.id}, ${joinerUserId}, 'ACTIVE', 'MEMBER')
      ON CONFLICT (card_id, user_id) DO UPDATE SET status = 'ACTIVE'
    `;

    // Emit MEMBER_JOINED event (AD-026)
    await cardDB.exec`
      INSERT INTO course_space_event (card_id, type, actor_user_id, payload)
      VALUES (${originCard.id}, 'MEMBER_JOINED', ${joinerUserId}, jsonb_build_object('event', 'Member joined via share link'))
    `;

    return {
      card: {
        id: joinerCard.id,
        ownerId: joinerCard.ownerId,
        name: joinerCard.name,
        color: joinerCard.color,
        isShared: true,
        requireApproval: false,
        createdAt: joinerCard.createdAt.toISOString(),
      },
      role: "MEMBER",
      joinedAt: new Date().toISOString(),
    };
  }
);

// GET /v1/cards/:cardId/events - Activity Feed (AD-026)
export const getCourseSpaceEvents = api(
  { expose: true, method: "GET", path: "/v1/cards/:cardId/events" },
  async ({ cardId }: { cardId: string }) => {
    const rows = await cardDB.query`
      SELECT id, card_id as "cardId", type, actor_user_id as "actorUserId", created_at as "createdAt", payload
      FROM course_space_event
      WHERE card_id = ${cardId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const events = [];
    for await (const row of rows) {
      events.push({
        id: row.id,
        cardId: row.cardId,
        type: row.type,
        actorUserId: row.actorUserId,
        createdAt: row.createdAt.toISOString(),
        payload: row.payload,
      });
    }
    return { events };
  }
);
