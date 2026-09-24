import { api } from "encore.dev/api";

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  authProvider: string;
}

// GET /v1/me - Identity boundary (AD-056)
export const getMe = api(
  { expose: true, method: "GET", path: "/v1/me" },
  async (): Promise<UserProfile> => {
    return {
      userId: "00000000-0000-0000-0000-000000000001",
      email: "student@lumira.study",
      name: "Lumira Scholar",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      authProvider: "firebase",
    };
  }
);
