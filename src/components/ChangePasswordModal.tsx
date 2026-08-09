import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { Icon } from './Layout';

const MIN_PASSWORD_LENGTH = 8;

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { changePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = password === passwordConfirmation;
  const canSubmit = password.length >= MIN_PASSWORD_LENGTH && passwordsMatch && !submitting;

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await changePassword(password, passwordConfirmation);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">Account</div>
            <h2 className="card-title">Set a new password</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Replace your temporary password with one only you know.
        </p>

        <div className="form-grid">
          <div className="field field-col-12">
            <label className="label">New password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <span className="hint">At least {MIN_PASSWORD_LENGTH} characters.</span>
          </div>
          <div className="field field-col-12">
            <label className="label">Confirm new password</label>
            <input
              className="input"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
            />
            {passwordConfirmation !== '' && !passwordsMatch && (
              <span className="hint" style={{ color: 'var(--danger, #b91c1c)' }}>Passwords don't match.</span>
            )}
          </div>
        </div>

        {error && <div className="state-banner error">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button className="btn btn-outline btn-sm" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
