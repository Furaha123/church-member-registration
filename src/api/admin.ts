import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client';
import type {
  AdminUser,
  CreateUserPayload,
  CreateUserResult,
  UpdateUserPayload,
  UpdateUserRolePayload,
} from '../types/admin';

// ── Matches AdminUserController (routes/api.php, behind auth:sanctum + ────────
// can:viewAny,User — i.e. admin-only). Mounted under /v1/admin.
// GET    /v1/admin/users                 -> AdminUser[]
// POST   /v1/admin/users                 -> AdminUser (201)
// GET    /v1/admin/users/{user}          -> AdminUser
// PUT    /v1/admin/users/{user}          -> AdminUser
// DELETE /v1/admin/users/{user}          -> 204
// PATCH  /v1/admin/users/{user}/role     -> AdminUser

const BASE = '/admin/users';

export const getUsers = (): Promise<AdminUser[]> => apiGet(BASE);

export const getUser = (id: number): Promise<AdminUser> => apiGet(`${BASE}/${id}`);

export const createUser = (data: CreateUserPayload): Promise<CreateUserResult> =>
  apiPost(BASE, data);

export const updateUser = (id: number, data: UpdateUserPayload): Promise<AdminUser> =>
  apiPut(`${BASE}/${id}`, data);

export const deleteUser = (id: number): Promise<void> => apiDelete(`${BASE}/${id}`);

export const updateUserRole = (id: number, data: UpdateUserRolePayload): Promise<AdminUser> =>
  apiPatch(`${BASE}/${id}/role`, data);
