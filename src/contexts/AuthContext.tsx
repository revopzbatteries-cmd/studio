"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { fetchAdminProfile, AdminProfile } from "@/lib/adminService";
import { checkSessionExpiry, clearSessionStorage } from "@/lib/session";
import { useSessionManager } from "@/hooks/useSessionManager";

// ── Context shape ─────────────────────────────────────────────────────────────
interface AuthContextType {
  /** Raw Firebase Auth user. null while loading or when logged out. */
  user: User | null;
  /** Full Firestore admin profile. null until fetched or if not an admin. */
  adminProfile: AdminProfile | null;
  /** True while the initial auth + Firestore fetch is in progress. */
  loading: boolean;
  /**
   * True when the user is authenticated in Firebase but has no valid
   * active Firestore admin document. Shows "access denied" UI.
   */
  accessDenied: boolean;
  logout: () => Promise<void>;
}

// ── Context with safe defaults ────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  user: null,
  adminProfile: null,
  loading: true,
  accessDenied: false,
  logout: async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const logout = useCallback(async () => {
    try {
      clearSessionStorage();
      await firebaseSignOut(auth);
      setAdminProfile(null);
      setAccessDenied(false);
    } catch (error) {
      console.error("[Auth] Error signing out:", error);
    }
  }, []);

  // Hook to track user activity, check inactivity timeouts, and manage multi-tab synchronization
  useSessionManager(user, logout);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (!firebaseUser) {
        // Logged out — clear everything
        setUser(null);
        setAdminProfile(null);
        setAccessDenied(false);
        setLoading(false);
        return;
      }

      // ── Startup check: Check session expiration before loading profile ──
      const { expired, reason } = checkSessionExpiry();
      if (expired) {
        console.warn(`[Auth] Startup session expired: ${reason}. Forcing logout.`);
        clearSessionStorage();
        await firebaseSignOut(auth).catch(() => {});
        setUser(null);
        setAdminProfile(null);
        setAccessDenied(false);
        setLoading(false);
        return;
      }

      // Firebase user is authenticated — now validate against Firestore
      setUser(firebaseUser);

      // ── Detect if this is a public customer using Phone Authentication ──
      const isPublicCustomer = firebaseUser.providerData.some(p => p.providerId === 'phone') || !!firebaseUser.phoneNumber;

      if (isPublicCustomer) {
        setAdminProfile(null);
        setAccessDenied(false);
        setLoading(false);
        return;
      }

      const profile = await fetchAdminProfile(firebaseUser.uid);

      if (!profile || profile.status !== "active") {
        // Auth OK but no valid admin record — deny access and sign out
        console.warn(
          `[Auth] User ${firebaseUser.uid} has no active admin record. Denying access.`
        );
        setAdminProfile(null);
        setAccessDenied(true);
        // Sign out silently in the background so the session is cleared
        await firebaseSignOut(auth).catch(() => {});
      } else {
        setAdminProfile(profile);
        setAccessDenied(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, adminProfile, loading, accessDenied, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext);

