/**
 * Session Configuration Constants
 * Configurable limits for user sessions in the admin panel.
 */
export const INACTIVITY_LIMIT_DAYS = 3;
export const MAX_LOGIN_DURATION_DAYS = 7;

export const INACTIVITY_LIMIT_MS = INACTIVITY_LIMIT_DAYS * 24 * 60 * 60 * 1000;
export const MAX_LOGIN_DURATION_MS = MAX_LOGIN_DURATION_DAYS * 24 * 60 * 60 * 1000;

export const SESSION_KEYS = {
  LOGIN_TIME: 'revopz_session_login_time',
  LAST_ACTIVE: 'revopz_session_last_active',
  USER_UID: 'revopz_session_user_uid',
};

export interface ExpiryCheckResult {
  expired: boolean;
  reason: 'inactivity' | 'max_duration' | null;
}

/**
 * Checks if the current session has expired due to inactivity or max login duration.
 * Safe for server-side rendering (SSR).
 */
export function checkSessionExpiry(): ExpiryCheckResult {
  if (typeof window === 'undefined') {
    return { expired: false, reason: null };
  }

  const loginTimeStr = localStorage.getItem(SESSION_KEYS.LOGIN_TIME);
  const lastActiveStr = localStorage.getItem(SESSION_KEYS.LAST_ACTIVE);

  if (!loginTimeStr || !lastActiveStr) {
    return { expired: false, reason: null };
  }

  const loginTime = parseInt(loginTimeStr, 10);
  const lastActive = parseInt(lastActiveStr, 10);
  const now = Date.now();

  if (isNaN(loginTime) || isNaN(lastActive)) {
    return { expired: false, reason: null };
  }

  // 1. Check maximum login duration limit (7 days)
  if (now - loginTime > MAX_LOGIN_DURATION_MS) {
    return { expired: true, reason: 'max_duration' };
  }

  // 2. Check inactivity limit (3 days)
  if (now - lastActive > INACTIVITY_LIMIT_MS) {
    return { expired: true, reason: 'inactivity' };
  }

  return { expired: false, reason: null };
}

/**
 * Clears all session related timestamps from local storage.
 * Safe for server-side rendering (SSR).
 */
export function clearSessionStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_KEYS.LOGIN_TIME);
      localStorage.removeItem(SESSION_KEYS.LAST_ACTIVE);
      localStorage.removeItem(SESSION_KEYS.USER_UID);
    } catch (error) {
      console.error('[Session] Failed to clear session storage:', error);
    }
  }
}

/**
 * Initializes or updates session timestamps in local storage for an authenticated user.
 * Safe for server-side rendering (SSR).
 */
export function initializeSession(uid: string): void {
  if (typeof window !== 'undefined') {
    try {
      const now = Date.now().toString();
      
      // Keep existing login time if already present (e.g. page refresh)
      if (!localStorage.getItem(SESSION_KEYS.LOGIN_TIME)) {
        localStorage.setItem(SESSION_KEYS.LOGIN_TIME, now);
      }
      
      // Keep existing last active if present, or set it to now
      if (!localStorage.getItem(SESSION_KEYS.LAST_ACTIVE)) {
        localStorage.setItem(SESSION_KEYS.LAST_ACTIVE, now);
      }
      
      localStorage.setItem(SESSION_KEYS.USER_UID, uid);
    } catch (error) {
      console.error('[Session] Failed to initialize session storage:', error);
    }
  }
}
