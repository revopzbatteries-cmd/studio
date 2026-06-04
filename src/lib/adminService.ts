import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ── Firestore role values (stored in DB as snake_case) ───────────────────────
export type FirestoreRole = 'manager' | 'product_manager' | 'production_unit';

// ── Full shape of an admins/{uid} Firestore document ────────────────────────
export interface AdminProfile {
  uid: string;
  name: string;
  email: string;
  role: FirestoreRole;
  permissions: string[];      // e.g. ["manage_products", "manage_units"]
  status: 'active' | 'inactive';
  createdAt: string;
}

/**
 * Fetch the Firestore admin profile for a given Firebase Auth UID.
 * Returns null if the document does not exist or a network error occurs.
 */
export async function fetchAdminProfile(uid: string): Promise<AdminProfile | null> {
  try {
    const ref = doc(db, 'admins', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn(`[AdminService] No admin document found for UID: ${uid}`);
      return null;
    }

    const data = snap.data();

    return {
      uid,
      name: data.name ?? 'Unknown',
      email: data.email ?? '',
      role: data.role as FirestoreRole,
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
      status: data.status ?? 'inactive',
      createdAt: data.createdAt ?? '',
    };
  } catch (error) {
    console.error('[AdminService] Error fetching admin profile:', error);
    return null;
  }
}

/**
 * Derive initials from a display name (e.g. "Amal Raj T P" → "AR").
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
