import { useMemo, useState } from 'react';
import type { Member } from '../types/member';
import { Icon } from './Layout';
import { SEX_OPTIONS, MARITAL_STATUS_OPTIONS } from '../data/constants';

interface DirectoryProps {
  members: Member[];
  loading: boolean;
  error: string | null;
  onNewMember: () => void;
  onViewMember: (id: number) => void;
  onEditMember: (id: number) => void;
}

function lookupName(options: { id: number; name: string }[], id: number | null): string {
  if (id === null) return '—';
  return options.find((o) => o.id === id)?.name ?? '—';
}

function initials(m: Member): string {
  return (m.first_name?.[0] ?? '') + (m.last_name?.[0] ?? '');
}

function namesOf(list: { name: string }[]): string {
  return list.length > 0 ? list.map((l) => l.name).join(', ') : '—';
}

export function MemberList({ members, loading, error, onNewMember, onViewMember, onEditMember }: DirectoryProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const departmentFilters = useMemo(() => {
    const names = new Set<string>();
    members.forEach((m) => m.departments.forEach((d) => names.add(d.name)));
    return ['All', ...Array.from(names).sort()];
  }, [members]);

  const visible = members.filter((m) => {
    if (filter !== 'All' && !m.departments.some((d) => d.name === filter)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const haystack = [
      m.first_name,
      m.last_name,
      m.mobile_tel ?? '',
      m.email ?? '',
      ...m.departments.map((d) => d.name),
      ...m.talents.map((t) => t.name),
    ];
    return haystack.some((f) => f?.toLowerCase().includes(q));
  });

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="eyebrow">Members</div>
            <h2 className="card-title">Member Directory</h2>
            <div className="card-sub">
              Showing <strong style={{ color: 'var(--gold-300)' }}>{visible.length}</strong> of {members.length} members enrolled.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={onNewMember}>
              <Icon name="plus" size={12} /> New Member
            </button>
          </div>
        </div>

        {error && <div className="state-banner error">Couldn't load members: {error}</div>}

        <div className="directory-toolbar">
          <div className="search">
            <span className="ico"><Icon name="search" size={16} /></span>
            <input
              placeholder="Search by name, mobile, email, department, or talent…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-pills">
            {departmentFilters.map((f) => (
              <button key={f} className={'pill' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="checklist-empty">Loading members…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="member-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Gender / Marital Status</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Departments</th>
                  <th>Employed</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="member-cell">
                        <div className="avatar">{initials(m)}</div>
                        <div>
                          <div className="name">{m.first_name} {m.last_name}</div>
                          <div className="id-num">#{m.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--cream)' }}>{lookupName(SEX_OPTIONS, m.sex_id)}</div>
                      <div style={{ fontSize: 12, color: 'var(--cream-faint)' }}>
                        {lookupName(MARITAL_STATUS_OPTIONS, m.marital_status_id)}
                      </div>
                    </td>
                    <td>{m.email || '—'}</td>
                    <td>{m.mobile_tel || '—'}</td>
                    <td><span className="tag gold">{namesOf(m.departments)}</span></td>
                    <td>
                      <span className={'tag ' + (m.employed ? 'green' : '')}>{m.employed === null ? '—' : m.employed ? 'Yes' : 'No'}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => onViewMember(m.id)}
                          aria-label={`View ${m.first_name} ${m.last_name}`}
                          title="View details"
                        >
                          <Icon name="eye" size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn accent"
                          onClick={() => onEditMember(m.id)}
                          aria-label={`Edit ${m.first_name} ${m.last_name}`}
                          title="Edit member"
                        >
                          <Icon name="edit" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--cream-faint)', padding: '32px 0' }}>
                      No members match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
