import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { requireAdminAuth } from '@/lib/api-auth';

export const runtime = 'nodejs';

// ─── PATCH /api/admin/profile ─────────────────────────────────────────────────
// Any active admin can update their own name / email / password.
export async function PATCH(request: NextRequest) {
  console.log('[PATCH /api/admin/profile] Request received');

  // Any active admin role may update their own profile
  const { uid, error } = await requireAdminAuth(request, []);
  if (error) return error;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, email, currentPassword: _currentPassword, newPassword } = body;

  // Validate at least one update field is present
  if (!name && !email && !newPassword) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
  }

  // Validate name
  if (name !== undefined) {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      return NextResponse.json({ error: 'Name must be at least 3 characters.' }, { status: 400 });
    }
  }

  // Validate email format
  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }
  }

  // Validate new password strength
  if (newPassword !== undefined) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain an uppercase letter.' }, { status: 400 });
    }
    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain a lowercase letter.' }, { status: 400 });
    }
    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain a number.' }, { status: 400 });
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain a special character.' }, { status: 400 });
    }
  }

  // Build Firebase Auth update payload
  const authUpdate: Record<string, any> = {};
  if (name?.trim()) authUpdate.displayName = name.trim();
  if (email?.trim()) {
    // Check for email conflicts
    try {
      const existing = await adminAuth.getUserByEmail(email.trim());
      if (existing.uid !== uid) {
        return NextResponse.json({ error: 'Email is already in use.' }, { status: 409 });
      }
    } catch (e: any) {
      if (e?.code !== 'auth/user-not-found') throw e;
      authUpdate.email = email.trim();
    }
    if (!authUpdate.email) authUpdate.email = email.trim();
  }
  if (newPassword) authUpdate.password = newPassword;

  try {
    // Update Firebase Auth
    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(uid, authUpdate);
      console.log(`[PATCH /api/admin/profile] Auth updated for UID: ${uid}`);
    }

    // Update Firestore admin document
    const firestoreUpdate: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
    if (name?.trim()) firestoreUpdate.name = name.trim();
    if (email?.trim()) firestoreUpdate.email = email.trim();

    await adminDb.collection('admins').doc(uid).update(firestoreUpdate);
    console.log(`[PATCH /api/admin/profile] Firestore updated for UID: ${uid}`);

    return NextResponse.json({ success: true, name: name?.trim(), email: email?.trim() });
  } catch (err: any) {
    console.error('[PATCH /api/admin/profile] Update failed:', err.message);

    if (err?.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Email is already in use.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Profile update failed. Please try again.' }, { status: 500 });
  }
}
