import { apiGet, apiGetWithMeta, apiPost, apiPut, type PageMeta } from './client';
import type { Member, MemberPayload, MemberFilters } from '../types/member';

const BASE = '/members';

// Serialises MemberFilters into a Laravel-friendly query string. Arrays use the
// `key[]=1&key[]=2` convention that FilterMemberRequest's `array` rules expect;
// empty, null, and undefined values are dropped so they don't narrow the result.
function buildMemberQuery(filters: MemberFilters): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(`${key}[]`, String(item)));
      continue;
    }

    if (typeof value === 'boolean') {
      params.append(key, value ? '1' : '0');
      continue;
    }

    params.append(key, String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

// The backend list endpoint paginates (default 20 per page). The directory
// paginates on the client, so request the max page size (100) to load the full
// working set in one call. Callers can still override via filters.per_page.
const MEMBERS_PAGE_SIZE = 100;

export const getMembers = (filters: MemberFilters = {}): Promise<Member[]> =>
  apiGet(`${BASE}${buildMemberQuery({ per_page: MEMBERS_PAGE_SIZE, ...filters })}`);

export interface MembersPage {
  members: Member[];
  meta: PageMeta | null;
}

// Real server-side page fetch (as opposed to getMembers' bulk load above) —
// used by the directory table so Next/Prev actually round-trips to the
// backend for that page instead of just re-slicing an already-loaded array.
export const getMembersPage = (filters: MemberFilters): Promise<MembersPage> =>
  apiGetWithMeta<Member[]>(`${BASE}${buildMemberQuery(filters)}`).then(({ data, meta }) => ({
    members: data,
    meta,
  }));

export const getMember = (id: number): Promise<Member> => apiGet(`${BASE}/${id}`);

export const createMember = (data: MemberPayload): Promise<Member> => apiPost(BASE, data);

export const updateMember = (id: number, data: MemberPayload): Promise<Member> =>
  apiPut(`${BASE}/${id}`, data);

// Note: there is no destroy route in routes/api.php
// (Route::apiResource('members', MemberController::class)->except('destroy')),
// so member deletion is intentionally not available from the frontend.
