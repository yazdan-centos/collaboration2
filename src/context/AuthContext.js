import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'auth';
const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const storedAuth = JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || 'null');
    return storedAuth?.accessToken ? storedAuth : null;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  const login = useCallback((loginResponse) => {
    const { currentUser, accessToken, role } = loginResponse || {};
    if (!accessToken) {
      throw new Error('پاسخ ورود شامل توکن دسترسی نیست.');
    }

    const session = { currentUser, accessToken, role };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setAuth(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  const value = useMemo(() => ({
    auth,
    currentUser: auth?.currentUser || null,
    accessToken: auth?.accessToken || null,
    role: auth?.role || null,
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
