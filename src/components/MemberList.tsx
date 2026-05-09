import { useState } from 'react';
import type { Member } from '../types/member';
import { Icon } from './Layout';
import { SAMPLE_MEMBERS } from '../data/constants';

interface DirectoryProps {
  members: Member[];
  onNewMember: () => void;
}

const FILTERS = ['All', 'Pastors', 'Cell Leaders', 'Choir', 'Youth', 'Mothers', 'Fathers'];

type SampleMember = typeof SAMPLE_MEMBERS[number];
type AnyMember = Member | SampleMember;

function isSample(m: AnyMember): m is SampleMember {
  return 'ministry' in m && 'responsibility' in m;
}

function getMinistry(m: AnyMember): string {
  if (isSample(m)) return m.ministry;
  return (m as Member).department ?? '';
}

function getResponsibility(m: AnyMember): string {
  if (isSample(m)) return m.responsibility;
  return '';
}

function matchesFilter(m: AnyMember, filter: string): boolean {
  if (filter === 'All') return true;
  const ministry = getMinistry(m);
  const resp = getResponsibility(m);
  if (filter === 'Pastors') return resp.includes('Pastor') || ministry === 'Pastor';
  if (filter === 'Cell Leaders') return resp === 'Cell Leader' || resp === 'Zone Leader';
  if (filter === 'Choir') return resp.includes('Choir') || resp === 'Worship Leader';
  if (filter === 'Youth') return ministry === 'Youth Department';
  if (filter === 'Mothers') return ministry === "Mothers' Department";
  if (filter === 'Fathers') return ministry === "Fathers' Department";
  return true;
}

function initials(m: AnyMember): string {
  return (m.firstName?.[0] ?? '') + (m.lastName?.[0] ?? '');
}

function ageFromDob(dob: string): string {
  if (!dob) return '—';
  return String(new Date().getFullYear() - new Date(dob).getFullYear());
}

function yearsFrom(date: string): string {
  if (!date) return '—';
  return String(new Date().getFullYear() - new Date(date).getFullYear());
}

export function MemberList({ members, onNewMember }: DirectoryProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const combined: AnyMember[] = [
    ...SAMPLE_MEMBERS,
    ...members.filter(m => !SAMPLE_MEMBERS.some(s => s.id === m.id)),
  ];

  const visible = combined.filter(m => {
    if (!matchesFilter(m, filter)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const ministry = getMinistry(m);
    const resp = getResponsibility(m);
    const id = isSample(m) ? m.id : m.id;
    return [m.firstName, m.lastName, id, ministry, resp].some(f => f?.toLowerCase().includes(q));
  });

  return (
    <>
      <div className="directory-stats">
        <div className="stat-card">
          <div className="lbl">Total Members</div>
          <div className="num">{combined.length + 1279}</div>
          <div className="delta">+ {members.length} registered here</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Active Cells</div>
          <div className="num">47</div>
          <div className="delta">across 3 districts</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Baptisms · 2026</div>
          <div className="num">18</div>
          <div className="delta">last on Apr 12</div>
        </div>
        <div className="stat-card">
          <div className="lbl">Pending Registrations</div>
          <div className="num">{Math.max(0, members.length)}</div>
          <div className="delta">awaiting review</div>
        </div>
      </div>

      <div className="card" style={{ padding: '28px 32px' }}>
        <div className="card-header" style={{ marginBottom: 24, paddingBottom: 20 }}>
          <div>
            <div className="eyebrow">The Living Register</div>
            <h2 className="card-title">Member Directory</h2>
            <div className="card-sub">
              Showing <strong style={{ color: 'var(--gold-300)' }}>{visible.length}</strong> of {combined.length} members enrolled.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline btn-sm">
              <Icon name="download" size={12} /> Export
            </button>
            <button className="btn btn-primary btn-sm" onClick={onNewMember}>
              <Icon name="plus" size={12} /> New Member
            </button>
          </div>
        </div>

        <div className="directory-toolbar">
          <div className="search">
            <span className="ico"><Icon name="search" size={16} /></span>
            <input
              placeholder="Search by name, ID, cell, or ministry…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-pills">
            {FILTERS.map(f => (
              <button key={f} className={'pill' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="member-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Sex / Age</th>
                <th>Cell</th>
                <th>Ministry</th>
                <th>Responsibility</th>
                <th>Years</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(m => {
                const ministry = getMinistry(m);
                const resp = getResponsibility(m);
                const dob = isSample(m) ? m.dob : (m as Member).dateOfBirth;
                const memberSince = isSample(m) ? m.memberSince : (m as Member).dateJoined;
                const sex = isSample(m) ? m.sex : (m as Member).gender;
                const marital = isSample(m) ? m.marital : (m as Member).maritalStatus;
                const cell = isSample(m) ? m.cell : '';
                const sector = isSample(m) ? m.sector : (m as Member).city;
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="member-cell">
                        <div className="avatar">{initials(m)}</div>
                        <div>
                          <div className="name">{m.firstName} {m.lastName}</div>
                          <div className="id-num">{m.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--cream)' }}>{sex}</div>
                      <div style={{ fontSize: 11, color: 'var(--cream-faint)', letterSpacing: '0.08em' }}>
                        {ageFromDob(dob)} yrs · {marital}
                      </div>
                    </td>
                    <td>
                      <div>{cell || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--cream-faint)' }}>{sector}</div>
                    </td>
                    <td><span className="tag gold">{ministry || '—'}</span></td>
                    <td><span className="tag blue">{resp || '—'}</span></td>
                    <td style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold-300)' }}>
                      {yearsFrom(memberSince)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="tag green">✓ Active</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)', fontSize: 11, color: 'var(--cream-faint)', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Cinzel, serif' }}>
          <span>Page 1 of 161</span>
          <span>1,284 souls · last sync today</span>
        </div>
      </div>
    </>
  );
}
