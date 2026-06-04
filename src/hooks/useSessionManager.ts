"use client";

import { useEffect, useRef, useCallback } from "react";
import { User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  SESSION_KEYS,
  checkSessionExpiry,
  clearSessionStorage,
  initializeSession,
} from "@/lib/session";

// How often we write to localStorage to throttle mousedown/mousemove events (10 seconds)
const THROTTLE_DELAY_MS = 10000;
// How often the background worker checks for session expiration (5 seconds)
const CHECK_INTERVAL_MS = 5000;

export function useSessionManager(user: User | null, logout: () => Promise<void>) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  // Track last write in a ref to keep it synchronous and avoid state-induced re-renders
  const lastWriteRef = useRef<number>(0);
  const logoutRef = useRef(logout);
  const userRef = useRef(user);

  // Sync mutable refs to prevent stale closure issues in event listeners
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  /**
   * Performs the actual force logout sequence, showing an appropriate toast
   * and ensuring that we navigate back to the admin page.
   */
  const forceLogout = useCallback(
    async (reason: "inactivity" | "max_duration" | "cross_tab") => {
      try {
        console.warn(`[SessionManager] Forcing logout. Reason: ${reason}`);
        
        // 1. Clear session storage
        clearSessionStorage();
        
        // 2. Clear Firebase Auth session
        await logoutRef.current();

        // 3. Inform the user with a sleek, premium notification
        const notifications = {
          inactivity: {
            title: "Session Expired",
            description: "You have been logged out due to 3 days of inactivity.",
          },
          max_duration: {
            title: "Security Timeout",
            description: "For security, admin sessions are limited to 7 days. Please sign in again.",
          },
          cross_tab: {
            title: "Logged Out",
            description: "You have been signed out from another browser window or tab.",
          },
        };

        const msg = notifications[reason];
        toast({
          title: msg.title,
          description: msg.description,
          variant: "destructive",
        });

        // 4. Force route back to admin login if they are currently inside the admin panel
        if (pathname && pathname.startsWith("/admin")) {
          router.push("/admin");
        }
      } catch (error) {
        console.error("[SessionManager] Error during force logout execution:", error);
      }
    },
    [router, pathname, toast]
  );

  /**
   * Tracks user interaction events and updates the last active timestamp
   * using a throttled write to minimize performance overhead.
   */
  const recordActivity = useCallback(() => {
    if (!userRef.current) return;

    const now = Date.now();
    // Only write to localStorage if at least THROTTLE_DELAY_MS has passed since the last write
    if (now - lastWriteRef.current > THROTTLE_DELAY_MS) {
      lastWriteRef.current = now;
      try {
        localStorage.setItem(SESSION_KEYS.LAST_ACTIVE, now.toString());
      } catch (error) {
        console.error("[SessionManager] Failed to update active timestamp:", error);
      }
    }
  }, []);

  /**
   * Periodically triggered routine to verify if the session has expired.
   */
  const performExpiryCheck = useCallback(() => {
    if (!userRef.current) return;

    const { expired, reason } = checkSessionExpiry();
    if (expired && reason) {
      forceLogout(reason);
    }
  }, [forceLogout]);

  // Main lifecycle for registers/unregisters
  useEffect(() => {
    // Session tracking is only active when a user is logged in
    if (!user) {
      // Clear references if user is null
      lastWriteRef.current = 0;
      return;
    }

    // ── Prevent session tracking for public phone-auth users ──
    const isPublicCustomer = user.providerData.some(p => p.providerId === 'phone') || !!user.phoneNumber;
    if (isPublicCustomer) {
      return;
    }

    // 1. Run an immediate check on startup/auth transition
    const { expired, reason } = checkSessionExpiry();
    if (expired && reason) {
      forceLogout(reason);
      return;
    }

    // 2. Initialize or verify session storage values
    initializeSession(user.uid);

    // 3. Setup event listeners for active user engagement
    const activityEvents = ["mousemove", "keydown", "click", "touchstart"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, recordActivity, { passive: true });
    });

    // 4. Track visibility state changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Boost activity immediately when returning to the tab
        recordActivity();
        // Check for session expiry instantly in case the tab was sleeping
        performExpiryCheck();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 5. Run a background polling timer to catch expiry in real time
    const checkInterval = setInterval(performExpiryCheck, CHECK_INTERVAL_MS);

    // 6. Monitor storage changes across windows and tabs
    const handleStorageChange = (event: StorageEvent) => {
      // If the session identifiers are removed in another tab (logout), logout here too
      if (
        (event.key === SESSION_KEYS.LOGIN_TIME || event.key === SESSION_KEYS.USER_UID) &&
        !event.newValue
      ) {
        forceLogout("cross_tab");
      }
      
      // Sync lastActive state across tabs so you don't log out of an idle tab while working in another
      if (event.key === SESSION_KEYS.LAST_ACTIVE && event.newValue) {
        const remoteTime = parseInt(event.newValue, 10);
        if (!isNaN(remoteTime)) {
          lastWriteRef.current = remoteTime;
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Clean up all hooks and event listeners to prevent memory leaks
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, recordActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(checkInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user, recordActivity, performExpiryCheck, forceLogout]);

  return null;
}
