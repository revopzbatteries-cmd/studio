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
  const { adminProfile, error } = await requireAdminAuth(request, ['manager', 'product_manager']);
  if (error) return error;

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
  const { uid: requestorUid, adminProfile, error } = await requireAdminAuth(request, ['manager']);
  if (error) return error;

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

  } catch (err: any) {
    console.error('[POST /api/admin/admins] Firestore write failed — rolling back Auth user:', err.message);
    await adminAuth.deleteUser(userRecord.uid).catch((rollbackErr) => {
      console.error('[POST /api/admin/admins] Rollback failed:', rollbackErr.message);
    });
    return NextResponse.json({ error: 'Failed to create admin profile. Please try again.' }, { status: 500 });
  }

  return NextResponse.json(
    {
      uid: userRecord.uid,
      email: userRecord.email,
    },
    { status: 201 }
  );
}

// ─── PATCH /api/admin/admins ──────────────────────────────────────────────────
// Allowed roles: manager only
// Updates an admin's status (active vs suspended)
export async function PATCH(request: NextRequest) {
  const { uid: requestorUid, adminProfile, error } = await requireAdminAuth(request, ['manager']);
  if (error) return error;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { uid, status } = body;
  if (!uid || !status) {
    return NextResponse.json({ error: 'Missing uid or status.' }, { status: 400 });
  }

  if (status !== 'active' && status !== 'suspended' && status !== 'inactive') {
    return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
  }

  // Prevent self-suspension
  if (uid === requestorUid) {
    return NextResponse.json({ error: 'You cannot suspend your own account.' }, { status: 400 });
  }

  try {
    const adminRef = adminDb.collection('admins').doc(uid);
    const adminSnap = await adminRef.get();
    if (!adminSnap.exists) {
      return NextResponse.json({ error: 'Admin user not found.' }, { status: 404 });
    }

    // Update status in Firestore
    await adminRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: requestorUid,
    });

    // Enable/Disable user in Firebase Auth
    await adminAuth.updateUser(uid, {
      disabled: status !== 'active',
    });

    return NextResponse.json({ success: true, uid, status });
  } catch (err: any) {
    console.error('[PATCH /api/admin/admins] Failed to update admin status:', err.message);
    return NextResponse.json({ error: 'Failed to update admin status.' }, { status: 500 });
  }
}

// ─── DELETE /api/admin/admins ─────────────────────────────────────────────────
// Allowed roles: manager only
// Deletes an admin's Auth user and Firestore doc.
export async function DELETE(request: NextRequest) {
  const { uid: requestorUid, adminProfile, error } = await requireAdminAuth(request, ['manager']);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid parameter.' }, { status: 400 });
  }

  // Prevent self-deletion
  if (uid === requestorUid) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }

  try {
    const adminRef = adminDb.collection('admins').doc(uid);
    const adminSnap = await adminRef.get();
    if (!adminSnap.exists) {
      return NextResponse.json({ error: 'Admin user not found in Firestore.' }, { status: 404 });
    }

    // Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(uid);
    } catch (authErr: any) {
      if (authErr?.code !== 'auth/user-not-found') {
        console.error('[DELETE /api/admin/admins] Auth delete user failed:', authErr.message);
        throw authErr;
      }
    }

    // Delete from Firestore
    await adminRef.delete();

    return NextResponse.json({ success: true, uid });
  } catch (err: any) {
    console.error('[DELETE /api/admin/admins] Failed to delete admin:', err.message);
    return NextResponse.json({ error: 'Failed to delete admin.' }, { status: 500 });
  }
}
