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

  async function confirmDelete(id: number): Promise<void> {
    setDeleteError(null);
    try {
      await removeFamily(id);
      setPendingDeleteId(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete family.');
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
      {deleteError && <div className="state-banner error">{deleteError}</div>}

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
                    {pendingDeleteId === family.id ? (
                      <div className="row-actions">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setPendingDeleteId(null)}>
                          Cancel
                        </button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => confirmDelete(family.id)}>
                          Confirm delete
                        </button>
                      </div>
                    ) : (
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
                          onClick={() => setPendingDeleteId(family.id)}
                          aria-label={`Delete ${family.family_name}`}
                          title="Delete family"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    )}
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
    </div>
  );
}
