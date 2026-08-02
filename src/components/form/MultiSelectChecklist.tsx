import { useState } from 'react';
import type { NamedLookup } from '../../types/lookup';

interface MultiSelectChecklistProps {
  label: string;
  required?: boolean;
  options: NamedLookup[];
  selected: number[];
  onChange: (ids: number[]) => void;
  searchable?: boolean;
  loading?: boolean;
  placeholder?: string;
  emptyText?: string;
}

export function MultiSelectChecklist({
  label,
  required,
  options,
  selected,
  onChange,
  searchable,
  loading,
  placeholder = 'Search…',
  emptyText = 'No options available.',
}: MultiSelectChecklistProps) {
  const [query, setQuery] = useState('');

  const visible = searchable && query.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="field field-col-12">
      <div className="checklist-head">
        <label className="label">
          {label}
          {required && <span className="req">*</span>}
        </label>
        <span className="checklist-count">{selected.length} selected</span>
      </div>
      <div className="checklist">
        {searchable && (
          <div className="checklist-search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
            />
          </div>
        )}
        <div className="checklist-items">
          {loading ? (
            <div className="checklist-empty">Loading…</div>
          ) : visible.length === 0 ? (
            <div className="checklist-empty">{emptyText}</div>
          ) : (
            visible.map((option) => (
              <label key={option.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={selected.includes(option.id)}
                  onChange={() => toggle(option.id)}
                />
                {option.name}
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
