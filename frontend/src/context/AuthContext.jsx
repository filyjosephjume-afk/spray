import { createContext, useCallback, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { ADMIN_ROLES, READ_ONLY_ROLES } from '../utils/constants';

export const AuthContext = createContext(null);

// Noms de rôles en minuscules, quelle que soit la forme renvoyée par le back-end
// (role: "admin", roles: ["admin"], roles: [{nom: "admin"}]...)
export function normalizeRoles(user) {
  if (!user) return [];
  const raw = user.roles ?? user.role ?? user.nom_role ?? [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((r) => (r && typeof r === 'object' ? r.nom ?? r.nom_role ?? r.libelle ?? r.name ?? '' : r))
    .map((r) => String(r).trim().toLowerCase())
    .filter(Boolean);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, motDePasse) => {
    const { token, user: u } = await authApi.login(email, motDePasse);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = useMemo(() => {
    const roles = normalizeRoles(user);
    const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));
    return {
      user,
      roles,
      isAdmin,
      // Peut ajouter / modifier, sauf si tous ses rôles sont "consultation"
      canWrite: !!user && (isAdmin || roles.length === 0 || roles.some((r) => !READ_ONLY_ROLES.includes(r))),
      hasAnyRole: (list) => isAdmin || list.some((r) => roles.includes(String(r).toLowerCase())),
      login,
      logout,
    };
  }, [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
