import { authHandler } from "encore.dev/auth";
import { Header, APIError, Gateway } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import admin from "firebase-admin";

export const identityDB = new SQLDatabase("identity", {
  migrations: "./migrations",
});

// Set with: encore secret set --type prod,dev FirebaseServiceAccountJSON
// Value is the full JSON key downloaded from Firebase Console ->
// Project Settings -> Service Accounts -> Generate new private key.
const firebaseServiceAccountJSON = secret("FirebaseServiceAccountJSON");

let firebaseApp: admin.app.App | null = null;
function getFirebaseApp(): admin.app.App {
  if (firebaseApp) return firebaseApp;
  const raw = firebaseServiceAccountJSON();
  if (!raw) {
    throw APIError.internal(
      "FirebaseServiceAccountJSON secret is not configured. Run: encore secret set --type dev,prod FirebaseServiceAccountJSON"
    );
  }
  const credentials = JSON.parse(raw);
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
  return firebaseApp;
}

export interface AuthParams {
  authorization: Header<"Authorization">;
}

export interface AuthData {
  userID: string; // internal app_user.id (UUID) - NOT the Firebase UID
  firebaseUid: string;
  email: string | null;
  displayName: string | null;
}

// Verifies the Firebase ID token sent by the frontend (Authorization: Bearer <idToken>),
// then resolves (or creates on first sign-in) the internal app_user row so the rest of
// the schema can keep using UUID user ids rather than Firebase's own UID format.
export const auth = authHandler<AuthParams, AuthData>(async (params) => {
  const token = params.authorization?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    throw APIError.unauthenticated("missing Authorization header");
  }

  let decoded;
  try {
    decoded = await getFirebaseApp().auth().verifyIdToken(token);
  } catch (err: any) {
    throw APIError.unauthenticated("invalid or expired session: " + (err?.message || "verification failed"));
  }

  const firebaseUid = decoded.uid;
  const email = decoded.email || null;
  const displayName = (decoded.name as string) || null;
  const avatarUrl = (decoded.picture as string) || null;

  const row = await identityDB.queryRow`
    INSERT INTO app_user (firebase_uid, email, display_name, avatar_url, last_seen_at)
    VALUES (${firebaseUid}, ${email}, ${displayName}, ${avatarUrl}, NOW())
    ON CONFLICT (firebase_uid) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, app_user.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, app_user.avatar_url),
      last_seen_at = NOW()
    RETURNING id, email, display_name as "displayName"
  `;
  if (!row) {
    throw APIError.internal("failed to resolve user identity");
  }

  return {
    userID: row.id,
    firebaseUid,
    email: row.email,
    displayName: row.displayName,
  };
});

// Single API Gateway for the whole app, wired to the Firebase-backed auth handler above.
export const gateway = new Gateway({ authHandler: auth });
