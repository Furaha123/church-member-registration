import { useState } from 'react';
import { Logo, Icon } from './Layout';
import { CELL_OPTIONS } from '../data/constants';
import { forgotPassword } from '../api/auth';
import { ApiError } from '../api/client';
import type { User } from '../types/user';

interface WelcomeProps {
  onEnter: () => void;
  onRegisterNew: () => void;
  onViewFamilies: () => void;
  onManageUsers: () => void;
  totalMembers: number;
  totalDepartments: number;
  isAuthenticated: boolean;
  user: User | null;
  onLogin: (email: string, password: string) => Promise<void>;
  loggingIn: boolean;
  loginError: string | null;
}

export function Welcome({
  onEnter,
  onRegisterNew,
  onViewFamilies,
  onManageUsers,
  totalMembers,
  totalDepartments,
  isAuthenticated,
  user,
  onLogin,
  loggingIn,
  loginError,
}: WelcomeProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch {
      // loginError from the auth context already carries the message; nothing else to do here.
    }
  }

  async function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    if (!email) {
      setForgotStatus('error');
      setForgotMessage('Enter your email above first, then click "Forgot password?".');
      return;
    }
    setForgotStatus('sending');
    setForgotMessage(null);
    try {
      await forgotPassword(email);
      setForgotStatus('sent');
      setForgotMessage('If that email has an account, a reset link is on its way.');
    } catch (err) {
      setForgotStatus('error');
      setForgotMessage(err instanceof ApiError ? err.message : 'Could not send the reset email. Please try again.');
    }
  }

  return (
    <div className="welcome">
      <div className="welcome-hero">
        <div className="welcome-eyebrow">Membership Records</div>
        <h1>
          Every name<br />
          recorded with <span className="gold">care.</span>
        </h1>
        <p className="lead">
          Keep accurate, up-to-date records of every member at Eglise Vivante —
          their contact details, ministries, and gifts.
        </p>
        <div className="scripture">
          <div className="verse">"Rejoice that your names are written in heaven."</div>
          <div className="ref">— Luke 10:20</div>
        </div>
        <div className="welcome-stats">
          <div className="stat">
            <div className="num">{totalMembers}</div>
            <div className="lbl">Members Registered</div>
          </div>
          <div className="stat">
            <div className="num">{totalDepartments}</div>
            <div className="lbl">Departments</div>
          </div>
          <div className="stat">
            <div className="num">{CELL_OPTIONS.length}</div>
            <div className="lbl">Church Cells</div>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className="seal"><Logo size={64} /></div>

        {isAuthenticated && user ? (
          <>
            <h2>Welcome back, {user.name}</h2>
            <div className="sub">Signed in as {user.email}</div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={onRegisterNew}
            >
              Register New Member
              <Icon name="plus" size={14} />
            </button>

            <button
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              onClick={onEnter}
            >
              View All Members
              <Icon name="arrow" size={14} />
            </button>

            <button
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              onClick={onViewFamilies}
            >
              Manage Families
              <Icon name="arrow" size={14} />
            </button>

            {user.role === 'admin' && (
              <button
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                onClick={onManageUsers}
              >
                User Management
                <Icon name="lock" size={14} />
              </button>
            )}
          </>
        ) : (
          <>
            <h2>Sign In</h2>
            <div className="sub">For church staff</div>

            <form onSubmit={handleSubmit}>
              {loginError && <div className="state-banner error">{loginError}</div>}

              <div className="field login-field">
                <label className="label">Email</label>
                <div className="input-with-icon">
                  <span className="ico"><Icon name="mail" size={16} /></span>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@church.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field login-field">
                <label className="label">Password</label>
                <div className="input-with-icon">
                  <span className="ico"><Icon name="lock" size={16} /></span>
                  <input
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '4px 0 20px' }}>
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
                >
                  Forgot password?
                </a>
              </div>

              {forgotMessage && (
                <div className={'state-banner ' + (forgotStatus === 'error' ? 'error' : 'info')}>
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loggingIn}
              >
                {loggingIn ? 'Signing in…' : 'Sign In'}
                <Icon name="arrow" size={14} />
              </button>
            </form>

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)', textAlign: 'center', fontSize: 13, color: 'var(--cream-faint)' }}>
              Need access? Contact the church office.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
