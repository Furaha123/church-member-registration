import { useState } from 'react';
import { Logo, Icon } from './Layout';
import { forgotPassword } from '../api/auth';
import { ApiError } from '../api/client';

interface ForcePasswordChangeProps {
  email: string;
  onLogout: () => void;
}

// Blocking screen shown to users still on an admin-issued temporary password
// (must_change_password). Setting a new password requires the token emailed by
// POST /password/forgot -> the /reset-password link -> POST /password/reset, so
// this screen's job is to send that email and keep the app locked until it's done.
export function ForcePasswordChange({ email, onLogout }: ForcePasswordChangeProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function requestResetLink(): Promise<void> {
    setStatus('sending');
    setMessage(null);
    try {
      await forgotPassword(email);
      setStatus('sent');
      setMessage(`We've sent a secure link to ${email}. Open it to choose a new password.`);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof ApiError ? err.message : 'Could not send the reset email. Please try again.');
    }
  }

  return (
    <div className="welcome" style={{ justifyContent: 'center' }}>
      <div className="login-panel">
        <div className="seal"><Logo size={64} /></div>

        <h2>Set your password</h2>
        <div className="sub">You're signed in with a temporary password</div>

        <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, textAlign: 'center' }}>
          For your security, you need to set your own password before continuing. We'll email a secure link to{' '}
          <strong>{email}</strong>; open it to choose a new password, then sign back in.
        </p>

        {message && (
          <div className={'state-banner ' + (status === 'error' ? 'error' : 'info')} style={{ marginTop: 16 }}>
            {message}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
          onClick={requestResetLink}
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Resend reset link' : 'Email me a reset link'}
          <Icon name="mail" size={14} />
        </button>

        <button
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
          onClick={onLogout}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
