import { useState } from 'react';
import type { AdminUser, CreateUserResult, UserRole } from '../types/admin';
import { USER_ROLES } from '../types/admin';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { ApiError } from '../api/client';
import { Icon } from './Layout';

interface AdminUsersProps {
  currentUserId: number;
}

interface EditDraft {
  name: string;
  email: string;
}

export function AdminUsers({ currentUserId }: AdminUsersProps) {
  const { users, loading, error, addUser, editUser, removeUser, changeRole } = useAdminUsers();

  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createdResult, setCreatedResult] = useState<CreateUserResult | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({ name: '', email: '' });
  const [rowError, setRowError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  async function handleCreate(): Promise<void> {
    if (creating || createName.trim() === '' || createEmail.trim() === '') return;
    setCreating(true);
    setCreateError(null);
    try {
      const result = await addUser({ name: createName.trim(), email: createEmail.trim() });
      setCreatedResult(result);
      setCreateName('');
      setCreateEmail('');
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  }

  function closeCreate(): void {
    setShowCreate(false);
    setCreatedResult(null);
    setPasswordCopied(false);
    setCreateError(null);
    setCreateName('');
    setCreateEmail('');
  }

  function copyTemporaryPassword(): void {
    if (!createdResult) return;
    navigator.clipboard
      .writeText(createdResult.temporary_password)
      .then(() => setPasswordCopied(true))
      .catch((err: unknown) => console.warn('Failed to copy temporary password:', err));
  }

  function startEdit(user: AdminUser): void {
    setRowError(null);
    setEditId(user.id);
    setEditDraft({ name: user.name, email: user.email });
  }

  async function saveEdit(id: number): Promise<void> {
    setRowError(null);
    try {
      await editUser(id, { name: editDraft.name.trim(), email: editDraft.email.trim() });
      setEditId(null);
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : 'Failed to update user.');
    }
  }

  async function handleRoleChange(id: number, role: UserRole): Promise<void> {
    setRowError(null);
    try {
      await changeRole(id, role);
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : 'Failed to change role.');
    }
  }

  async function confirmDelete(id: number): Promise<void> {
    setRowError(null);
    try {
      await removeUser(id);
      setPendingDeleteId(null);
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : 'Failed to delete user.');
    }
  }

  const editingUser = editId !== null ? users.find((u) => u.id === editId) ?? null : null;
  const deletingUser = pendingDeleteId !== null ? users.find((u) => u.id === pendingDeleteId) ?? null : null;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="eyebrow">Administration</div>
          <h2 className="card-title">User Management</h2>
          <div className="card-sub">
            <strong style={{ color: 'var(--gold-300)' }}>{users.length}</strong> accounts. New users receive a
            temporary password and are asked to change it on first sign-in.
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={12} /> New User
        </button>
      </div>

      {error && <div className="state-banner error">Couldn't load users: {error}</div>}
      {rowError && <div className="state-banner error">{rowError}</div>}

      {showCreate && (
        <div className="modal-overlay" onClick={closeCreate}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">Administration</div>
                <h2 className="card-title">{createdResult ? 'User Created' : 'New User'}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeCreate} aria-label="Close">
                <Icon name="close" size={16} />
              </button>
            </div>

            {createdResult ? (
              <>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  <strong>{createdResult.user.name}</strong> ({createdResult.user.email}) was created. There is no
                  welcome email — copy this temporary password and share it securely. It is shown only once, and
                  the user must change it on first sign-in.
                </p>

                <div className="field" style={{ marginTop: 16 }}>
                  <label className="label">Temporary password</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="input"
                      readOnly
                      value={createdResult.temporary_password}
                      style={{ fontFamily: 'monospace', letterSpacing: '0.02em' }}
                      onFocus={(e) => e.target.select()}
                      aria-label="Temporary password"
                    />
                    <button type="button" className="btn btn-outline btn-sm" onClick={copyTemporaryPassword}>
                      <Icon name={passwordCopied ? 'check' : 'copy'} size={14} />
                      {passwordCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  <button className="btn btn-primary btn-sm" onClick={closeCreate}>Done</button>
                </div>
              </>
            ) : (
              <>
                <div className="form-grid">
                  <div className="field field-col-6">
                    <label className="label">Name<span className="req">*</span></label>
                    <input className="input" value={createName} onChange={(e) => setCreateName(e.target.value)} />
                  </div>
                  <div className="field field-col-6">
                    <label className="label">Email<span className="req">*</span></label>
                    <input
                      className="input"
                      type="email"
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                    />
                  </div>
                </div>
                {createError && <div className="state-banner error">{createError}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  <button className="btn btn-outline btn-sm" onClick={closeCreate}>Cancel</button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleCreate}
                    disabled={creating || createName.trim() === '' || createEmail.trim() === ''}
                  >
                    {creating ? 'Creating…' : 'Create User'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="checklist-empty">Loading users…</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="member-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Must Change Password</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="name">{user.name}{isSelf && ' (you)'}</div>
                      <div className="id-num">#{user.id}</div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="select"
                        value={user.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        aria-label={`Role for ${user.name}`}
                      >
                        {USER_ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={'tag ' + (user.must_change_password ? '' : 'green')}>
                        {user.must_change_password ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-btn accent"
                          onClick={() => startEdit(user)}
                          aria-label={`Edit ${user.name}`}
                          title="Edit user"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setPendingDeleteId(user.id)}
                          disabled={isSelf}
                          aria-label={`Delete ${user.name}`}
                          title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--cream-faint)', padding: '32px 0' }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">Administration</div>
                <h2 className="card-title">Edit User</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setEditId(null)} aria-label="Close">
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="form-grid">
              <div className="field field-col-6">
                <label className="label">Name<span className="req">*</span></label>
                <input
                  className="input"
                  value={editDraft.name}
                  onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                  aria-label="User name"
                />
              </div>
              <div className="field field-col-6">
                <label className="label">Email<span className="req">*</span></label>
                <input
                  className="input"
                  type="email"
                  value={editDraft.email}
                  onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
                  aria-label="User email"
                />
              </div>
            </div>
            {rowError && <div className="state-banner error">{rowError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => saveEdit(editingUser.id)}
                disabled={editDraft.name.trim() === '' || editDraft.email.trim() === ''}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="modal-overlay" onClick={() => setPendingDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">Administration</div>
                <h2 className="card-title">Delete User</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setPendingDeleteId(null)}
                aria-label="Close"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deletingUser.name}</strong>? This action cannot be undone.
            </p>
            {rowError && <div className="state-banner error" style={{ marginTop: 12 }}>{rowError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setPendingDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(deletingUser.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
