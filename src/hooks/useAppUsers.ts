"use client";

import { useEffect, useMemo, useState } from 'react';
import { subscribeToAppUsers, type AppUser } from '@/lib/appUsers';
import { useAuth } from '@/contexts/AuthContext';

export function useAppUsers(searchTerm = '') {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (authLoading) {
      setIsLoadingUsers(true);
      return;
    }

    if (!user) {
      setUsers([]);
      setIsLoadingUsers(false);
      setError(null);
      return;
    }

    setIsLoadingUsers(true);
    setError(null);

    const unsubscribe = subscribeToAppUsers(
      nextUsers => {
        setUsers(nextUsers);
        setIsLoadingUsers(false);
      },
      nextError => {
        setError(nextError);
        setIsLoadingUsers(false);
      }
    );

    return unsubscribe;
  }, [user, authLoading]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term) ||
      user.status.toLowerCase().includes(term)
    );
  }, [searchTerm, users]);

  return {
    users,
    filteredUsers,
    isLoadingUsers: authLoading || isLoadingUsers,
    error,
  };
}
