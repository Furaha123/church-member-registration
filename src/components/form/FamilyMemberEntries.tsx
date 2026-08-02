import { Icon } from '../Layout';

// This whole section is a frontend-only placeholder. The backend has no
// table, field, or endpoint for spouse/children data yet (confirmed against
// both the Member model/migrations and the generated OpenAPI spec) — so
// these entries are kept in local form state only and are never sent in the
// MemberPayload. The UI exists now so the design is ready once the backend
// adds real support (see the info banner shown alongside it).

export type FamilyRelationship = 'spouse' | 'child' | 'other';

export interface FamilyMemberEntry {
  first_name: string;
  last_name: string;
  relationship: FamilyRelationship;
  date_of_birth: string;
}

interface FamilyMemberEntriesProps {
  entries: FamilyMemberEntry[];
  onChange: (entries: FamilyMemberEntry[]) => void;
}

function emptyEntry(): FamilyMemberEntry {
  return { first_name: '', last_name: '', relationship: 'child', date_of_birth: '' };
}

export function FamilyMemberEntries({ entries, onChange }: FamilyMemberEntriesProps) {
  function updateEntry(index: number, patch: Partial<FamilyMemberEntry>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function addEntry() {
    onChange([...entries, emptyEntry()]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  return (
    <div className="field field-col-12">
      {entries.map((entry, index) => (
        <div className="entry-card" key={index}>
          <div className="entry-card-header">
            <span className="entry-card-title">Family Member {index + 1}</span>
            <button
              type="button"
              className="entry-remove"
              onClick={() => removeEntry(index)}
              aria-label="Remove this family member"
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
          <div className="form-grid">
            <div className="field field-col-4">
              <label className="label">First Name</label>
              <input
                className="input"
                value={entry.first_name}
                onChange={(e) => updateEntry(index, { first_name: e.target.value })}
              />
            </div>
            <div className="field field-col-4">
              <label className="label">Last Name</label>
              <input
                className="input"
                value={entry.last_name}
                onChange={(e) => updateEntry(index, { last_name: e.target.value })}
              />
            </div>
            <div className="field field-col-4">
              <label className="label">Relationship</label>
              <select
                className="select"
                value={entry.relationship}
                onChange={(e) => updateEntry(index, { relationship: e.target.value as FamilyRelationship })}
              >
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field field-col-4">
              <label className="label">Date of Birth <span className="hint">optional</span></label>
              <input
                className="input"
                type="date"
                value={entry.date_of_birth}
                onChange={(e) => updateEntry(index, { date_of_birth: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="add-entry-btn" onClick={addEntry}>
        <Icon name="plus" size={11} /> Add Family Member
      </button>
    </div>
  );
}
