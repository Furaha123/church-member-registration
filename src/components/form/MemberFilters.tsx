import { useState } from 'react';
import type { MemberFilters } from '../../types/member';
import { SEX_OPTIONS, MARITAL_STATUS_OPTIONS } from '../../data/constants';
import { useLookups } from '../../hooks/useLookups';

interface MemberFiltersPanelProps {
  value: MemberFilters;
  onApply: (filters: MemberFilters) => void;
  onClear: () => void;
}

type Draft = {
  sex_id: number[];
  marital_status_id: number[];
  department_id: number[];
  age_min: string;
  age_max: string;
  date_birthday_from: string;
  date_birthday_to: string;
  employed: '' | 'yes' | 'no';
};

function toDraft(value: MemberFilters): Draft {
  const employed: Draft['employed'] =
    value.employed === true ? 'yes' : value.employed === false ? 'no' : '';
  return {
    sex_id: value.sex_id ?? [],
    marital_status_id: value.marital_status_id ?? [],
    department_id: value.department_id ?? [],
    age_min: value.age_min?.toString() ?? '',
    age_max: value.age_max?.toString() ?? '',
    date_birthday_from: value.date_birthday_from ?? '',
    date_birthday_to: value.date_birthday_to ?? '',
    employed,
  };
}

function toFilters(draft: Draft): MemberFilters {
  const filters: MemberFilters = {};

  if (draft.sex_id.length > 0) filters.sex_id = draft.sex_id;
  if (draft.marital_status_id.length > 0) filters.marital_status_id = draft.marital_status_id;
  if (draft.department_id.length > 0) filters.department_id = draft.department_id;
  if (draft.age_min.trim() !== '') filters.age_min = Number(draft.age_min);
  if (draft.age_max.trim() !== '') filters.age_max = Number(draft.age_max);
  if (draft.date_birthday_from) filters.date_birthday_from = draft.date_birthday_from;
  if (draft.date_birthday_to) filters.date_birthday_to = draft.date_birthday_to;
  if (draft.employed !== '') filters.employed = draft.employed === 'yes';

  return filters;
}

function toggleId(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

export function MemberFiltersPanel({ value, onApply, onClear }: MemberFiltersPanelProps) {
  const { departments } = useLookups();
  const [draft, setDraft] = useState<Draft>(() => toDraft(value));

  function set<K extends keyof Draft>(key: K, next: Draft[K]): void {
    setDraft((prev) => ({ ...prev, [key]: next }));
  }

  function handleClear(): void {
    setDraft(toDraft({}));
    onClear();
  }

  return (
    <div className="entry-card">
      <div className="form-grid">
        <div className="field field-col-6">
          <label className="label">Birthday from</label>
          <input
            className="input"
            type="date"
            max={TODAY_ISO}
            value={draft.date_birthday_from}
            onChange={(e) => set('date_birthday_from', e.target.value)}
          />
        </div>
        <div className="field field-col-6">
          <label className="label">Birthday to</label>
          <input
            className="input"
            type="date"
            max={TODAY_ISO}
            value={draft.date_birthday_to}
            onChange={(e) => set('date_birthday_to', e.target.value)}
          />
        </div>

        <div className="field field-col-3">
          <label className="label">Min age</label>
          <input
            className="input"
            type="number"
            min={0}
            value={draft.age_min}
            onChange={(e) => set('age_min', e.target.value)}
          />
        </div>
        <div className="field field-col-3">
          <label className="label">Max age</label>
          <input
            className="input"
            type="number"
            min={0}
            value={draft.age_max}
            onChange={(e) => set('age_max', e.target.value)}
          />
        </div>
        <div className="field field-col-6">
          <label className="label">Employment</label>
          <select
            className="select"
            value={draft.employed}
            onChange={(e) => set('employed', e.target.value as Draft['employed'])}
          >
            <option value="">Any</option>
            <option value="yes">Employed</option>
            <option value="no">Not employed</option>
          </select>
        </div>

        <div className="field field-col-6">
          <label className="label">Gender</label>
          <div className="filter-pills">
            {SEX_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={'pill' + (draft.sex_id.includes(option.id) ? ' active' : '')}
                onClick={() => set('sex_id', toggleId(draft.sex_id, option.id))}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
        <div className="field field-col-6">
          <label className="label">Marital status</label>
          <div className="filter-pills">
            {MARITAL_STATUS_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={'pill' + (draft.marital_status_id.includes(option.id) ? ' active' : '')}
                onClick={() => set('marital_status_id', toggleId(draft.marital_status_id, option.id))}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {departments.length > 0 && (
          <div className="field field-col-12">
            <label className="label">Departments</label>
            <div className="filter-pills">
              {departments.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={'pill' + (draft.department_id.includes(option.id) ? ' active' : '')}
                  onClick={() => set('department_id', toggleId(draft.department_id, option.id))}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleClear}>
          Clear
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onApply(toFilters(draft))}>
          Apply Filters
        </button>
      </div>
    </div>
  );
}
