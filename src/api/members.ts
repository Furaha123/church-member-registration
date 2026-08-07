import { apiGet, apiPost, apiPut } from './client';
import type { Member, MemberPayload } from '../types/member';

const BASE = '/members';

export const getMembers = (): Promise<Member[]> => apiGet(BASE);

export const getMember = (id: number): Promise<Member> => apiGet(`${BASE}/${id}`);

export const createMember = (data: MemberPayload): Promise<Member> => apiPost(BASE, data);

export const updateMember = (id: number, data: MemberPayload): Promise<Member> =>
  apiPut(`${BASE}/${id}`, data);

// Note: there is no destroy route in routes/api.php
// (Route::apiResource('members', MemberController::class)->except('destroy')),
// so member deletion is intentionally not available from the frontend yet.
