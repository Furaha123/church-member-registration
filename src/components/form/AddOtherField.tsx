import { useState } from 'react';
import type { NamedLookup } from '../../types/lookup';
import { ApiError } from '../../api/client';
import { Icon } from '../Layout';

interface AddOtherFieldProps {
  label: string;
  placeholder: string;
  onCreate: (name: string) => Promise<NamedLookup>;
  onAdded: (created: NamedLookup) => void;
  disabled?: boolean;
  disabledHint?: string;
}

// A small "not in the list?" input + Add button. On Add it creates the value via
// the provided endpoint, hands the created { id, name } back to the parent (which
// selects it), and clears the field. Reused for talents, gifts, occupations, and
// faculties.
export function AddOtherField({ label, placeholder, onCreate, onAdded, disabled, disabledHint }: AddOtherFieldProps) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = value.trim();
  const canAdd = trimmed.length > 0 && !submitting && !disabled;

  async function handleAdd(): Promise<void> {
    if (!canAdd) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await onCreate(trimmed);
      onAdded(created);
      setValue('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add that. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="field field-col-12">
      <label className="label">
        {label}
        {disabled && disabledHint && <span className="hint">{disabledHint}</span>}
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleAdd();
            }
          }}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={handleAdd} disabled={!canAdd}>
          {submitting ? 'Adding…' : 'Add'}
          <Icon name="plus" size={12} />
        </button>
      </div>
      {error && <span className="hint" style={{ color: 'var(--danger, #b91c1c)' }}>{error}</span>}
    </div>
  );
}
