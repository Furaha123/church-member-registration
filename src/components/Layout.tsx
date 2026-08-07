import { useEffect, useState } from 'react';

export type Route = 'welcome' | 'register' | 'directory' | 'profile' | 'edit';

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
  userName?: string;
  onLogout?: () => void;
}

export function AppHeader({ setRoute, userName, onLogout }: AppHeaderProps) {
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

        <div className="app-title">
          <span className="ornament">✦</span>
          Database of Church Members
          <span className="ornament">✦</span>
        </div>

        {onLogout && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'end' }}>
            {userName && <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>{userName}</span>}
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
          </div>
        )}

      </div>
    </header>
  );
}
