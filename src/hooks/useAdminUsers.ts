import { useCallback, useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser, updateUserRole } from '../api/admin';
import { notifySuccess, notifyError } from '../notify';
import type {
  AdminUser,
  CreateUserPayload,
  CreateUserResult,
  UpdateUserPayload,
  UserRole,
} from '../types/admin';

interface UseAdminUsersReturn {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addUser: (data: CreateUserPayload) => Promise<CreateUserResult>;
  editUser: (id: number, data: UpdateUserPayload) => Promise<AdminUser>;
  removeUser: (id: number) => Promise<void>;
  changeRole: (id: number, role: UserRole) => Promise<AdminUser>;
}

export function useAdminUsers(enabled: boolean = true): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await getUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  const addUser = useCallback(async (data: CreateUserPayload): Promise<CreateUserResult> => {
    try {
      const result = await createUser(data);
      setUsers((prev) => [result.user, ...prev]);
      notifySuccess('User created.');
      return result;
    } catch (err) {
      notifyError(err, 'Failed to create user.');
      throw err;
    }
  }, []);

  const editUser = useCallback(async (id: number, data: UpdateUserPayload): Promise<AdminUser> => {
    try {
      const updated = await updateUser(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      notifySuccess('User updated.');
      return updated;
    } catch (err) {
      notifyError(err, 'Failed to update user.');
      throw err;
    }
  }, []);

  const removeUser = useCallback(async (id: number): Promise<void> => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      notifySuccess('User deleted.');
    } catch (err) {
      notifyError(err, 'Failed to delete user.');
      throw err;
    }
  }, []);

  const changeRole = useCallback(async (id: number, role: UserRole): Promise<AdminUser> => {
    try {
      const updated = await updateUserRole(id, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      notifySuccess('Role updated.');
      return updated;
    } catch (err) {
      notifyError(err, 'Failed to update role.');
      throw err;
    }
  }, []);

  return { users, loading, error, refresh, addUser, editUser, removeUser, changeRole };
}
