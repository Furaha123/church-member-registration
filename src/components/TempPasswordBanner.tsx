import { useState } from 'react';
import { forgotPassword } from '../api/auth';
import { ApiError } from '../api/client';
import { Icon } from './Layout';

interface TempPasswordBannerProps {
  email: string;
}

// Non-blocking reminder for users still on an admin-issued temporary password.
// Setting a new password happens via the emailed link (POST /password/forgot ->
// /reset-password -> POST /password/reset), so the action here sends that email
// without preventing the user from using the rest of the app.
export function TempPasswordBanner({ email }: TempPasswordBannerProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function requestResetLink(): Promise<void> {
    setStatus('sending');
    setMessage(null);
    try {
      await forgotPassword(email);
      setStatus('sent');
      setMessage(`Sent — check ${email} for a link to set a new password.`);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof ApiError ? err.message : 'Could not send the reset email. Please try again.');
    }
  }

  return (
    <div
      className={'state-banner ' + (status === 'error' ? 'error' : 'info')}
      style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', margin: '12px 0' }}
    >
      <Icon name="lock" size={15} />
      <span style={{ flex: 1, minWidth: 220 }}>
        {message ?? "You're using a temporary password. Update it to keep your account secure."}
      </span>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={requestResetLink}
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Resend link' : 'Email me a link to update it'}
        <Icon name="mail" size={13} />
      </button>
    </div>
  );
}
