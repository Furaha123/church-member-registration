import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Family, FamilyPayload, AddFamilyMemberPayload } from '../types/family';

// ── Matches FamilyController (routes/api.php, all behind auth:sanctum) ────────
// GET    /v1/families                              -> Family[]
// POST   /v1/families                              -> Family (201)
// GET    /v1/families/{id}                          -> Family
// PUT    /v1/families/{id}                          -> Family
// DELETE /v1/families/{id}                          -> 204
// POST   /v1/families/{family}/members             -> Family (201)
// DELETE /v1/families/{family}/members/{member}    -> 204

const BASE = '/families';

export const getFamilies = (): Promise<Family[]> => apiGet(BASE);

export const getFamily = (id: number): Promise<Family> => apiGet(`${BASE}/${id}`);

export const createFamily = (data: FamilyPayload): Promise<Family> => apiPost(BASE, data);

export const updateFamily = (id: number, data: FamilyPayload): Promise<Family> =>
  apiPut(`${BASE}/${id}`, data);

export const deleteFamily = (id: number): Promise<void> => apiDelete(`${BASE}/${id}`);

export const addFamilyMember = (
  familyId: number,
  data: AddFamilyMemberPayload,
): Promise<Family> => apiPost(`${BASE}/${familyId}/members`, data);

export const removeFamilyMember = (familyId: number, memberId: number): Promise<void> =>
  apiDelete(`${BASE}/${familyId}/members/${memberId}`);
