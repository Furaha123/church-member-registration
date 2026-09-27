import type { Family, RoleType } from '../types/family';
import { Icon } from './Layout';

interface FamilyDetailProps {
  family: Family;
  onEdit: () => void;
  onBack: () => void;
}

function roleTone(role: RoleType): string {
  if (role === 'father' || role === 'mother') return 'gold';
  if (role === 'guardian') return 'blue';
  return '';
}

function roleLabel(role: RoleType): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function FamilyDetail({ family, onEdit, onBack }: FamilyDetailProps) {
  return (
    <div>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        ← Back to Families
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 20 }}>
            <Icon name="lock" size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="card-title" style={{ margin: 0 }}>{family.family_name}</h2>
            <div className="card-sub" style={{ marginTop: 4 }}>
              #{family.id} · {family.members.length} member{family.members.length === 1 ? '' : 's'}
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onEdit}>
            <Icon name="edit" size={13} /> Edit
          </button>
        </div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13, color: 'var(--cream-faint)' }}>Address</span>
            <span style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>
              {family.address || '—'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13, color: 'var(--cream-faint)' }}>Date Formed</span>
            <span style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 600 }}>{family.date_formed || '—'}</span>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div className="section-title" style={{ marginTop: 24 }}><h3>Members</h3></div>
          {family.members.length === 0 ? (
            <div style={{ fontSize: 14, color: 'var(--cream-faint)', padding: '12px 0' }}>No members in this family yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="member-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {family.members.map((m) => (
                    <tr key={m.member_id}>
                      <td>
                        <div className="name">{m.first_name} {m.last_name}</div>
                        <div className="id-num">#{m.member_id}</div>
                      </td>
                      <td>
                        <span className={'tag ' + roleTone(m.role_type)}>{roleLabel(m.role_type)}</span>
                      </td>
                      <td>{m.start_date || '—'}</td>
                      <td>{m.end_date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
