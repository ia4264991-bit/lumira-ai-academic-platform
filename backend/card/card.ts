import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

// Database definition for Cards, Memberships, Artifacts, and Events (AD-019, AD-023, AD-026, AD-045, AD-057)
export const cardDB = new SQLDatabase("card", {
  migrations: "./migrations",
});

export type Role = "OWNER" | "ADMIN" | "MEMBER";
export type MembershipStatus = "ACTIVE" | "INVITED" | "LEFT" | "REMOVED";
export type ArtifactType = "resource" | "note" | "studyset" | "summary" | "quiz" | "flashcardset";

export interface Card {
  id: string;
  ownerId: string;
  name: string;
  color: string;
  isShared: boolean;
  shareToken?: string;
  requireApproval: boolean;
  createdAt: string;
  role?: Role;
}

export interface CreateCardRequest {
  name: string;
  color?: string;
}

export interface CardMember {
  userId: string;
  cardId: string;
  status: MembershipStatus;
  role: Role;
  joinedAt: string;
}

export interface CourseSpaceEvent {
  id: string;
  cardId: string;
  type: string;
  actorUserId: string;
  createdAt: string;
  payload: Record<string, any>;
}

// POST /v1/cards - Create Card (AD-019, AD-048)
export const createCard = api(
  { expose: true, method: "POST", path: "/v1/cards" },
  async (req: CreateCardRequest): Promise<Card> => {
    // In MVP identity boundary, userId is provided via header or default
    const ownerId = "00000000-0000-0000-0000-000000000001";
    const name = req.name.trim();
    if (!name) throw APIError.invalidArgument("Card name is required");
    const color = req.color || "indigo";

    const row = await cardDB.queryRow`
      INSERT INTO card (owner_id, name, color, is_shared, require_approval)
      VALUES (${ownerId}, ${name}, ${color}, false, false)
      RETURNING id, owner_id as "ownerId", name, color, is_shared as "isShared", require_approval as "requireApproval", created_at as "createdAt"
    `;
    if (!row) throw APIError.internal("Failed to create card");

    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      color: row.color,
      isShared: row.isShared,
      requireApproval: row.requireApproval,
      createdAt: row.createdAt.toISOString(),
      role: "OWNER",
    };
  }
);

// GET /v1/cards - List user Cards / Course Spaces (AD-019: filtered views over single aggregate)
export const listCards = api(
  { expose: true, method: "GET", path: "/v1/cards" },
  async (params: { scope?: string }): Promise<{ cards: Card[] }> => {
    const userId = "00000000-0000-0000-0000-000000000001";
    if (params.scope === "shared") {
      // Course Spaces view: Cards with isShared=true where caller is owner or active member
      const rows = await cardDB.query`
        SELECT c.id, c.owner_id as "ownerId", c.name, c.color, c.is_shared as "isShared", 
               c.share_token as "shareToken", c.require_approval as "requireApproval", c.created_at as "createdAt",
               COALESCE(m.role, CASE WHEN c.owner_id = ${userId} THEN 'OWNER' ELSE 'MEMBER' END) as "role"
        FROM card c
        LEFT JOIN card_membership m ON m.card_id = c.id AND m.user_id = ${userId} AND m.status = 'ACTIVE'
        WHERE c.is_shared = true AND (c.owner_id = ${userId} OR m.id IS NOT NULL)
        ORDER BY c.created_at DESC
      `;
      const cards: Card[] = [];
      for await (const row of rows) {
        cards.push({
          id: row.id,
          ownerId: row.ownerId,
          name: row.name,
          color: row.color,
          isShared: row.isShared,
          shareToken: row.shareToken,
          requireApproval: row.requireApproval,
          createdAt: row.createdAt.toISOString(),
          role: row.role as Role,
        });
      }
      return { cards };
    }

    // Default: My personal Cards owned by the user
    const rows = await cardDB.query`
      SELECT id, owner_id as "ownerId", name, color, is_shared as "isShared", 
             share_token as "shareToken", require_approval as "requireApproval", created_at as "createdAt"
      FROM card
      WHERE owner_id = ${userId}
      ORDER BY created_at DESC
    `;
    const cards: Card[] = [];
    for await (const row of rows) {
      cards.push({
        id: row.id,
        ownerId: row.ownerId,
        name: row.name,
        color: row.color,
        isShared: row.isShared,
        shareToken: row.shareToken,
        requireApproval: row.requireApproval,
        createdAt: row.createdAt.toISOString(),
        role: "OWNER",
      });
    }
    return { cards };
  }
);

// GET /v1/cards/:cardId
export const getCard = api(
  { expose: true, method: "GET", path: "/v1/cards/:cardId" },
  async ({ cardId }: { cardId: string }): Promise<Card> => {
    const row = await cardDB.queryRow`
      SELECT id, owner_id as "ownerId", name, color, is_shared as "isShared", 
             share_token as "shareToken", require_approval as "requireApproval", created_at as "createdAt"
      FROM card
      WHERE id = ${cardId}
    `;
    if (!row) throw APIError.notFound("Card not found");

    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      color: row.color,
      isShared: row.isShared,
      shareToken: row.shareToken,
      requireApproval: row.requireApproval,
      createdAt: row.createdAt.toISOString(),
    };
  }
);

// POST /v1/cards/:cardId/share - Enable Course Space sharing capability (AD-019, AD-023)
export const enableSharing = api(
  { expose: true, method: "POST", path: "/v1/cards/:cardId/share" },
  async ({ cardId }: { cardId: string }): Promise<Card> => {
    const ownerId = "00000000-0000-0000-0000-000000000001";
    const shareToken = Math.random().toString(36).substring(2, 12);

    await cardDB.exec`
      UPDATE card 
      SET is_shared = true, share_token = COALESCE(share_token, ${shareToken})
      WHERE id = ${cardId} AND owner_id = ${ownerId}
    `;

    // Ensure Owner membership exists
    await cardDB.exec`
      INSERT INTO card_membership (card_id, user_id, status, role)
      VALUES (${cardId}, ${ownerId}, 'ACTIVE', 'OWNER')
      ON CONFLICT DO NOTHING
    `;

    return getCard({ cardId });
  }
);
