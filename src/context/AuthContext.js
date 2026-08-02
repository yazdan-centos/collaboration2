import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const AUTH_STORAGE_KEY = 'auth';
const AuthContext = createContext(null);

function decodeAccessToken(accessToken) {
  try {
    const payload = accessToken?.split('.')[1];
    if (!payload) return {};
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=');
    return JSON.parse(decodeURIComponent(atob(paddedPayload).split('').map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')));
  } catch {
    return {};
  }
}

function firstId(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') ?? null;
}

function normalizeSession(loginResponse) {
  const currentUser = loginResponse?.currentUser;
  const nestedUser = loginResponse?.user ?? loginResponse?.account ?? loginResponse?.principal;
  const tokenClaims = decodeAccessToken(loginResponse?.accessToken);
  const customerId = firstId(
    loginResponse?.customerId,
    currentUser?.customerId,
    currentUser?.customer?.id,
    nestedUser?.customerId,
    nestedUser?.customer?.id,
    tokenClaims?.customerId,
    tokenClaims?.customer_id,
  );
  const userId = firstId(
    loginResponse?.userId,
    loginResponse?.id,
    currentUser?.userId,
    currentUser?.id,
    nestedUser?.userId,
    nestedUser?.id,
    tokenClaims?.userId,
    tokenClaims?.user_id,
    tokenClaims?.id,
    customerId,
    /^\d+$/.test(String(tokenClaims?.sub ?? '')) ? tokenClaims.sub : null,
  );
  const resolvedRoles = Array.isArray(loginResponse?.roles)
    ? loginResponse.roles
    : (Array.isArray(currentUser?.roles) ? currentUser.roles : (loginResponse?.role ? [loginResponse.role] : []));

  return {
    ...loginResponse,
    roles: resolvedRoles,
    permissions: loginResponse?.permissions || currentUser?.permissions || [],
    userId,
    customerId: customerId ?? userId,
  };
}

function readStoredAuth() {
  try {
    const storedAuth = JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || 'null');
    return storedAuth?.accessToken ? normalizeSession(storedAuth) : null;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const refreshedToken = useRef(null);

  const login = useCallback((loginResponse) => {
    if (!loginResponse?.accessToken) {
      throw new Error('پاسخ ورود شامل توکن دسترسی نیست.');
    }

    const session = normalizeSession(loginResponse);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setAuth(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  useEffect(() => {
    if (!auth?.accessToken || refreshedToken.current === auth.accessToken) return;
    refreshedToken.current = auth.accessToken;
    const controller = new AbortController();
    fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/auth/me`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      signal: controller.signal,
    }).then((response) => {
      if (!response.ok) throw new Error('Unable to refresh the current user');
      return response.json();
    }).then((profile) => {
      setAuth((current) => {
        if (!current || current.accessToken !== auth.accessToken) return current;
        const refreshed = normalizeSession({
          ...current,
          currentUser: profile,
          userId: profile.id,
          roles: profile.roles || current.roles,
          permissions: profile.permissions || [],
        });
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshed));
        return refreshed;
      });
    }).catch((error) => {
      if (error.name !== 'AbortError') refreshedToken.current = null;
    });
    return () => controller.abort();
  }, [auth?.accessToken]);

  const value = useMemo(() => ({
    auth,
    currentUser: auth?.currentUser || null,
    accessToken: auth?.accessToken || null,
    role: auth?.role || null,
    roles: auth?.roles || (auth?.role ? [auth.role] : []),
    permissions: auth?.permissions || [],
    userId: auth?.userId ?? auth?.currentUser?.id ?? auth?.currentUser?.userId ?? null,
    customerId: auth?.customerId ?? auth?.currentUser?.customerId ?? auth?.userId ?? null,
    isAuthenticated: Boolean(auth?.accessToken),
    login,
    logout,
  }), [auth, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}

export function getStoredAccessToken() {
  return readStoredAuth()?.accessToken || null;
}
