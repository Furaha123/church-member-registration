// Shapes for the admin user-management API (AdminUserController + UserResource).
// Mirrors StoreUserRequest / UpdateUserRequest / UpdateUserRoleRequest.
import type { User } from './user';

export type UserRole = User['role'];

export const USER_ROLES: readonly UserRole[] = ['user', 'admin'];

// An account as returned by UserResource (GET /v1/admin/users).
export type AdminUser = User;

// Payload for POST /v1/admin/users. The backend generates the initial password
// and flags must_change_password, so only name and email are sent.
export interface CreateUserPayload {
  name: string;
  email: string;
}

// Response shape from POST /v1/admin/users. Unlike the other admin endpoints,
// this is NOT wrapped in a `data` envelope and NOT a bare UserResource — the
// controller returns the created user alongside a one-time temporary password
// (there is no welcome email, so this is the only time the password is shown).
export interface CreateUserResult {
  user: AdminUser;
  temporary_password: string;
}

// Payload for PUT /v1/admin/users/{user}. Both fields are optional on update
// (validated with `sometimes`), so only changed fields need to be sent.
export interface UpdateUserPayload {
  name?: string;
  email?: string;
}

// Payload for PATCH /v1/admin/users/{user}/role.
export interface UpdateUserRolePayload {
  role: UserRole;
}
