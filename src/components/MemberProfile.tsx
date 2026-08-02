import { useEffect, useState } from 'react';
import type { Member } from '../types/member';
import { SEX_OPTIONS, MARITAL_STATUS_OPTIONS, CELL_OPTIONS } from '../data/constants';
import {
  getDistrictsForProvince,
  getSectorsForDistrict,
  getCellulesForSector,
  getVillagesForCellule,
  getProvinces,
} from '../api/lookups';

interface MemberProfileProps {
  member: Member;
  onEdit: () => void;
  onBack: () => void;
}

function lookupName(options: { id: number; name: string }[], id: number | null): string {
  if (id === null) return '—';
  return options.find((o) => o.id === id)?.name ?? '—';
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: 13, color: 'var(--cream-faint)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
    </div>
  );
}

interface TagGroupProps {
  label: string;
  items: { id: number; name: string }[];
  tone?: 'gold' | 'blue' | 'neutral';
}

function TagGroup({ label, items, tone = 'neutral' }: TagGroupProps) {
  const tagClass = tone === 'neutral' ? 'tag' : `tag ${tone}`;
  return (
    <div style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
      <div style={{ fontSize: 13, color: 'var(--cream-faint)', marginBottom: 10 }}>{label}</div>
      {items.length === 0 ? (
        <div style={{ fontSize: 14, color: 'var(--cream-faint)' }}>—</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {items.map((item) => (
            <span key={item.id} className={tagClass}>{item.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

interface PairedGroupProps {
  label: string;
  parents: { id: number; name: string }[];
  childrenOf: (parentId: number) => { id: number; name: string }[];
  tone?: 'gold' | 'blue' | 'neutral';
}

// Renders each parent (an education level, a department) with the specific
// children a member paired it with (that education's faculties, that
// department's responsibilities) nested underneath — using the education_id /
// department_id now exposed on faculties/church_responsibilities by the API.
function PairedGroup({ label, parents, childrenOf, tone = 'neutral' }: PairedGroupProps) {
  const tagClass = tone === 'neutral' ? 'tag' : `tag ${tone}`;
  return (
    <div style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
      <div style={{ fontSize: 13, color: 'var(--cream-faint)', marginBottom: 10 }}>{label}</div>
      {parents.length === 0 ? (
        <div style={{ fontSize: 14, color: 'var(--cream-faint)' }}>—</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {parents.map((parent) => {
            const kids = childrenOf(parent.id);
            return (
              <div key={parent.id}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cream)', marginBottom: kids.length > 0 ? 6 : 0 }}>
                  {parent.name}
                </div>
                {kids.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {kids.map((kid) => (
                      <span key={kid.id} className={tagClass}>{kid.name}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Resolves the human-readable geography chain for a member. There's no
 * "get district by id" style endpoint — only "list districts for a province" —
 * so this walks the chain the member already has ids for and matches by id.
 */
function useGeographyNames(member: Member) {
  const [names, setNames] = useState({ province: '—', district: '—', sector: '—', cellule: '—', village: '—' });

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const next = { province: '—', district: '—', sector: '—', cellule: '—', village: '—' };
      try {
        if (member.province_id) {
          const provinces = await getProvinces();
          next.province = provinces.find((p) => p.id === member.province_id)?.name ?? '—';
        }
        if (member.province_id && member.district_id) {
          const districts = await getDistrictsForProvince(member.province_id);
          next.district = districts.find((d) => d.id === member.district_id)?.name ?? '—';
        }
        if (member.district_id && member.sector_id) {
          const sectors = await getSectorsForDistrict(member.district_id);
          next.sector = sectors.find((s) => s.id === member.sector_id)?.name ?? '—';
        }
        if (member.sector_id && member.cellule_id) {
          const cellules = await getCellulesForSector(member.sector_id);
          next.cellule = cellules.find((c) => c.id === member.cellule_id)?.name ?? '—';
        }
        if (member.cellule_id && member.village_id) {
          const villages = await getVillagesForCellule(member.cellule_id);
          next.village = villages.find((v) => v.id === member.village_id)?.name ?? '—';
        }
      } catch {
        // Leave whatever was resolved so far; geography display degrades to '—'.
      }
      if (!cancelled) setNames(next);
    }

    void resolve();
    return () => { cancelled = true; };
  }, [member.province_id, member.district_id, member.sector_id, member.cellule_id, member.village_id]);

  return names;
}

export function MemberProfile({ member, onEdit, onBack }: MemberProfileProps) {
  const geoNames = useGeographyNames(member);

  return (
    <div>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        ← Back to Directory
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 20 }}>
            {getInitials(member.first_name, member.last_name)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="card-title" style={{ margin: 0 }}>{member.first_name} {member.last_name}</h2>
            <div className="card-sub" style={{ marginTop: 4 }}>#{member.id} · {lookupName(SEX_OPTIONS, member.sex_id)} · {lookupName(MARITAL_STATUS_OPTIONS, member.marital_status_id)}</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onEdit}>Edit</button>
        </div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px 32px' }}>
          <div>
            <div className="section-title"><h3>Personal</h3></div>
            <DetailRow label="Father's Name" value={member.fathers_name ?? ''} />
            <DetailRow label="Mother's Name" value={member.mothers_name ?? ''} />
            <DetailRow label="Employed" value={member.employed === null ? '—' : member.employed ? 'Yes' : 'No'} />
          </div>

          <div>
            <div className="section-title"><h3>Contact</h3></div>
            <DetailRow label="Mobile" value={member.mobile_tel ?? ''} />
            <DetailRow label="Email" value={member.email ?? ''} />
            <DetailRow label="Fax" value={member.fax_number ?? ''} />
          </div>

          <div>
            <div className="section-title"><h3>Geography</h3></div>
            <DetailRow label="Province" value={geoNames.province} />
            <DetailRow label="District" value={geoNames.district} />
            <DetailRow label="Sector" value={geoNames.sector} />
            <DetailRow label="Cellule" value={geoNames.cellule} />
            <DetailRow label="Village" value={geoNames.village} />
            <DetailRow label="Cell" value={lookupName(CELL_OPTIONS, member.cell_id)} />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div className="section-title" style={{ marginTop: 24 }}><h3>Church &amp; Work</h3></div>
          <div className="detail-tag-list">
            <PairedGroup
              label="Departments & Responsibilities"
              parents={member.departments}
              childrenOf={(deptId) => member.church_responsibilities.filter((cr) => cr.department_id === deptId)}
              tone="gold"
            />
            <TagGroup label="Talents" items={member.talents} tone="blue" />
            <TagGroup label="Spiritual Gifts" items={member.spiritual_gifts} tone="blue" />
            <TagGroup label="Occupations" items={member.occupations} />
            <PairedGroup
              label="Education & Faculties"
              parents={member.educations}
              childrenOf={(eduId) => member.faculties.filter((f) => f.education_id === eduId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
