import { useState } from 'react';
import type { Member, MemberPayload, EducationEntry, DepartmentEntry } from '../types/member';
import { Icon } from './Layout';
import { useLookups } from '../hooks/useLookups';
import { useGeographyCascade } from '../hooks/useGeographyCascade';
import { SEX_OPTIONS, MARITAL_STATUS_OPTIONS, CELL_OPTIONS } from '../data/constants';
import { MultiSelectChecklist } from './form/MultiSelectChecklist';
import { AddOtherField } from './form/AddOtherField';
import { EducationEntries } from './form/EducationEntries';
import { DepartmentEntries } from './form/DepartmentEntries';
import { createTalent, createSpiritualGift, createOccupation } from '../api/lookups';
import type { NamedLookup } from '../types/lookup';
import { ApiError } from '../api/client';

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: MemberPayload) => Promise<Member>;
  onSuccess: (member: Member) => void;
  onCancel: () => void;
}

interface FormState {
  first_name: string;
  last_name: string;
  sex_id: number | '';
  marital_status_id: number | '';
  date_birthday: string;
  national_id: string;
  date_salvation: string;
  date_baptism: string;
  member_since: string;
  fathers_name: string;
  mothers_name: string;
  talent: number[];
  spiritual_gift: number[];
  occupation: number[];
  education: EducationEntry[];
  employed: '' | 'yes' | 'no';
  mobile_tel: string;
  email: string;
  province_id: number | '';
  district_id: number | '';
  sector_id: number | '';
  cellule_id: number | '';
  village_id: number | '';
  cell_id: number | '';
  department: DepartmentEntry[];
}

// Backend only enforces `string` + `max:20` on mobile_tel (Store/UpdateMemberRequest) —
// no format rule — so this is a frontend-only guard against typing plain text
// (e.g. lorem-ipsum placeholder data) into a phone number field.
const PHONE_PATTERN = /^[0-9+\-\s()]+$/;

// Basic client-side email shape check so an invalid address is caught before the
// server round-trip. The backend's `email` rule remains the source of truth.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Key dates can never be in the future, so date inputs are capped at today.
const TODAY_ISO = new Date().toISOString().slice(0, 10);

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Spiritual' },
  { id: 3, label: 'Contact' },
  { id: 4, label: 'Review' },
];

function initialFormState(member?: Member): FormState {
  return {
    first_name: member?.first_name ?? '',
    last_name: member?.last_name ?? '',
    sex_id: member?.sex_id ?? '',
    marital_status_id: member?.marital_status_id ?? '',
    date_birthday: member?.date_birthday ?? '',
    national_id: member?.national_id ?? '',
    date_salvation: member?.date_salvation ?? '',
    date_baptism: member?.date_baptism ?? '',
    member_since: member?.member_since ?? '',
    fathers_name: member?.fathers_name ?? '',
    mothers_name: member?.mothers_name ?? '',
    // These three are plain many-to-many with no pivot data, so they round-trip
    // cleanly from a loaded member.
    talent: member?.talents.map((t) => t.id) ?? [],
    spiritual_gift: member?.spiritual_gifts.map((g) => g.id) ?? [],
    occupation: member?.occupations.map((o) => o.id) ?? [],
    // Reconstructed by grouping each member's flat faculties/church_responsibilities
    // list back onto their paired education/department, using the education_id /
    // department_id that FacultyResource and ChurchResponsibilityResource now
    // expose from the pivot (see MemberFaculty / MemberChurchResponsibility).
    education: member?.educations.map((edu) => ({
      education_id: edu.id,
      faculty: member.faculties.filter((f) => f.education_id === edu.id).map((f) => f.id),
    })) ?? [],
    department: member?.departments.map((dept) => ({
      department_id: dept.id,
      church_responsibility: member.church_responsibilities
        .filter((cr) => cr.department_id === dept.id)
        .map((cr) => cr.id),
    })) ?? [],
    employed: member?.employed === true ? 'yes' : member?.employed === false ? 'no' : '',
    mobile_tel: member?.mobile_tel ?? '',
    email: member?.email ?? '',
    province_id: member?.province_id ?? '',
    district_id: member?.district_id ?? '',
    sector_id: member?.sector_id ?? '',
    cellule_id: member?.cellule_id ?? '',
    village_id: member?.village_id ?? '',
    cell_id: member?.cell_id ?? '',
  };
}

function toPayload(form: FormState): MemberPayload {
  const payload: MemberPayload = {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    sex_id: Number(form.sex_id),
    marital_status_id: Number(form.marital_status_id),
    talent: form.talent,
    spiritual_gift: form.spiritual_gift,
    date_birthday: form.date_birthday,
  };

  if (form.national_id.trim()) payload.national_id = form.national_id.trim();
  if (form.date_salvation) payload.date_salvation = form.date_salvation;
  if (form.date_baptism) payload.date_baptism = form.date_baptism;
  if (form.member_since) payload.member_since = form.member_since;
  if (form.fathers_name.trim()) payload.fathers_name = form.fathers_name.trim();
  if (form.mothers_name.trim()) payload.mothers_name = form.mothers_name.trim();
  if (form.employed) payload.employed = form.employed === 'yes';
  if (form.occupation.length > 0) payload.occupation = form.occupation;
  if (form.education.length > 0) payload.education = form.education;
  if (form.department.length > 0) payload.department = form.department;
  if (form.mobile_tel.trim()) payload.mobile_tel = form.mobile_tel.trim();
  if (form.email.trim()) payload.email = form.email.trim();
  if (form.province_id) payload.province_id = Number(form.province_id);
  if (form.district_id) payload.district_id = Number(form.district_id);
  if (form.sector_id) payload.sector_id = Number(form.sector_id);
  if (form.cellule_id) payload.cellule_id = Number(form.cellule_id);
  if (form.village_id) payload.village_id = Number(form.village_id);
  if (form.cell_id) payload.cell_id = Number(form.cell_id);

  return payload;
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

function Inp({ value, onChange, type = 'text', placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input
      className="input"
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Stepper({
  current,
  setStep,
  isComplete,
}: {
  current: number;
  setStep: (n: number) => void;
  isComplete: (id: number) => boolean;
}) {
  return (
    <div className="stepper">
      {STEPS.map((s) => {
        const done = isComplete(s.id) && s.id !== current;
        const cls = s.id === current ? 'active' : done ? 'done' : '';
        return (
          <div key={s.id} className={'step ' + cls} onClick={() => setStep(s.id)}>
            <div className="step-dot">
              {done ? <Icon name="check" size={18} /> : String(s.id).padStart(2, '0')}
            </div>
            <div className="step-label">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function MemberForm({ member, onSubmit, onSuccess, onCancel }: MemberFormProps) {
  const lookups = useLookups();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => initialFormState(member));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [agreed, setAgreed] = useState(false);

  // Lookup values the user created this session via the "not on the list?" inputs.
  // Merged into the fetched options so a freshly added item shows up (checked).
  const [extraTalents, setExtraTalents] = useState<NamedLookup[]>([]);
  const [extraGifts, setExtraGifts] = useState<NamedLookup[]>([]);
  const [extraOccupations, setExtraOccupations] = useState<NamedLookup[]>([]);

  const talentOptions = [...lookups.talents, ...extraTalents];
  const giftOptions = [...lookups.spiritualGifts, ...extraGifts];
  const occupationOptions = [...lookups.occupations, ...extraOccupations];

  const geo = useGeographyCascade(form.province_id, form.district_id, form.sector_id, form.cellule_id);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const isEditing = Boolean(member);
  const mobileValid = form.mobile_tel.trim() === '' || PHONE_PATTERN.test(form.mobile_tel.trim());
  const emailValid = form.email.trim() === '' || EMAIL_PATTERN.test(form.email.trim());
  const dobValid = form.date_birthday === '' || form.date_birthday <= TODAY_ISO;
  const requiredFilled =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    form.sex_id !== '' &&
    form.marital_status_id !== '' &&
    form.date_birthday !== '' &&
    form.talent.length > 0 &&
    form.spiritual_gift.length > 0;
  const canSubmit = requiredFilled && mobileValid && emailValid && dobValid && agreed;

  const step1Complete =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    form.sex_id !== '' &&
    form.marital_status_id !== '' &&
    form.date_birthday !== '' &&
    dobValid;
  const step2Complete = form.talent.length > 0 && form.spiritual_gift.length > 0;
  const step3Complete = step1Complete && step2Complete && emailValid && mobileValid;

  function isStepComplete(id: number): boolean {
    if (id === 1) return step1Complete;
    if (id === 2) return step2Complete;
    if (id === 3) return step3Complete;
    return false;
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});
    try {
      const saved = await onSubmit(toPayload(form));
      onSuccess(saved);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
        setFieldErrors(err.errors ?? {});
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong while saving.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="eyebrow">Step {step} of {STEPS.length} · {isEditing ? 'Edit Member' : 'New Member'}</div>
          <h2 className="card-title">{isEditing ? 'Update Member' : 'Register a New Member'}</h2>
          <div className="card-sub">
            Fields marked <span style={{ color: 'var(--gold-400)' }}>*</span> are required.
          </div>
        </div>
      </div>

      <Stepper current={step} setStep={setStep} isComplete={isStepComplete} />

      {lookups.error && (
        <div className="state-banner error">Couldn't load form options: {lookups.error}</div>
      )}

      {step === 1 && (
        <>
          <SectionTitle>Personal Information</SectionTitle>
          <div className="form-grid">
            <Field label="First Name" required span={6}>
              <Inp value={form.first_name} onChange={(v) => set('first_name', v)} />
            </Field>
            <Field label="Last Name" required span={6}>
              <Inp value={form.last_name} onChange={(v) => set('last_name', v)} />
            </Field>
            <Field label="Gender" required span={4}>
              <select
                className="select"
                value={form.sex_id}
                onChange={(e) => set('sex_id', e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="" disabled>Select…</option>
                {SEX_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </Field>
            <Field label="Marital Status" required span={4}>
              <select
                className="select"
                value={form.marital_status_id}
                onChange={(e) => set('marital_status_id', e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="" disabled>Select…</option>
                {MARITAL_STATUS_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </Field>
            <Field label="Currently Employed" span={4}>
              <select
                className="select"
                value={form.employed}
                onChange={(e) => set('employed', e.target.value as FormState['employed'])}
              >
                <option value="">—</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
            <Field label="Date of Birth" required span={4}>
              <input
                className="input"
                type="date"
                max={TODAY_ISO}
                value={form.date_birthday}
                onChange={(e) => set('date_birthday', e.target.value)}
              />
            </Field>
            <Field label="National ID" span={8}>
              <Inp value={form.national_id} onChange={(v) => set('national_id', v)} />
            </Field>
            <Field label="Father's Name" span={6}>
              <Inp value={form.fathers_name} onChange={(v) => set('fathers_name', v)} />
            </Field>
            <Field label="Mother's Name" span={6}>
              <Inp value={form.mothers_name} onChange={(v) => set('mothers_name', v)} />
            </Field>
            <Field label="Date of Salvation" span={4}>
              <input
                className="input"
                type="date"
                max={TODAY_ISO}
                value={form.date_salvation}
                onChange={(e) => set('date_salvation', e.target.value)}
              />
            </Field>
            <Field label="Date of Baptism" span={4}>
              <input
                className="input"
                type="date"
                max={TODAY_ISO}
                value={form.date_baptism}
                onChange={(e) => set('date_baptism', e.target.value)}
              />
            </Field>
            <Field label="Member Since" span={4}>
              <input
                className="input"
                type="date"
                max={TODAY_ISO}
                value={form.member_since}
                onChange={(e) => set('member_since', e.target.value)}
              />
            </Field>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <SectionTitle>Gifts, Work &amp; Education</SectionTitle>
          <div className="form-grid">
            <MultiSelectChecklist
              label="Talents"
              required
              searchable
              loading={lookups.loading}
              options={talentOptions}
              selected={form.talent}
              onChange={(ids) => set('talent', ids)}
              placeholder={`Search ${talentOptions.length} talents…`}
              emptyText="No talents defined yet."
            />
            <AddOtherField
              label="Not on the list?"
              placeholder="Add a talent that isn't listed above"
              onCreate={createTalent}
              onAdded={(created) => {
                setExtraTalents((prev) => [...prev, created]);
                set('talent', [...form.talent, created.id]);
              }}
            />

            <MultiSelectChecklist
              label="Spiritual Gifts"
              required
              searchable
              loading={lookups.loading}
              options={giftOptions}
              selected={form.spiritual_gift}
              onChange={(ids) => set('spiritual_gift', ids)}
              placeholder={`Search ${giftOptions.length} spiritual gifts…`}
              emptyText="No spiritual gifts defined yet."
            />
            <AddOtherField
              label="Not on the list?"
              placeholder="Add a spiritual gift that isn't listed above"
              onCreate={createSpiritualGift}
              onAdded={(created) => {
                setExtraGifts((prev) => [...prev, created]);
                set('spiritual_gift', [...form.spiritual_gift, created.id]);
              }}
            />

            <MultiSelectChecklist
              label="Occupations"
              searchable
              loading={lookups.loading}
              options={occupationOptions}
              selected={form.occupation}
              onChange={(ids) => set('occupation', ids)}
              placeholder={`Search ${occupationOptions.length} occupations…`}
              emptyText="No occupations defined yet."
            />
            <AddOtherField
              label="Not on the list?"
              placeholder="Add an occupation that isn't listed above"
              onCreate={createOccupation}
              onAdded={(created) => {
                setExtraOccupations((prev) => [...prev, created]);
                set('occupation', [...form.occupation, created.id]);
              }}
            />
            <div className="field field-col-12" style={{ marginTop: 8 }}>
              <SectionTitle>Education</SectionTitle>
              <EducationEntries
                educations={lookups.educations}
                entries={form.education}
                onChange={(entries) => set('education', entries)}
              />
            </div>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <SectionTitle>Contact &amp; Location</SectionTitle>
          <div className="form-grid">
            <Field label="Mobile Telephone" span={5}>
              <div className="input-with-icon">
                <span className="ico"><Icon name="phone" size={14} /></span>
                <Inp value={form.mobile_tel} onChange={(v) => set('mobile_tel', v)} placeholder="+250 …" />
              </div>
              {!mobileValid && (
                <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>
                  Numbers only — digits, spaces, and +, -, ( ) are allowed, no letters.
                </div>
              )}
            </Field>
            <Field label="E-mail Address" span={7}>
              <div className="input-with-icon">
                <span className="ico"><Icon name="mail" size={14} /></span>
                <Inp type="email" value={form.email} onChange={(v) => set('email', v)} />
              </div>
            </Field>

            <div className="field field-col-12"><SectionTitle>Address</SectionTitle></div>

            <Field label="Province" span={4}>
              <select
                className="select"
                value={form.province_id}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  setForm((f) => ({ ...f, province_id: v, district_id: '', sector_id: '', cellule_id: '', village_id: '' }));
                }}
              >
                <option value="">Select province…</option>
                {lookups.provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="District" span={4}>
              <select
                className="select"
                value={form.district_id}
                disabled={!form.province_id}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  setForm((f) => ({ ...f, district_id: v, sector_id: '', cellule_id: '', village_id: '' }));
                }}
              >
                <option value="">{form.province_id ? 'Select district…' : 'Select province first'}</option>
                {geo.districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Sector" span={4}>
              <select
                className="select"
                value={form.sector_id}
                disabled={!form.district_id}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  setForm((f) => ({ ...f, sector_id: v, cellule_id: '', village_id: '' }));
                }}
              >
                <option value="">{form.district_id ? 'Select sector…' : '—'}</option>
                {geo.sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Cellule" span={4}>
              <select
                className="select"
                value={form.cellule_id}
                disabled={!form.sector_id}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  setForm((f) => ({ ...f, cellule_id: v, village_id: '' }));
                }}
              >
                <option value="">{form.sector_id ? 'Select cellule…' : '—'}</option>
                {geo.cellules.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Village" span={4}>
              <select
                className="select"
                value={form.village_id}
                disabled={!form.cellule_id}
                onChange={(e) => set('village_id', e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">{form.cellule_id ? 'Select village…' : '—'}</option>
                {geo.villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </Field>
            <Field label="Church Cell" hint="a small home group, not the Cellule above" span={4}>
              <select
                className="select"
                value={form.cell_id}
                onChange={(e) => set('cell_id', e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">Select cell…</option>
                {CELL_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>

            <div className="field field-col-12" style={{ marginTop: 8 }}>
              <SectionTitle>Church Departments</SectionTitle>
              <DepartmentEntries
                departments={lookups.departments}
                entries={form.department}
                onChange={(entries) => set('department', entries)}
              />
            </div>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <SectionTitle>Review &amp; Confirm</SectionTitle>
          <div className="form-grid">
            <div className="field field-col-12">
              <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '22px 26px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px 28px' }}>
                {[
                  ['Full Name', `${form.first_name || '—'} ${form.last_name || ''}`],
                  ['Gender', SEX_OPTIONS.find((o) => o.id === form.sex_id)?.name ?? '—'],
                  ['Marital Status', MARITAL_STATUS_OPTIONS.find((o) => o.id === form.marital_status_id)?.name ?? '—'],
                  ['Mobile', form.mobile_tel || '—'],
                  ['Talents', String(form.talent.length)],
                  ['Spiritual Gifts', String(form.spiritual_gift.length)],
                  ['Occupations', String(form.occupation.length)],
                  ['Education', String(form.education.length)],
                  ['Departments', String(form.department.length)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cream-faint)' }}>{k}</div>
                    <div style={{ marginTop: 6, fontSize: 14, color: 'var(--cream)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {!canSubmit && (
              <div className="field field-col-12">
                <div className="state-banner info">
                  {!requiredFilled && (
                    <div>
                      First name, last name, sex, marital status, date of birth, at least one talent, and at least
                      one spiritual gift are required before this can be submitted.
                    </div>
                  )}
                  {!dobValid && <div>Date of birth can't be in the future — please pick a valid date.</div>}
                  {!emailValid && <div>The email address isn't valid (check it on the Contact step).</div>}
                  {!mobileValid && <div>The mobile number has invalid characters — numbers only (Contact step).</div>}
                  {requiredFilled && dobValid && emailValid && mobileValid && !agreed && (
                    <div>Please tick the confirmation box below to submit.</div>
                  )}
                </div>
              </div>
            )}

            {submitError && (
              <div className="field field-col-12">
                <div className="state-banner error">
                  {Object.keys(fieldErrors).length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {Object.entries(fieldErrors).map(([field, messages]) => (
                        <li key={field}>{messages.join(' ')}</li>
                      ))}
                    </ul>
                  ) : (
                    submitError
                  )}
                </div>
              </div>
            )}

            <div className="field field-col-12">
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--cream-dim)', fontSize: 13, lineHeight: 1.7, padding: '14px 0', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ accentColor: 'var(--gold-500)', marginTop: 4 }}
                />
                <span>I confirm this information is correct and agree to it being stored in the church member database.</span>
              </label>
            </div>
          </div>
        </>
      )}

      <div className="form-nav">
        <button className="btn btn-outline" onClick={step === 1 ? onCancel : () => setStep(step - 1)} disabled={submitting}>
          {step === 1 ? 'Cancel' : '← Previous'}
        </button>
        <div className="meta">{form.first_name} {form.last_name}</div>
        {step === STEPS.length ? (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? 'Saving…' : <>{isEditing ? 'Save Changes' : 'Submit Registration'} <Icon name="check" size={14} /></>}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
            Next Step <Icon name="arrow" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
