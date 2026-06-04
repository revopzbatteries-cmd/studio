import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { addAppUserSchema } from '@/lib/validations';

export const runtime = 'nodejs';

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  return authorization.slice('Bearer '.length);
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      return errorResponse('Authentication is required.', 401);
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const adminSnapshot = await adminDb.collection('admins').doc(decodedToken.uid).get();

    if (!adminSnapshot.exists) {
      return errorResponse('Admin access is required.', 403);
    }

    const adminData = adminSnapshot.data();
    if (adminData?.status !== 'active' || adminData?.role !== 'manager') {
      return errorResponse('Only managers can create users.', 403);
    }

    const body = await request.json();
    const parsed = addAppUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: 'Please correct the highlighted fields.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    try {
      await adminAuth.getUserByEmail(data.email);
      return errorResponse('Email already exists.', 409);
    } catch (error: any) {
      if (error?.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    const duplicateUsersSnapshot = await adminDb
      .collection('users')
      .where('email', '==', data.email)
      .limit(1)
      .get();

    if (!duplicateUsersSnapshot.empty) {
      return errorResponse('Email already exists.', 409);
    }

    const userRecord = await adminAuth.createUser({
      displayName: data.name,
      email: data.email,
      password: data.password,
      phoneNumber: data.phone.startsWith('+') ? data.phone : undefined,
      disabled: false,
    });

    try {
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        appRole: 'user',
        appAccess: true,
      });

      await adminDb.collection('users').doc(userRecord.uid).set({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'user',
        status: 'active',
        createdBy: decodedToken.uid,
        createdByName: adminData?.name ?? 'Unknown',
        createdAt: FieldValue.serverTimestamp(),
        temporaryPassword: data.password,
        lastPasswordReset: FieldValue.serverTimestamp(),
        appAccess: true,
      });
    } catch (error) {
      await adminAuth.deleteUser(userRecord.uid).catch(() => {});
      throw error;
    }

    return NextResponse.json({
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error: any) {
    console.error('[CreateAppUser] Failed:', error);

    if (error?.code === 'auth/email-already-exists') {
      return errorResponse('Email already exists.', 409);
    }

    if (error?.code === 'auth/invalid-phone-number') {
      return errorResponse('Phone number must be in E.164 format when it starts with +.', 400);
    }

    if (error?.code === 'auth/phone-number-already-exists') {
      return errorResponse('Phone number already exists.', 409);
    }

    return errorResponse('User could not be created. Please try again.', 500);
  }
}
