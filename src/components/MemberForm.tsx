import { useState } from 'react';
import type { MemberFormData } from '../types/member';
import { Icon } from './Layout';
import {
  SEX_OPTIONS, MARITAL_OPTIONS, EDUCATION_OPTIONS,
  MINISTRY_OPTIONS, TALENT_OPTIONS, RESPONSIBILITY_OPTIONS,
  OCCUPATION_OPTIONS, GEOGRAPHY,
} from '../data/constants';

interface MemberFormProps {
  onSubmit: (data: MemberFormData) => void;
  onCancel: () => void;
}

interface FormState {
  firstName: string; lastName: string; sex: string; marital: string; dob: string;
  fatherName: string; motherName: string;
  salvation: string; baptism: string; memberSince: string;
  education: string; ministry: string; talent: string;
  mobile: string; email: string; fax: string;
  district: string; sector: string; zone: string; cell: string;
  responsibility: string;
  occupation: string; employed: string;
  notes: string;
}

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Spiritual' },
  { id: 3, label: 'Contact' },
  { id: 4, label: 'Vocation' },
];

function genId(): string {
  return 'EV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
}

function Stepper({ current, setStep }: { current: number; setStep: (n: number) => void }) {
  return (
    <div className="stepper">
      {STEPS.map(s => {
        const cls = s.id === current ? 'active' : s.id < current ? 'done' : '';
        return (
          <div key={s.id} className={'step ' + cls} onClick={() => setStep(s.id)}>
            <div className="step-dot">
              {s.id < current ? <Icon name="check" size={18} /> : String(s.id).padStart(2, '0')}
            </div>
            <div className="step-label">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-title">
      <span className="ornament">✦</span>
      <h3>{children}</h3>
      <span className="ornament">✦</span>
    </div>
  );
}

function Field({ label, required, hint, span = 6, children }: {
  label: string; required?: boolean; hint?: string; span?: number; children: React.ReactNode;
}) {
  return (
    <div className={'field field-col-' + span}>
      <label className="label">
        {label}
        {required && <span className="req">*</span>}
        {hint && <span className="hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Inp({ value, onChange, type = 'text', placeholder, readOnly }: {
  value: string; onChange?: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <input
      className={'input' + (readOnly ? ' readonly' : '')}
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  );
}

function Sel({ value, onChange, options, placeholder = 'Select…' }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <select className="select" value={value} onChange={e => onChange(e.target.value)}>
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Step1({ form, update }: { form: FormState; update: (k: keyof FormState, v: string) => void }) {
  return (
    <>
      <SectionTitle>Personal Information</SectionTitle>
      <div className="form-grid">
        <div className="field field-col-4">
          <label className="label">Member Photograph</label>
          <div className="photo-upload">
            <div className="photo-frame">
              <div className="placeholder">Drop<br />Photo<br />Here</div>
            </div>
            <div className="photo-actions">
              <button className="btn btn-outline btn-sm"><Icon name="upload" size={12} /> Upload</button>
              <div className="hint">JPG or PNG · square crop preferred · max 4 MB</div>
            </div>
          </div>
        </div>

        <div className="field field-col-8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <label className="label">Member ID <span className="hint">auto</span></label>
            <Inp value={form.firstName ? genId() : '—'} readOnly />
          </div>
          <div className="field">
            <label className="label">First Name <span className="req">*</span></label>
            <Inp value={form.firstName} onChange={v => update('firstName', v)} />
          </div>
          <div className="field">
            <label className="label">Last Name <span className="req">*</span></label>
            <Inp value={form.lastName} onChange={v => update('lastName', v)} />
          </div>
        </div>

        <Field label="Sex" required span={4}>
          <Sel value={form.sex} onChange={v => update('sex', v)} options={SEX_OPTIONS} />
        </Field>
        <Field label="Marital Status" required span={4}>
          <Sel value={form.marital} onChange={v => update('marital', v)} options={MARITAL_OPTIONS} />
        </Field>
        <Field label="Date of Birth" required span={4}>
          <Inp type="date" value={form.dob} onChange={v => update('dob', v)} />
        </Field>
        <Field label="Father's Name" span={6}>
          <Inp value={form.fatherName} onChange={v => update('fatherName', v)} />
        </Field>
        <Field label="Mother's Name" span={6}>
          <Inp value={form.motherName} onChange={v => update('motherName', v)} />
        </Field>
      </div>
    </>
  );
}

function Step2({ form, update }: { form: FormState; update: (k: keyof FormState, v: string) => void }) {
  return (
    <>
      <SectionTitle>Spiritual Walk</SectionTitle>
      <div className="form-grid">
        <Field label="Date of Salvation" required span={4}>
          <Inp type="date" value={form.salvation} onChange={v => update('salvation', v)} />
        </Field>
        <Field label="Date of Baptism" span={4}>
          <Inp type="date" value={form.baptism} onChange={v => update('baptism', v)} />
        </Field>
        <Field label="Member Since" required span={4}>
          <Inp type="date" value={form.memberSince} onChange={v => update('memberSince', v)} />
        </Field>
        <Field label="Education" span={6}>
          <Sel value={form.education} onChange={v => update('education', v)} options={EDUCATION_OPTIONS} />
        </Field>
        <Field label="Ministry" span={6}>
          <Sel value={form.ministry} onChange={v => update('ministry', v)} options={MINISTRY_OPTIONS} />
        </Field>
        <Field label="Talent / Gift" hint="primary calling" span={12}>
          <Sel value={form.talent} onChange={v => update('talent', v)} options={TALENT_OPTIONS} />
        </Field>
      </div>
    </>
  );
}

function Step3({ form, update }: { form: FormState; update: (k: keyof FormState, v: string) => void }) {
  const districts = Object.keys(GEOGRAPHY);
  const sectors = form.district ? Object.keys(GEOGRAPHY[form.district] ?? {}) : [];
  const zones = form.district && form.sector ? Object.keys(GEOGRAPHY[form.district]?.[form.sector] ?? {}) : [];
  const cells = form.district && form.sector && form.zone ? (GEOGRAPHY[form.district]?.[form.sector]?.[form.zone] ?? []) : [];

  return (
    <>
      <SectionTitle>Contact &amp; Location</SectionTitle>
      <div className="form-grid">
        <Field label="Mobile Telephone" required span={4}>
          <div className="input-with-icon">
            <span className="ico"><Icon name="phone" size={14} /></span>
            <Inp value={form.mobile} onChange={v => update('mobile', v)} placeholder="+250 …" />
          </div>
        </Field>
        <Field label="E-mail Address" span={5}>
          <div className="input-with-icon">
            <span className="ico"><Icon name="mail" size={14} /></span>
            <Inp type="email" value={form.email} onChange={v => update('email', v)} />
          </div>
        </Field>
        <Field label="Fax Number" span={3}>
          <Inp value={form.fax} onChange={v => update('fax', v)} placeholder="optional" />
        </Field>

        <div className="field field-col-12"><SectionTitle>Residential Geography</SectionTitle></div>

        <Field label="District" required span={3}>
          <Sel value={form.district} onChange={v => { update('district', v); update('sector', ''); update('zone', ''); update('cell', ''); }} options={districts} />
        </Field>
        <Field label="Sector" span={3}>
          <Sel value={form.sector} onChange={v => { update('sector', v); update('zone', ''); update('cell', ''); }}
            options={sectors} placeholder={form.district ? 'Select sector' : 'Select district first'} />
        </Field>
        <Field label="Zone" span={3}>
          <Sel value={form.zone} onChange={v => { update('zone', v); update('cell', ''); }}
            options={zones} placeholder={form.sector ? 'Select zone' : '—'} />
        </Field>
        <Field label="Cell" span={3}>
          <Sel value={form.cell} onChange={v => update('cell', v)}
            options={cells} placeholder={form.zone ? 'Select cell' : '—'} />
        </Field>

        <Field label="Church Responsibility" span={12}>
          <Sel value={form.responsibility} onChange={v => update('responsibility', v)} options={RESPONSIBILITY_OPTIONS} />
        </Field>
      </div>
    </>
  );
}

function Step4({ form, update, memberId }: { form: FormState; update: (k: keyof FormState, v: string) => void; memberId: string }) {
  return (
    <>
      <SectionTitle>Vocation &amp; Service</SectionTitle>
      <div className="form-grid">
        <Field label="Occupation" required span={6}>
          <Sel value={form.occupation} onChange={v => update('occupation', v)} options={OCCUPATION_OPTIONS} />
        </Field>
        <Field label="Currently Employed" required span={6}>
          <Sel value={form.employed} onChange={v => update('employed', v)} options={['Yes', 'No']} />
        </Field>

        <div className="field field-col-12" style={{ marginTop: 12 }}>
          <SectionTitle>Review &amp; Confirm</SectionTitle>
        </div>
        <div className="field field-col-12">
          <div style={{ background: 'rgba(212,160,23,0.04)', border: '1px solid var(--line)', borderRadius: 6, padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px 32px' }}>
            {[
              ['Member ID', memberId],
              ['Full Name', `${form.firstName || '—'} ${form.lastName || ''}`],
              ['Date of Birth', form.dob || '—'],
              ['Member Since', form.memberSince || '—'],
              ['Ministry', form.ministry || '—'],
              ['Responsibility', form.responsibility || '—'],
              ['Mobile', form.mobile || '—'],
              ['Cell', `${form.cell || '—'}, ${form.sector || ''}`],
              ['Occupation', form.occupation || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--cream-faint)' }}>{k}</div>
                <div style={{ marginTop: 6, fontSize: 14, color: 'var(--cream)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="field field-col-12">
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--cream-dim)', fontSize: 13, lineHeight: 1.7, padding: '14px 0', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--gold-500)', marginTop: 4 }} />
            <span>I confirm that the information provided is true to the best of my knowledge, and I consent to its keeping in the church members' database for the purposes of pastoral care, communication, and ministry organisation.</span>
          </label>
        </div>
      </div>
    </>
  );
}

export function MemberForm({ onSubmit, onCancel }: MemberFormProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [memberId] = useState(genId);
  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', sex: '', marital: '', dob: '',
    fatherName: '', motherName: '',
    salvation: '', baptism: '', memberSince: '',
    education: '', ministry: '', talent: '',
    mobile: '', email: '', fax: '',
    district: '', sector: '', zone: '', cell: '',
    responsibility: '',
    occupation: '', employed: '',
    notes: '',
  });

  const update = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    const data: MemberFormData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.mobile,
      dateOfBirth: form.dob,
      gender: form.sex === 'Male' ? 'male' : 'female',
      maritalStatus: (form.marital.toLowerCase() as MemberFormData['maritalStatus']),
      address: form.cell,
      city: form.sector,
      occupation: form.occupation,
      department: form.ministry,
      membershipStatus: 'active',
      baptised: !!form.baptism,
      notes: form.notes,
    };
    onSubmit(data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ width: 80, height: 80, margin: '0 auto 24px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg,var(--gold-400),var(--gold-500))', color: 'var(--navy-900)', boxShadow: '0 0 0 6px rgba(212,160,23,0.15)' }}>
          <Icon name="check" size={40} />
        </div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Welcome to the Family</div>
        <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 32, margin: '0 0 16px', color: 'var(--cream)', fontWeight: 500 }}>
          {form.firstName} {form.lastName} has been enrolled.
        </h2>
        <p style={{ maxWidth: '54ch', margin: '0 auto 28px', color: 'var(--cream-dim)', lineHeight: 1.7 }}>
          Member <strong style={{ color: 'var(--gold-300)', fontFamily: 'Cinzel,serif' }}>{memberId}</strong> has been added to the church register.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={onCancel}>Register Another</button>
          <button className="btn btn-primary" onClick={onCancel}>
            View Directory <Icon name="arrow" size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="eyebrow">Step {step} of 4 · New Member</div>
          <h2 className="card-title">Register a Brother or Sister</h2>
          <div className="card-sub">
            All fields marked <span style={{ color: 'var(--gold-400)' }}>*</span> are required for the church register.
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Today's Entry</div>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 18, color: 'var(--gold-300)', letterSpacing: '0.12em' }}>{memberId}</div>
        </div>
      </div>

      <Stepper current={step} setStep={setStep} />

      {step === 1 && <Step1 form={form} update={update} />}
      {step === 2 && <Step2 form={form} update={update} />}
      {step === 3 && <Step3 form={form} update={update} />}
      {step === 4 && <Step4 form={form} update={update} memberId={memberId} />}

      <div className="form-nav">
        <button className="btn btn-outline" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
          {step === 1 ? 'Cancel' : '← Previous'}
        </button>
        <div className="meta">{form.firstName} {form.lastName} · {memberId}</div>
        <button className="btn btn-primary" onClick={step === 4 ? handleSubmit : () => setStep(step + 1)}>
          {step === 4 ? <>Submit Registration <Icon name="check" size={14} /></> : <>Next Step <Icon name="arrow" size={14} /></>}
        </button>
      </div>
    </div>
  );
}
