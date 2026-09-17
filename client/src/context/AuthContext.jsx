import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(api.getToken());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }
    api
      .getMe()
      .then(setUser)
      .catch(() => {
        api.clearToken();
        setTokenState(null);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      api.clearToken();
      setTokenState(null);
      setUser(null);
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  async function login(credentials) {
    const data = await api.login(credentials);
    api.setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
  }

  async function register(details) {
    const data = await api.register(details);
    api.setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
  }

  function logout() {
    api.clearToken();
    setTokenState(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!token, ready, login, register, logout }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
