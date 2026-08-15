import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { login as apiLogin, logout as apiLogout, changePassword as apiChangePassword } from '../api/auth';
import { ApiError, getAuthToken, setAuthToken, setUnauthorizedHandler } from '../api/client';
import type { User } from '../types/user';

const USER_STORAGE_KEY = 'church_member_auth_user';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loggingIn: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // There's no GET /me route on the backend, so the signed-in user is
  // rehydrated from localStorage alongside the token rather than re-fetched.
  const [user, setUser] = useState<User | null>(() => (getAuthToken() ? readStoredUser() : null));
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoggingIn(true);
    setLoginError(null);
    try {
      const { user: loggedInUser, token } = await apiLogin(email, password);
      setAuthToken(token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
      throw err;
    } finally {
      setLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiLogout();
    } catch {
      // Server call failing (e.g. token already expired) shouldn't block a local sign-out.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const changePassword = useCallback(
    async (currentPassword: string, password: string, passwordConfirmation: string): Promise<void> => {
      await apiChangePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      // The endpoint returns only a message and keeps the current token, so the
      // local user is updated in place to clear the temporary-password state.
      setUser((prev) => {
        if (!prev) return prev;
        const updated: User = { ...prev, must_change_password: false };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, loggingIn, loginError, login, logout, changePassword }),
    [user, loggingIn, loginError, login, logout, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
