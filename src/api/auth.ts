import { apiPost } from './client';
import type { User } from '../types/user';

// ── Matches AuthController / PasswordResetController ──────────────────────────
// POST /v1/login          -> { user, token }   (throttled)
// POST /v1/logout          -> 204               (auth:sanctum)
// POST /v1/password/forgot -> 204 (or similar)   (throttled)
// POST /v1/password/reset  -> requires the token emailed to the user, so it
// isn't reachable from this single-page app yet — only the "forgot password"
// request step is wired up here.

export interface LoginResponse {
  user: User;
  token: string;
}

export const login = (email: string, password: string): Promise<LoginResponse> =>
  apiPost('/login', { email, password });

export const logout = (): Promise<void> => apiPost('/logout', {});

export const forgotPassword = (email: string): Promise<void> =>
  apiPost('/password/forgot', { email });
