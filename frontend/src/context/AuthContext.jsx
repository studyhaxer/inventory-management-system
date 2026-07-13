import { createContext, useState, useCallback, useMemo } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true); setError(null);
    try {
      const { access_token } = await api.login({ email, password });
      const me = await api.me(access_token);
      setToken(access_token); setUser(me);
      return true;
    } catch (err) {
      setError(err.message); return false;
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (email, password, role) => {
    setLoading(true); setError(null);
    try {
      await api.register({ email, password, role });
      return await login(email, password);
    } catch (err) {
      setError(err.message); return false;
    } finally { setLoading(false); }
  }, [login]);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  const value = useMemo(
    () => ({ token, user, loading, error, login, register, logout,
      isAuthenticated: !!token }),
    [token, user, loading, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };