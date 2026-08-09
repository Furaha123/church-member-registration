import { useState } from 'react';
import { Logo, Icon } from './Layout';
import { resetPassword } from '../api/auth';
import { ApiError } from '../api/client';

const MIN_PASSWORD_LENGTH = 8;

interface ResetLinkParams {
  token: string;
  email: string;
}

// The reset link emailed by ResetPasswordNotification points at
// {FRONTEND_URL}/reset-password?token=...&email=..., so both values are read
// straight from the query string.
function readResetParams(): ResetLinkParams {
  const params = new URLSearchParams(window.location.search);
  return {
    token: params.get('token') ?? '',
    email: params.get('email') ?? '',
  };
}

export function ResetPassword() {
  const [{ token, email }] = useState<ResetLinkParams>(readResetParams);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const hasValidLink = token !== '' && email !== '';
  const passwordsMatch = password === passwordConfirmation;
  const canSubmit =
    hasValidLink &&
    password.length >= MIN_PASSWORD_LENGTH &&
    passwordsMatch &&
    !submitting;

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword({ email, token, password, password_confirmation: passwordConfirmation });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset your password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  }

  function goToSignIn(): void {
    window.location.href = '/';
  }

  return (
    <>
      <div className="app-bg" />
      <div className="app-shell">
        <div className="welcome" style={{ justifyContent: 'center' }}>
          <div className="login-panel">
            <div className="seal"><Logo size={64} /></div>

            {done ? (
              <>
                <h2>Password updated</h2>
                <div className="sub">You can now sign in with your new password.</div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                  onClick={goToSignIn}
                >
                  Go to Sign In
                  <Icon name="arrow" size={14} />
                </button>
              </>
            ) : (
              <>
                <h2>Set a new password</h2>
                <div className="sub">{hasValidLink ? `For ${email}` : 'Invalid or incomplete reset link'}</div>

                {!hasValidLink ? (
                  <div className="state-banner error" style={{ marginTop: 16 }}>
                    This reset link is missing its token or email. Please use the most recent link from your reset
                    email, or request a new one from the sign-in screen.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && <div className="state-banner error">{error}</div>}

                    <div className="field login-field">
                      <label className="label">New password</label>
                      <div className="input-with-icon">
                        <span className="ico"><Icon name="lock" size={16} /></span>
                        <input
                          className="input"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      <span className="hint">At least {MIN_PASSWORD_LENGTH} characters.</span>
                    </div>

                    <div className="field login-field">
                      <label className="label">Confirm new password</label>
                      <div className="input-with-icon">
                        <span className="ico"><Icon name="lock" size={16} /></span>
                        <input
                          className="input"
                          type="password"
                          placeholder="••••••••"
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      {passwordConfirmation !== '' && !passwordsMatch && (
                        <span className="hint" style={{ color: 'var(--danger, #b91c1c)' }}>
                          Passwords don't match.
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                      disabled={!canSubmit}
                    >
                      {submitting ? 'Updating…' : 'Update Password'}
                      <Icon name="check" size={14} />
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
