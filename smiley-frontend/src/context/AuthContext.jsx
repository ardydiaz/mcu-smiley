import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { clearSession, getStoredUser, getToken, setSession, setToken } from '../utils/storage.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authService.me()
      .then(response => setUser(response.data))
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async credentials => {
    const response = await authService.login(credentials);
    setSession({ token: response.data.token, user: response.data.user });
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const completeSso = useCallback(async token => {
    setToken(token);
    const response = await authService.me();
    setSession({ token, user: response.data });
    setUser(response.data);
    return response.data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user && getToken()),
    login,
    completeSso,
    logout,
  }), [user, loading, login, completeSso, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
