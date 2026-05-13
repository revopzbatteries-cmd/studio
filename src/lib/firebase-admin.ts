import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Builds the Firebase Admin credential from environment variables.
 *
 * Supports two modes:
 *
 * MODE A (recommended) — single JSON env var:
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":...}'
 *
 * MODE B — individual fields:
 *   FIREBASE_PROJECT_ID=revopz
 *   FIREBASE_CLIENT_EMAIL=...@...iam.gserviceaccount.com
 *   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 */
function buildCredential() {
  // ── MODE A: Full service account JSON ──────────────────────────────────────
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      const sa = JSON.parse(serviceAccountJson);
      console.log('[firebase-admin] Initializing with FIREBASE_SERVICE_ACCOUNT_JSON');
      return cert(sa);
    } catch {
      throw new Error('[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.');
    }
  }

  // ── MODE B: Individual fields ──────────────────────────────────────────────
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) throw new Error('[firebase-admin] FIREBASE_PROJECT_ID is missing.');
  if (!clientEmail) throw new Error('[firebase-admin] FIREBASE_CLIENT_EMAIL is missing.');
  if (!rawKey) throw new Error('[firebase-admin] FIREBASE_PRIVATE_KEY is missing.');

  // Handle all common formatting issues:
  // 1. Strip surrounding double-quotes (some editors add these)
  // 2. Convert literal \n sequences → real newlines
  // 3. Trim whitespace
  let privateKey = rawKey;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n').trim();

  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error(
      '[firebase-admin] FIREBASE_PRIVATE_KEY is not a valid PEM key.\n' +
      'Copy "private_key" exactly from your service account JSON file.'
    );
  }

  console.log('[firebase-admin] Initializing with individual FIREBASE_* env vars');
  console.log(`[firebase-admin] Project: ${projectId} | Email: ${clientEmail}`);
  return cert({ projectId, clientEmail, privateKey });
}

// ── Singleton initialization ───────────────────────────────────────────────────

const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({ credential: buildCredential() });

// ── Exports ───────────────────────────────────────────────────────────────────

export const adminAuth = getAuth(firebaseAdminApp);
export const adminDb = getFirestore(firebaseAdminApp);
export default firebaseAdminApp;