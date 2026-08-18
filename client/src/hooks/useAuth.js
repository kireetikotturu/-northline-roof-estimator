// src/hooks/useAuth.js
import { useCallback, useEffect, useState } from 'react';
import { getToken, setToken, clearToken, ownerLogin, verifySession } from '../services/api.js';

export function useAuth() {
  const [status, setStatus] = useState('checking'); // checking | authed | guest

  const checkSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setStatus('guest');
      return;
    }
    try {
      await verifySession(token);
      setStatus('authed');
    } catch {
      clearToken();
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (username, password) => {
    const { token } = await ownerLogin(username, password);
    setToken(token);
    setStatus('authed');
  };

  const logout = () => {
    clearToken();
    setStatus('guest');
  };

  return { status, login, logout };
}
