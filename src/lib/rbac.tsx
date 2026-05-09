import React from 'react';

export type Role = 'Manager' | 'Product Manager' | 'Production Unit';

export type Permission =
  | 'manage_admins'
  | 'reset_passwords'
  | 'manage_users'
  | 'manage_products'
  | 'manage_units'
  | 'view_warranty'
  | 'manage_careers';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'Manager': [
    'manage_admins',
    'reset_passwords',
    'manage_users',
    'manage_products',
    'manage_units',
    'view_warranty',
    'manage_careers'
  ],
  'Product Manager': [
    'manage_products',
    'manage_units',
    'view_warranty',
    'manage_careers'
  ],
  'Production Unit': [
    'manage_units'
  ]
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

interface CanProps {
  role: Role | undefined;
  perform: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ role, perform, children, fallback = null }: CanProps) {
  if (hasPermission(role, perform)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
