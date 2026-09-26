import { useEffect, useState } from 'react';
import type { NamedLookup } from '../../types/lookup';
import type { EducationEntry } from '../../types/member';
import { getFacultiesForEducation, createFacultyForEducation } from '../../api/lookups';
import { MultiSelectChecklist } from './MultiSelectChecklist';
import { AddOtherField } from './AddOtherField';
import { Icon } from '../Layout';

interface EducationEntriesProps {
  educations: NamedLookup[];
  entries: EducationEntry[];
  onChange: (entries: EducationEntry[]) => void;
}

export function EducationEntries({ educations, entries, onChange }: EducationEntriesProps) {
  function updateEntry(index: number, patch: Partial<EducationEntry>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function addEntry() {
    onChange([...entries, { education_id: 0, faculty: [] }]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  return (
    <div className="field field-col-12">
      {entries.map((entry, index) => (
        <EducationEntryCard
          key={index}
          index={index}
          entry={entry}
          educations={educations}
          onUpdate={(patch) => updateEntry(index, patch)}
          onRemove={() => removeEntry(index)}
        />
      ))}
      <button type="button" className="add-entry-btn" onClick={addEntry}>
        <Icon name="plus" size={11} /> Add Education
      </button>
    </div>
  );
}

interface EducationEntryCardProps {
  index: number;
  entry: EducationEntry;
  educations: NamedLookup[];
  onUpdate: (patch: Partial<EducationEntry>) => void;
  onRemove: () => void;
}

function EducationEntryCard({ index, entry, educations, onUpdate, onRemove }: EducationEntryCardProps) {
  const [faculties, setFaculties] = useState<NamedLookup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entry.education_id) {
      setFaculties([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getFacultiesForEducation(entry.education_id)
      .then((data) => { if (!cancelled) setFaculties(data); })
      .catch(() => { if (!cancelled) setFaculties([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [entry.education_id]);

  return (
    <div className="entry-card">
      <div className="entry-card-header">
        <span className="entry-card-title">Education {index + 1}</span>
        <button type="button" className="entry-remove" onClick={onRemove} aria-label="Remove this education entry">
          <Icon name="trash" size={14} />
        </button>
      </div>
      <div className="form-grid">
        <div className="field field-col-12">
          <label className="label">Education Level</label>
          <select
            className="select"
            value={entry.education_id || ''}
            onChange={(e) => onUpdate({ education_id: Number(e.target.value), faculty: [] })}
          >
            <option value="" disabled>Select level…</option>
            {educations.map((ed) => (
              <option key={ed.id} value={ed.id}>{ed.name}</option>
            ))}
          </select>
        </div>
        <MultiSelectChecklist
          label="Field of Study"
          searchable
          loading={loading}
          options={faculties}
          selected={entry.faculty}
          onChange={(ids) => onUpdate({ faculty: ids })}
          placeholder={`Search ${faculties.length} options…`}
          emptyText={entry.education_id ? 'No fields of study for this education level.' : 'Select an education level first.'}
        />
        <AddOtherField
          label="Not on the list?"
          placeholder="Add a field of study for this level"
          disabled={!entry.education_id}
          disabledHint="select an education level first"
          onCreate={(name) => createFacultyForEducation(entry.education_id, name)}
          onAdded={(created) => {
            setFaculties((prev) => [...prev, created]);
            onUpdate({ faculty: [...entry.faculty, created.id] });
          }}
        />
      </div>
    </div>
  );
}
