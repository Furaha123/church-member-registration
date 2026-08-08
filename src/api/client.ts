const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

// ── Auth token plumbing ───────────────────────────────────────────────────────
// Nearly every route in routes/api.php sits behind the auth:sanctum middleware,
// so every request needs a Bearer token once the user is signed in. Kept here
// (rather than duplicated per-call) so AuthContext is the only other place that
// needs to know about it.
const TOKEN_STORAGE_KEY = 'church_member_auth_token';
let authToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

/** AuthContext registers a callback here so a 401 from any request can force a sign-out. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

interface DataEnvelope<T> {
  data: T;
}

function isDataEnvelope<T>(body: unknown): body is DataEnvelope<T> {
  return typeof body === 'object' && body !== null && 'data' in body;
}

/**
 * Laravel wraps every JsonResource / JsonResource::collection response in a
 * top-level "data" key by default (no withoutWrapping() call in this backend),
 * so every response needs unwrapping here in one place.
 */
function unwrap<T>(body: unknown): T {
  if (isDataEnvelope<T>(body)) {
    return body.data;
  }
  return body as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let errors: Record<string, string[]> | undefined;
    try {
      const body: unknown = await response.json();
      if (typeof body === 'object' && body !== null) {
        const record = body as Record<string, unknown>;
        if (typeof record.message === 'string') message = record.message;
        if (typeof record.errors === 'object' && record.errors !== null) {
          errors = record.errors as Record<string, string[]>;
        }
      }
    } catch {
      // Response had no JSON body (e.g. a 500 with an HTML error page).
    }
    // A 401 means the token is missing/expired/revoked — let AuthContext clear
    // the session and drop the user back on the login screen.
    if (response.status === 401) {
      onUnauthorized?.();
    }
    throw new ApiError(message, response.status, errors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json();
  return unwrap<T>(body);
}

export const apiGet = <T>(path: string): Promise<T> => request<T>(path);

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPut = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) });

export const apiPatch = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

// DELETE routes in routes/api.php return 204 No Content, which request() maps to
// undefined — so callers typically use apiDelete<void>.
export const apiDelete = <T>(path: string): Promise<T> =>
  request<T>(path, { method: 'DELETE' });
