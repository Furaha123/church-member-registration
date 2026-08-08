import { apiPost } from './client';
import type { User } from '../types/user';

// ── Matches AuthController / PasswordResetController ──────────────────────────
// POST /v1/login          -> { user, token }   (throttled)
// POST /v1/logout          -> 204               (auth:sanctum)
// POST /v1/password/forgot -> 204 (or similar)   (throttled)
// POST /v1/password/reset  -> completes the reset using the token emailed to the
// user (ResetPasswordRequest). Reachable from a reset screen opened via the
// emailed link, where the token and email are read from the URL.

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export const login = (email: string, password: string): Promise<LoginResponse> =>
  apiPost('/login', { email, password });

export const logout = (): Promise<void> => apiPost('/logout', {});

export const forgotPassword = (email: string): Promise<void> =>
  apiPost('/password/forgot', { email });

export const resetPassword = (payload: ResetPasswordPayload): Promise<void> =>
  apiPost('/password/reset', payload);
