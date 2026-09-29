import { useEffect, useRef, useState } from 'react';

export interface SearchableSelectOption {
  id: number;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: number | '';
  onChange: (id: number) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

// A single-select "type to search" combobox — used where a plain <select>
// would force scrolling through a long, unsorted list (e.g. picking one member
// out of the full directory when adding them to a family).
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  emptyText = 'No matches.',
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) ?? null;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const visible = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  function select(option: SearchableSelectOption): void {
    onChange(option.id);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        className="input"
        value={open ? query : selected?.label ?? ''}
        placeholder={selected ? selected.label : placeholder}
        disabled={disabled}
        onFocus={() => { setOpen(true); setQuery(''); }}
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && (
        <div
          className="checklist"
          style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20 }}
        >
          <div className="checklist-items" style={{ maxHeight: 240 }}>
            {visible.length === 0 ? (
              <div className="checklist-empty">{emptyText}</div>
            ) : (
              visible.map((option) => (
                <div
                  key={option.id}
                  className="checklist-item"
                  style={{ justifyContent: 'space-between' }}
                  onClick={() => select(option)}
                >
                  {option.label}
                  {option.id === value && <span style={{ color: 'var(--accent)', fontSize: 12 }}>Selected</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
