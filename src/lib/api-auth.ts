import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export interface AdminProfileData {
  uid: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  createdAt?: any;
}

export interface AuthValidationResult {
  uid: string;
  adminProfile: AdminProfileData;
  error?: NextResponse;
}

export function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  return authorization.slice('Bearer '.length);
}

export async function requireAdminAuth(
  request: NextRequest,
  allowedRoles: string[] = []
): Promise<AuthValidationResult> {
  const token = getBearerToken(request);

  if (!token) {
    console.warn('[AuthValidation] Missing bearer token');
    return {
      uid: '',
      adminProfile: null as any,
      error: NextResponse.json({ error: 'Authentication is required.' }, { status: 401 }),
    };
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error: any) {
    console.error('[AuthValidation] Token verification failed:', error.code || error.message);
    if (error.code === 'auth/id-token-expired') {
      return {
        uid: '',
        adminProfile: null as any,
        error: NextResponse.json({ error: 'Authentication token expired.' }, { status: 401 }),
      };
    }
    return {
      uid: '',
      adminProfile: null as any,
      error: NextResponse.json({ error: 'Invalid authentication token.' }, { status: 401 }),
    };
  }

  try {
    const adminSnapshot = await adminDb.collection('admins').doc(decodedToken.uid).get();

    if (!adminSnapshot.exists) {
      console.warn(`[AuthValidation] Admin document not found for UID: ${decodedToken.uid}`);
      return {
        uid: decodedToken.uid,
        adminProfile: null as any,
        error: NextResponse.json({ error: 'Admin access is required.' }, { status: 403 }),
      };
    }

    const adminData = adminSnapshot.data() as AdminProfileData;
    adminData.uid = decodedToken.uid;

    if (adminData.status !== 'active') {
      console.warn(`[AuthValidation] Admin ${decodedToken.uid} is not active`);
      return {
        uid: decodedToken.uid,
        adminProfile: adminData,
        error: NextResponse.json({ error: 'Admin account is inactive.' }, { status: 403 }),
      };
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(adminData.role)) {
      console.warn(`[AuthValidation] Admin ${decodedToken.uid} lacks required roles: ${allowedRoles.join(', ')}`);
      return {
        uid: decodedToken.uid,
        adminProfile: adminData,
        error: NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 }),
      };
    }

    return { uid: decodedToken.uid, adminProfile: adminData };
  } catch (error: any) {
    console.error('[AuthValidation] Firestore fetch failed:', error.message);
    return {
      uid: decodedToken.uid,
      adminProfile: null as any,
      error: NextResponse.json({ error: 'Internal Server Error during auth validation.' }, { status: 500 }),
    };
  }
}
