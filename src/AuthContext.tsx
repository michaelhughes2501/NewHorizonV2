import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  setUser: (u: any) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nh_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('nh_token');
    if (stored) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${stored}` } })
        .then(r => r.json())
        .then(d => {
          if (d.user) setUser(d.user);
          else { localStorage.removeItem('nh_token'); setToken(null); }
        })
        .catch(() => { localStorage.removeItem('nh_token'); setToken(null); })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('nh_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    if (token) {
      await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    localStorage.removeItem('nh_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
