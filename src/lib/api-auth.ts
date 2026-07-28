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
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }

  // Also check cookies if Authorization header is missing
  const cookieToken =
    request.cookies?.get('token')?.value ||
    request.cookies?.get('__session')?.value ||
    request.cookies?.get('firebaseToken')?.value ||
    request.cookies?.get('auth_token')?.value;

  if (cookieToken) return cookieToken;

  return null;
}

export async function requireAdminAuth(
  request: NextRequest,
  allowedRoles: string[] = []
): Promise<AuthValidationResult> {
  const authHeader = request.headers.get('authorization');
  const cookies = request.headers.get('cookie') || '';

  console.log('[AuthValidation] Starting authentication check');
  console.log('[AuthValidation] Authorization header:', authHeader ? (authHeader.substring(0, 15) + '...') : 'None');
  console.log('[AuthValidation] Cookies:', cookies ? 'Present' : 'None');

  const token = getBearerToken(request);

  if (!token) {
    console.warn('[AuthValidation] Missing authentication token (Authorization header & cookie checked)');
    return {
      uid: '',
      adminProfile: null as any,
      error: NextResponse.json(
        { success: false, reason: 'Missing authentication cookie or authorization header', error: 'Authentication is required.' },
        { status: 401 }
      ),
    };
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
    console.log('[AuthValidation] Decoded token:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      issuer: decodedToken.iss,
    });
  } catch (error: any) {
    console.error('[AuthValidation] Token verification failed:', error.code || error.message);
    if (error.code === 'auth/id-token-expired') {
      return {
        uid: '',
        adminProfile: null as any,
        error: NextResponse.json(
          { success: false, reason: 'Expired Firebase ID token', error: 'Authentication token expired.' },
          { status: 401 }
        ),
      };
    }
    return {
      uid: '',
      adminProfile: null as any,
      error: NextResponse.json(
        { success: false, reason: `Invalid Firebase token: ${error.message || error.code}`, error: 'Invalid authentication token.' },
        { status: 401 }
      ),
    };
  }

  try {
    const adminSnapshot = await adminDb.collection('admins').doc(decodedToken.uid).get();

    if (!adminSnapshot.exists) {
      console.warn(`[AuthValidation] Admin document not found in Firestore for UID: ${decodedToken.uid}`);
      return {
        uid: decodedToken.uid,
        adminProfile: null as any,
        error: NextResponse.json(
          { success: false, reason: `Missing admin record in Firestore for UID ${decodedToken.uid}`, error: 'Admin access is required.' },
          { status: 403 }
        ),
      };
    }

    const adminData = adminSnapshot.data() as AdminProfileData;
    adminData.uid = decodedToken.uid;

    console.log('[AuthValidation] Authenticated user:', adminData.email || adminData.name || decodedToken.uid);
    console.log('[AuthValidation] User role:', adminData.role);

    if (adminData.status !== 'active') {
      console.warn(`[AuthValidation] Admin ${decodedToken.uid} is not active (status: ${adminData.status})`);
      return {
        uid: decodedToken.uid,
        adminProfile: adminData,
        error: NextResponse.json(
          { success: false, reason: `Admin account is inactive (status: ${adminData.status})`, error: 'Admin account is inactive.' },
          { status: 403 }
        ),
      };
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(adminData.role)) {
      console.warn(`[AuthValidation] Role mismatch: user '${adminData.role}' not in allowed roles [${allowedRoles.join(', ')}]`);
      return {
        uid: decodedToken.uid,
        adminProfile: adminData,
        error: NextResponse.json(
          { success: false, reason: `Role mismatch: role '${adminData.role}' is not allowed (requires: ${allowedRoles.join(', ')})`, error: 'Insufficient permissions.' },
          { status: 403 }
        ),
      };
    }

    return { uid: decodedToken.uid, adminProfile: adminData };
  } catch (error: any) {
    console.error('[AuthValidation] Firestore fetch failed:', error.message);
    return {
      uid: decodedToken.uid,
      adminProfile: null as any,
      error: NextResponse.json(
        { success: false, reason: `Firestore fetch error: ${error.message}`, error: 'Internal Server Error during auth validation.' },
        { status: 500 }
      ),
    };
  }
}
