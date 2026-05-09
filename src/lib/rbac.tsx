import React from 'react';
import type { FirestoreRole } from '@/lib/adminService';

// ── Re-export FirestoreRole so consumers only need one import ─────────────────
export type { FirestoreRole };

// ── UI-facing display label ───────────────────────────────────────────────────
export type Role = 'Manager' | 'Product Manager' | 'Production Unit';

// ── All discrete permissions used in the app ─────────────────────────────────
export type Permission =
  | 'manage_admins'
  | 'reset_passwords'
  | 'manage_users'
  | 'manage_products'
  | 'manage_units'
  | 'view_warranty'
  | 'manage_careers';

// ── Default permission sets per Firestore role ────────────────────────────────
// Used when Firestore permissions[] is empty/missing, OR as the source of truth
// when creating new admin accounts. These match the Firestore rules.
export const ROLE_PERMISSIONS: Record<FirestoreRole, Permission[]> = {
  manager: [
    'manage_admins',
    'reset_passwords',
    'manage_users',
    'manage_products',
    'manage_units',
    'view_warranty',
    'manage_careers',
  ],
  product_manager: [
    'manage_products',
    'manage_units',
    'view_warranty',
    'manage_careers',
  ],
  production_unit: ['manage_units'],
};

// ── Map Firestore snake_case role → UI display label ─────────────────────────
export function toDisplayRole(role: FirestoreRole): Role {
  switch (role) {
    case 'manager':
      return 'Manager';
    case 'product_manager':
      return 'Product Manager';
    case 'production_unit':
      return 'Production Unit';
  }
}

// ── Map UI display label → Firestore role ─────────────────────────────────────
export function toFirestoreRole(role: Role): FirestoreRole {
  switch (role) {
    case 'Manager':
      return 'manager';
    case 'Product Manager':
      return 'product_manager';
    case 'Production Unit':
      return 'production_unit';
  }
}

/**
 * Check whether a permissions array (from Firestore) includes a given permission.
 * Falls back gracefully to false if the array is empty or undefined.
 */
export function hasPermission(
  permissions: string[] | undefined,
  permission: Permission
): boolean {
  if (!permissions || permissions.length === 0) return false;
  return permissions.includes(permission);
}

// ── <Can> component ───────────────────────────────────────────────────────────
interface CanProps {
  permissions: string[] | undefined;
  perform: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ permissions, perform, children, fallback = null }: CanProps) {
  if (hasPermission(permissions, perform)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
