import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { AUTH_KEY } from '../../constants/tickets';
import type { Auth, MeResponse } from './auth.types';

function readSavedAuth(): Auth | null {
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? (JSON.parse(saved) as Auth) : null;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function useAuth() {
  const [auth, setAuth] = useState<Auth | null>(readSavedAuth);
  const [checkingAuth, setCheckingAuth] = useState(() =>
    Boolean(localStorage.getItem(AUTH_KEY)),
  );

  useEffect(() => {
    if (!auth) {
      return;
    }
  
    const token = auth.token;
    let cancelled = false;
  
   
async function validateAuth() {
  try {
    const result = await apiRequest<MeResponse>(
      '/api/auth/me',
      {},
      token,
    );

    if (cancelled) {
      return;
    }

    const role = result.data.user.role;

    if (role !== 'ADMIN' && role !== 'AUTHOR') {
      localStorage.removeItem(AUTH_KEY);
      setAuth((currentAuth) =>
        currentAuth?.token === token ? null : currentAuth,
      );
      return;
    }

    setAuth((currentAuth) =>
      currentAuth && currentAuth.token === token
        ? { ...currentAuth, user: result.data.user }
        : currentAuth,
    );
  } catch {
    if (!cancelled) {
      localStorage.removeItem(AUTH_KEY);
      setAuth((currentAuth) =>
        currentAuth?.token === token ? null : currentAuth,
      );
    }
  } finally {
    if (!cancelled) {
      setCheckingAuth(false);
    }
  }
}
  
    void validateAuth();
  
    return () => {
      cancelled = true;
    };
  }, [auth?.token]);

  function login(nextAuth: Auth) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
    setCheckingAuth(false);
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setAuth(null);
    setCheckingAuth(false);
  }

  return { auth, checkingAuth, login, logout };
}
