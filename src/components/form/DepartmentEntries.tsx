import { useEffect, useState } from 'react';
import type { NamedLookup } from '../../types/lookup';
import type { DepartmentEntry } from '../../types/member';
import { getChurchResponsibilitiesForDepartment } from '../../api/lookups';
import { MultiSelectChecklist } from './MultiSelectChecklist';
import { Icon } from '../Layout';

interface DepartmentEntriesProps {
  departments: NamedLookup[];
  entries: DepartmentEntry[];
  onChange: (entries: DepartmentEntry[]) => void;
}

export function DepartmentEntries({ departments, entries, onChange }: DepartmentEntriesProps) {
  function updateEntry(index: number, patch: Partial<DepartmentEntry>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function addEntry() {
    onChange([...entries, { department_id: 0, church_responsibility: [] }]);
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  return (
    <div className="field field-col-12">
      {entries.map((entry, index) => (
        <DepartmentEntryCard
          key={index}
          index={index}
          entry={entry}
          departments={departments}
          onUpdate={(patch) => updateEntry(index, patch)}
          onRemove={() => removeEntry(index)}
        />
      ))}
      <button type="button" className="add-entry-btn" onClick={addEntry}>
        <Icon name="plus" size={11} /> Add Department
      </button>
    </div>
  );
}

interface DepartmentEntryCardProps {
  index: number;
  entry: DepartmentEntry;
  departments: NamedLookup[];
  onUpdate: (patch: Partial<DepartmentEntry>) => void;
  onRemove: () => void;
}

function DepartmentEntryCard({ index, entry, departments, onUpdate, onRemove }: DepartmentEntryCardProps) {
  const [responsibilities, setResponsibilities] = useState<NamedLookup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entry.department_id) {
      setResponsibilities([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getChurchResponsibilitiesForDepartment(entry.department_id)
      .then((data) => { if (!cancelled) setResponsibilities(data); })
      .catch(() => { if (!cancelled) setResponsibilities([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [entry.department_id]);

  return (
    <div className="entry-card">
      <div className="entry-card-header">
        <span className="entry-card-title">Department {index + 1}</span>
        <button type="button" className="entry-remove" onClick={onRemove} aria-label="Remove department">
          <Icon name="trash" size={14} />
        </button>
      </div>
      <div className="form-grid">
        <div className="field field-col-12">
          <label className="label">Department</label>
          <select
            className="select"
            value={entry.department_id || ''}
            onChange={(e) => onUpdate({ department_id: Number(e.target.value), church_responsibility: [] })}
          >
            <option value="" disabled>Select department…</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        <MultiSelectChecklist
          label="Church Responsibilities"
          searchable
          loading={loading}
          options={responsibilities}
          selected={entry.church_responsibility}
          onChange={(ids) => onUpdate({ church_responsibility: ids })}
          placeholder={`Search ${responsibilities.length} responsibilities…`}
          emptyText={entry.department_id ? 'No responsibilities for this department.' : 'Select a department first.'}
        />
      </div>
    </div>
  );
}
