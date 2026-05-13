import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AddAppUserFormData } from '@/lib/validations';

const USERS_COLLECTION = 'users';

export type AppUserRole = 'user';
export type AppUserStatus = 'active' | 'inactive';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppUserRole;
  status: AppUserStatus;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp | null;
  temporaryPassword?: string;
  lastPasswordReset: Timestamp | null;
  appAccess: boolean;
}

export interface CreateAppUserResponse {
  uid: string;
  email: string;
}

function mapAppUserDoc(docSnapshot: QueryDocumentSnapshot): AppUser {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    role: data.role ?? 'user',
    status: data.status ?? 'active',
    createdBy: data.createdBy ?? '',
    createdByName: data.createdByName ?? '',
    createdAt: data.createdAt ?? null,
    temporaryPassword: data.temporaryPassword,
    lastPasswordReset: data.lastPasswordReset ?? null,
    appAccess: Boolean(data.appAccess ?? false),
  };
}

export function subscribeToAppUsers(
  onUsers: (users: AppUser[]) => void,
  onError: (error: FirestoreError) => void
): Unsubscribe {
  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    usersQuery,
    snapshot => onUsers(snapshot.docs.map(mapAppUserDoc)),
    onError
  );
}

export async function appUserEmailExists(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const emailQuery = query(
    collection(db, USERS_COLLECTION),
    where('email', '==', normalizedEmail),
    limit(1)
  );
  const snapshot = await getDocs(emailQuery);

  return !snapshot.empty;
}

export async function createAppUser(
  data: AddAppUserFormData,
  idToken: string
): Promise<CreateAppUserResponse> {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error ?? payload?.message ?? 'User could not be created. Please try again.');
  }

  return payload as CreateAppUserResponse;
}
