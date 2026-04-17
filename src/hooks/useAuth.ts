


import { useState, useEffect } from "react";

export const BACKEND_URL = "https://34464xv038.execute-api.ap-south-1.amazonaws.com/prod";
const STORAGE_KEY = "farmgate_auth";       // Microsoft SSO key — untouched
const JWT_KEY     = "farmgate_jwt";        // Email/password JWT
const USER_KEY    = "farmgate_user";       // Email/password user

export interface User {
  id:    string;
  firstName?: string;  // optional — for regular login
  lastName?: string;   // optional — for regular login
  name:  string;
  email: string;
}

interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  refreshToken: string | null;
  loading:      boolean;
}

export function useAuth(): AuthState {
  const [authData, setAuthData] = useState<any | null>(() => {
    try {
      // Check Microsoft SSO first
      const ssoCache = localStorage.getItem(STORAGE_KEY);
      if (ssoCache) return JSON.parse(ssoCache);

      // Fall back to email/password JWT
      const jwtUser = localStorage.getItem(USER_KEY);
      const jwtToken = localStorage.getItem(JWT_KEY);
      if (jwtUser && jwtToken) {
        return { user: JSON.parse(jwtUser), access_token: jwtToken };
      }

      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only verify Microsoft SSO session — JWT doesn't need a backend check
    const jwtToken = localStorage.getItem(JWT_KEY);
    const jwtUser  = localStorage.getItem(USER_KEY);

    if (jwtToken && jwtUser) {
      // Email/password login — no backend verification needed
      setAuthData({ user: JSON.parse(jwtUser), access_token: jwtToken });
      setLoading(false);
      return;
    }

    // Microsoft SSO — verify session with backend
    fetch(`${BACKEND_URL}/api/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setAuthData(data);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setAuthData(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return {
    user:         authData?.user          ?? null,
    accessToken:  authData?.access_token  ?? null,
    refreshToken: authData?.refresh_token ?? null,
    loading,
  };
}

// ✅ Clears BOTH Microsoft SSO and email/password session
export function logout() {
  const wasJwtLogin = !!localStorage.getItem(JWT_KEY);

  // Clear email/password
  localStorage.removeItem(JWT_KEY);
  localStorage.removeItem(USER_KEY);

  // Clear Microsoft SSO
  localStorage.removeItem(STORAGE_KEY);

  if (wasJwtLogin) {
    // Email/password logout — just redirect to home
    window.location.href = "/";
  } else {
    // Microsoft SSO logout — hit the backend logout endpoint
    window.location.href = `${BACKEND_URL}/auth/logout`;
  }
}