import { useState } from 'react';
import type { NamedLookup } from '../../types/lookup';
import { Icon } from '../Layout';

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

  // Selected options aren't always visible in the (searched/scrolled) list
  // below, so they're surfaced as removable chips regardless of what's
  // currently in view — this also covers options not yet loaded by name.
  const selectedOptions = selected
    .map((id) => options.find((o) => o.id === id))
    .filter((o): o is NamedLookup => o !== undefined);

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function remove(id: number) {
    onChange(selected.filter((s) => s !== id));
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
        {selectedOptions.length > 0 && (
          <div className="checklist-selected">
            {selectedOptions.map((option) => (
              <span key={option.id} className="chip">
                {option.name}
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => remove(option.id)}
                  aria-label={`Remove ${option.name}`}
                >
                  <Icon name="close" size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
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
