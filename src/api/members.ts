import { apiGet, apiPost, apiPut } from './client';
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

export const getMembers = (filters: MemberFilters = {}): Promise<Member[]> =>
  apiGet(`${BASE}${buildMemberQuery(filters)}`);

export const getMember = (id: number): Promise<Member> => apiGet(`${BASE}/${id}`);

export const createMember = (data: MemberPayload): Promise<Member> => apiPost(BASE, data);

export const updateMember = (id: number, data: MemberPayload): Promise<Member> =>
  apiPut(`${BASE}/${id}`, data);

// Note: there is no destroy route in routes/api.php
// (Route::apiResource('members', MemberController::class)->except('destroy')),
// so member deletion is intentionally not available from the frontend.
