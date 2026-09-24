import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";

export interface UserProfile {
  userId: string;
  email: string | null;
  name: string | null;
  avatarUrl?: string;
  authProvider: string;
}

// GET /v1/me - returns the caller's identity as resolved by the real Firebase
// auth handler in identity/identity.ts (see AuthData there).
export const getMe = api(
  { expose: true, method: "GET", path: "/v1/me", auth: true },
  async (): Promise<UserProfile> => {
    const auth = getAuthData()!;
    return {
      userId: auth.userID,
      email: auth.email,
      name: auth.displayName,
      authProvider: "firebase",
    };
  }
);
