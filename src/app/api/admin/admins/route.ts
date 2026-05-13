import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { requireAdminAuth } from '@/lib/api-auth';
import { addAdminSchema } from '@/lib/validations';
import { toFirestoreRole, ROLE_PERMISSIONS } from '@/lib/rbac';

export const runtime = 'nodejs';

// ─── GET /api/admin/admins ────────────────────────────────────────────────────
// Allowed roles: manager, product_manager
// Returns a sanitized list of all admin documents from Firestore.
export async function GET(request: NextRequest) {
  console.log('[GET /api/admin/admins] Request received');

  const { adminProfile, error } = await requireAdminAuth(request, ['manager', 'product_manager']);
  if (error) return error;

  console.log(`[GET /api/admin/admins] Authorized as ${adminProfile.role} (${adminProfile.uid})`);

  try {
    const snapshot = await adminDb.collection('admins').get();

    const admins = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? '',
        email: data.email ?? '',
        // Return the UI display role based on Firestore snake_case value
        role: data.role ?? '',
        status: data.status ?? 'active',
        permissions: Array.isArray(data.permissions) ? data.permissions : [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        createdBy: data.createdBy ?? null,
      };
    });

    console.log(`[GET /api/admin/admins] Returning ${admins.length} admin(s)`);

    return NextResponse.json({ admins });
  } catch (err: any) {
    console.error('[GET /api/admin/admins] Firestore fetch failed:', err.message);
    return NextResponse.json({ error: 'Failed to fetch admins.' }, { status: 500 });
  }
}

// ─── POST /api/admin/admins ───────────────────────────────────────────────────
// Allowed roles: manager only
// Creates a new Firebase Auth user + Firestore admin document.
// Does NOT affect the currently logged-in manager's session.
export async function POST(request: NextRequest) {
  console.log('[POST /api/admin/admins] Request received');

  const { uid: requestorUid, adminProfile, error } = await requireAdminAuth(request, ['manager']);
  if (error) return error;

  console.log(`[POST /api/admin/admins] Authorized as ${adminProfile.role} (${requestorUid})`);

  // ── Parse and validate the request body ─────────────────────────────────────

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = addAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed. Please correct the highlighted fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;
  console.log(`[POST /api/admin/admins] Creating admin: ${data.email} (role: ${data.role})`);

  // ── Check for duplicate email in Firebase Auth ───────────────────────────────

  try {
    await adminAuth.getUserByEmail(data.email);
    console.warn(`[POST /api/admin/admins] Email already exists in Auth: ${data.email}`);
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  } catch (err: any) {
    if (err?.code !== 'auth/user-not-found') {
      console.error('[POST /api/admin/admins] Auth email lookup failed:', err.message);
      throw err;
    }
    // auth/user-not-found is expected — the email is available
  }

  // ── Check for duplicate email in Firestore admins collection ─────────────────

  const existingDoc = await adminDb
    .collection('admins')
    .where('email', '==', data.email)
    .limit(1)
    .get();

  if (!existingDoc.empty) {
    console.warn(`[POST /api/admin/admins] Email already exists in Firestore: ${data.email}`);
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  // ── Create Firebase Auth user ────────────────────────────────────────────────

  let userRecord;
  try {
    userRecord = await adminAuth.createUser({
      displayName: data.name,
      email: data.email,
      password: data.password,
      disabled: false,
    });
    console.log(`[POST /api/admin/admins] Auth user created: ${userRecord.uid}`);
  } catch (err: any) {
    console.error('[POST /api/admin/admins] Auth createUser failed:', err.code, err.message);
    if (err?.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create authentication account.' }, { status: 500 });
  }

  // ── Create Firestore admin document (rollback on failure) ────────────────────

  try {
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      appRole: 'admin',
      appAccess: true,
    });

    const firestoreRole = toFirestoreRole(data.role);
    const permissions = ROLE_PERMISSIONS[firestoreRole] ?? [];

    await adminDb.collection('admins').doc(userRecord.uid).set({
      name: data.name,
      email: data.email,
      role: firestoreRole,
      permissions,
      status: 'active',
      createdBy: requestorUid,
      createdByName: adminProfile.name ?? 'Unknown',
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log(`[POST /api/admin/admins] Firestore document created for: ${userRecord.uid}`);
  } catch (err: any) {
    console.error('[POST /api/admin/admins] Firestore write failed — rolling back Auth user:', err.message);
    await adminAuth.deleteUser(userRecord.uid).catch((rollbackErr) => {
      console.error('[POST /api/admin/admins] Rollback failed:', rollbackErr.message);
    });
    return NextResponse.json({ error: 'Failed to create admin profile. Please try again.' }, { status: 500 });
  }

  console.log(`[POST /api/admin/admins] Admin created successfully: ${userRecord.uid}`);

  return NextResponse.json(
    {
      uid: userRecord.uid,
      email: userRecord.email,
    },
    { status: 201 }
  );
}
