import { useEffect, useState } from 'react';

export type Route = 'welcome' | 'register' | 'directory';

export function Logo({ size = 52 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="lg-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f0cd6a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0a1628" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lg-gold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f0cd6a" />
          <stop offset="100%" stopColor="#d4a017" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lg-glow)" />
      <circle cx="32" cy="36" r="14" fill="none" stroke="#d4a017" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="32" cy="36" rx="6" ry="14" fill="none" stroke="#d4a017" strokeWidth="0.6" opacity="0.4" />
      <line x1="18" y1="36" x2="46" y2="36" stroke="#d4a017" strokeWidth="0.6" opacity="0.4" />
      <path d="M16 24 Q22 20 28 22 Q26 18 30 16 Q34 18 32 22 Q40 22 44 28 L40 30 L36 27 Q34 31 30 32 Q24 33 18 30 Z" fill="url(#lg-gold)" opacity="0.85" />
      <circle cx="29" cy="20" r="0.8" fill="#0a1628" />
      <rect x="30.5" y="30" width="3" height="20" fill="url(#lg-gold)" />
      <rect x="26" y="34" width="12" height="3" fill="url(#lg-gold)" />
      <path d="M14 50 Q14 46 18 46 L46 46 Q50 46 50 50 Q50 54 46 54 L18 54 Q14 54 14 50 Z" fill="#0a1628" stroke="#d4a017" strokeWidth="0.8" />
      <line x1="20" y1="50" x2="40" y2="50" stroke="#d4a017" strokeWidth="0.6" opacity="0.7" />
    </svg>
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
  route: Route;
  setRoute: (r: Route) => void;
  showTabs?: boolean;
}

export function AppHeader({ route, setRoute, showTabs = true }: AppHeaderProps) {
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
          {showTabs && (
            <nav className="nav-tabs">
              <button className={'nav-tab' + (route === 'register' ? ' active' : '')} onClick={() => setRoute('register')}>
                Register
              </button>
              <button className={'nav-tab' + (route === 'directory' ? ' active' : '')} onClick={() => setRoute('directory')}>
                Directory
              </button>
            </nav>
          )}
        </div>

        <Clock />
      </div>
    </header>
  );
}
