import { useState } from 'react';
import type { Member } from '../types/member';
import type { Family } from '../types/family';
import { useFamilies } from '../hooks/useFamilies';
import { FamilyForm } from './FamilyForm';
import { Icon } from './Layout';

interface FamiliesProps {
  members: Member[];
}

type View = { mode: 'list' } | { mode: 'create' } | { mode: 'edit'; family: Family };

function membersSummary(family: Family): string {
  if (family.members.length === 0) return 'No members yet';
  return family.members
    .map((m) => `${m.first_name} ${m.last_name} (${m.role_type})`)
    .join(', ');
}

export function Families({ members }: FamiliesProps) {
  const { families, loading, error, addFamily, editFamily, removeFamily } = useFamilies();
  const [view, setView] = useState<View>({ mode: 'list' });
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const deletingFamily =
    pendingDeleteId !== null ? families.find((f) => f.id === pendingDeleteId) ?? null : null;

  async function confirmDelete(id: number): Promise<void> {
    setDeleteError(null);
    setDeleting(true);
    try {
      await removeFamily(id);
      setPendingDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete family.');
    } finally {
      setDeleting(false);
    }
  }

  if (view.mode === 'create') {
    return (
      <FamilyForm
        members={members}
        onSubmit={addFamily}
        onSuccess={() => setView({ mode: 'list' })}
        onCancel={() => setView({ mode: 'list' })}
      />
    );
  }

  if (view.mode === 'edit') {
    const target = view.family;
    return (
      <FamilyForm
        family={target}
        members={members}
        onSubmit={(data) => editFamily(target.id, data)}
        onSuccess={() => setView({ mode: 'list' })}
        onCancel={() => setView({ mode: 'list' })}
      />
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="eyebrow">Families</div>
          <h2 className="card-title">Family Directory</h2>
          <div className="card-sub">
            <strong style={{ color: 'var(--gold-300)' }}>{families.length}</strong> families registered.
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setView({ mode: 'create' })}>
          <Icon name="plus" size={12} /> New Family
        </button>
      </div>

      {error && <div className="state-banner error">Couldn't load families: {error}</div>}

      {loading ? (
        <div className="checklist-empty">Loading families…</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="member-table">
            <thead>
              <tr>
                <th>Family</th>
                <th>Address</th>
                <th>Formed</th>
                <th>Members</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {families.map((family) => (
                <tr key={family.id}>
                  <td>
                    <div className="name">{family.family_name}</div>
                    <div className="id-num">#{family.id}</div>
                  </td>
                  <td>{family.address || '—'}</td>
                  <td>{family.date_formed || '—'}</td>
                  <td style={{ maxWidth: 320 }}>
                    <span style={{ fontSize: 13, color: 'var(--cream-dim)' }}>{membersSummary(family)}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-btn accent"
                        onClick={() => setView({ mode: 'edit', family })}
                        aria-label={`Edit ${family.family_name}`}
                        title="Edit family"
                      >
                        <Icon name="edit" size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => { setDeleteError(null); setPendingDeleteId(family.id); }}
                        aria-label={`Delete ${family.family_name}`}
                        title="Delete family"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {families.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--cream-faint)', padding: '32px 0' }}>
                    No families registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {deletingFamily && (
        <div className="modal-overlay" onClick={() => setPendingDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">Families</div>
                <h2 className="card-title">Delete Family</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setPendingDeleteId(null)} aria-label="Close">
                <Icon name="close" size={16} />
              </button>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deletingFamily.family_name}</strong>? This removes the family
              grouping (the member records themselves are not deleted). This action cannot be undone.
            </p>
            {deleteError && <div className="state-banner error" style={{ marginTop: 12 }}>{deleteError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setPendingDeleteId(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(deletingFamily.id)} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
