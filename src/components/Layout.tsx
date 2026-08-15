import { useEffect, useState } from 'react';
import { getInitialTheme, saveTheme, type Theme } from '../theme';

export type Route = 'welcome' | 'register' | 'directory' | 'profile' | 'edit' | 'families' | 'admin' | 'family-setup';

export function Logo({ size = 52 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="Eglise Vivante"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  );
}

const ICON_PATHS: Record<string, React.ReactNode> = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14m-6-7l7 7-7 7" />,
  check: <path d="M5 13l4 4L19 7" />,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" /></>,
  download: <><path d="M12 4v12M7 11l5 5 5-5" /><path d="M5 20h14" /></>,
  trash: <><path d="M4 7h16" /><path d="M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" /><path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></>,
  eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" />,
};

export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name]}
    </svg>
  );
}

export function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return (
    <div className="app-clock">
      <div className="time">{timeStr}</div>
      <div className="date">{dateStr}</div>
    </div>
  );
}

interface AppHeaderProps {
  setRoute: (r: Route) => void;
  userEmail?: string;
  onLogout?: () => void;
  currentRoute?: Route;
  isAdmin?: boolean;
}

// Backend `name` is often a role label (e.g. "Super Admin") rather than a
// person's name, so the header derives a display name from the email instead.
function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const words = local.replace(/[._-]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return email;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const NAV_ITEMS: { route: Route; label: string; adminOnly?: boolean }[] = [
  { route: 'directory', label: 'Members' },
  { route: 'families', label: 'Families' },
  { route: 'admin', label: 'Users', adminOnly: true },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
    </button>
  );
}

export function AppHeader({ setRoute, userEmail, onLogout, currentRoute, isAdmin }: AppHeaderProps) {
  const showNav = Boolean(onLogout);
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand" onClick={() => setRoute('welcome')}>
          <div className="brand-mark"><Logo size={42} /></div>
          <div className="brand-text">
            <div className="brand-name">Eglise Vivante</div>
            <div className="brand-sub">Living Church · Kigali</div>
          </div>
        </div>

        {showNav ? (
          <nav className="nav-tabs">
            {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => (
              <button
                key={item.route}
                className={'nav-tab' + (currentRoute === item.route ? ' active' : '')}
                onClick={() => setRoute(item.route)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        ) : (
          <div className="app-title">
            <span className="ornament">✦</span>
            Database of Church Members
            <span className="ornament">✦</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifySelf: 'end' }}>
          <ThemeToggle />
          {onLogout && (
            <>
              {userEmail && (
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{nameFromEmail(userEmail)}</span>
              )}
              <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
