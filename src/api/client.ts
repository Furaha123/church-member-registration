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

// A paginated ResourceCollection (e.g. GET /v1/members) additionally carries a
// top-level "meta" block from Laravel's paginator.
export interface PageMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

interface RawPageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

function extractMeta(body: unknown): PageMeta | null {
  if (typeof body !== 'object' || body === null || !('meta' in body)) return null;
  const meta = (body as { meta: unknown }).meta;
  if (typeof meta !== 'object' || meta === null) return null;
  const m = meta as Partial<RawPageMeta>;
  if (
    typeof m.current_page !== 'number' ||
    typeof m.last_page !== 'number' ||
    typeof m.per_page !== 'number' ||
    typeof m.total !== 'number'
  ) {
    return null;
  }
  return { currentPage: m.current_page, lastPage: m.last_page, perPage: m.per_page, total: m.total };
}

async function requestRaw(path: string, options: RequestInit = {}): Promise<unknown> {
  // FormData bodies (multipart/form-data, used for member picture uploads) must
  // NOT get an explicit Content-Type — the browser sets one itself, including
  // the multipart boundary. Setting it manually here would break parsing.
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
    return undefined;
  }

  return await response.json();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const body = await requestRaw(path, options);
  return unwrap<T>(body);
}

export interface WithMeta<T> {
  data: T;
  meta: PageMeta | null;
}

async function requestWithMeta<T>(path: string, options: RequestInit = {}): Promise<WithMeta<T>> {
  const body = await requestRaw(path, options);
  return { data: unwrap<T>(body), meta: extractMeta(body) };
}

export const apiGet = <T>(path: string): Promise<T> => request<T>(path);

// Like apiGet, but also surfaces the paginator's "meta" block (current_page,
// last_page, per_page, total) for endpoints that page server-side.
export const apiGetWithMeta = <T>(path: string): Promise<WithMeta<T>> => requestWithMeta<T>(path);

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPut = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) });

// Multipart submission, used only when a member picture file is attached (see
// buildMemberFormData in api/members.ts). Plain JSON is used everywhere else.
export const apiPostForm = <T>(path: string, form: FormData): Promise<T> =>
  request<T>(path, { method: 'POST', body: form });

// PHP does not parse multipart/form-data bodies on PUT/PATCH requests, so an
// update that includes a file is sent as POST with Laravel's `_method` override
// field, which its routing layer treats as a real PUT.
export const apiPutForm = <T>(path: string, form: FormData): Promise<T> => {
  form.append('_method', 'PUT');
  return request<T>(path, { method: 'POST', body: form });
};

export const apiPatch = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

// DELETE routes in routes/api.php return 204 No Content, which request() maps to
// undefined — so callers typically use apiDelete<void>.
export const apiDelete = <T>(path: string): Promise<T> =>
  request<T>(path, { method: 'DELETE' });
