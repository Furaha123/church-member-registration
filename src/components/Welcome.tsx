import { Logo, Icon } from './Layout';

interface WelcomeProps {
  onEnter: () => void;
}

export function Welcome({ onEnter }: WelcomeProps) {
  return (
    <div className="welcome">
      <div className="welcome-hero">
        <div className="welcome-eyebrow">Membership Records · Est. 1997</div>
        <h1>
          Every name<br />
          inscribed in <span className="gold">grace.</span>
        </h1>
        <p className="lead">
          A sacred ledger of the brothers and sisters who walk in fellowship
          at Eglise Vivante. Maintain accurate, dignified records of every
          member — their journey, their gifts, their service.
        </p>
        <div className="scripture">
          <div className="verse">"Rejoice that your names are written in heaven."</div>
          <div className="ref">— Luke 10:20</div>
        </div>
        <div className="welcome-stats">
          <div className="stat">
            <div className="num">1,284</div>
            <div className="lbl">Active Members</div>
          </div>
          <div className="stat">
            <div className="num">47</div>
            <div className="lbl">Cells &amp; Zones</div>
          </div>
          <div className="stat">
            <div className="num">29</div>
            <div className="lbl">Years of Worship</div>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className="seal"><Logo size={64} /></div>
        <h2>Sign In</h2>
        <div className="sub">Authorised personnel only</div>

        <div className="field login-field">
          <label className="label">Steward Email</label>
          <div className="input-with-icon">
            <span className="ico"><Icon name="mail" size={16} /></span>
            <input className="input" type="email" defaultValue="registrar@evlight.rw" />
          </div>
        </div>

        <div className="field login-field">
          <label className="label">Password</label>
          <div className="input-with-icon">
            <span className="ico"><Icon name="lock" size={16} /></span>
            <input className="input" type="password" defaultValue="••••••••••" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--cream-dim)', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold-500)' }} />
            Remember this device
          </label>
          <a href="#" onClick={(e) => e.preventDefault()}
            style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-300)', fontFamily: 'Cinzel, serif', textDecoration: 'none' }}>
            Forgot?
          </a>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onEnter}>
          Enter the Sanctuary
          <Icon name="arrow" size={14} />
        </button>

        <div className="divider">Or</div>

        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={onEnter}>
          Continue as Registrar
        </button>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)', textAlign: 'center', fontSize: 11, color: 'var(--cream-faint)', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'Cinzel, serif' }}>
          Need access? Contact the church office.
        </div>
      </div>
    </div>
  );
}
