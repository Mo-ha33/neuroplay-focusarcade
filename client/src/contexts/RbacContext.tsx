/**
 * NeuroPlay AI FocusArcade — RBAC Context
 * ========================================
 * Provides demo-mode role management for the 4-tier portal system.
 * Persists the active role to sessionStorage so page refreshes retain state.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { DemoUser, RbacRole } from "../../../server/routers/rbacRouter";

interface RbacContextValue {
  role: RbacRole | null;
  user: DemoUser | null;
  isLoading: boolean;
  login: (role: RbacRole, user: DemoUser) => void;
  logout: () => void;
}

const RbacContext = createContext<RbacContextValue>({
  role: null,
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

const SESSION_KEY = "neuroplay-rbac-session";

export function RbacProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<RbacRole | null>(null);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { role: RbacRole; user: DemoUser };
        setRole(parsed.role);
        setUser(parsed.user);
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newRole: RbacRole, newUser: DemoUser) => {
    setRole(newRole);
    setUser(newUser);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role: newRole, user: newUser }));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setUser(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <RbacContext.Provider value={{ role, user, isLoading, login, logout }}>
      {children}
    </RbacContext.Provider>
  );
}

export function useRbac() {
  return useContext(RbacContext);
}
