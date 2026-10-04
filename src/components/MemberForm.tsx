import { useEffect, useRef, useState } from 'react';
import type { Member, MemberPayload, EducationEntry, DepartmentEntry } from '../types/member';
import { Icon } from './Layout';
import { useLookups } from '../hooks/useLookups';
import { useGeographyCascade } from '../hooks/useGeographyCascade';
import { SEX_OPTIONS, MARITAL_STATUS_OPTIONS, CELL_OPTIONS } from '../data/constants';
import { MultiSelectChecklist } from './form/MultiSelectChecklist';
import { EducationEntries } from './form/EducationEntries';
import { DepartmentEntries } from './form/DepartmentEntries';
import { ApiError, resolveMediaUrl } from '../api/client';
import { toDisplayLabel } from '../utils/format';

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
  is_member: 'yes' | 'no';
  attends_sunday_school: 'yes' | 'no';
  church_id: number | '';
  mobile_tel: string;
  email: string;
  province_id: number | '';
  district_id: number | '';
  sector_id: number | '';
  cellule_id: number | '';
  village_id: number | '';
  cell_id: number | '';
  department: DepartmentEntry[];
  pictureFile: File | null;
}

// The live API's FacultyResource/ChurchResponsibilityResource don't expose the
// pivot's education_id/department_id, so a returned member's flat faculties list
// can only be confidently re-paired to its education levels when there's just
// one education entry (no ambiguity). With more than one, or with no data at
// all, the entry is left empty for the registrar to re-select — see the info
// banners in steps 2 and 3.
function pairFaculties(faculties: Member['faculties'], educationId: number, singleEducation: boolean): number[] {
  const hasPivotData = faculties.some((f) => f.education_id !== null && f.education_id !== undefined);
  if (hasPivotData) {
    return faculties.filter((f) => f.education_id === educationId).map((f) => f.id);
  }
  return singleEducation ? faculties.map((f) => f.id) : [];
}

function pairResponsibilities(
  responsibilities: Member['church_responsibilities'],
  departmentId: number,
  singleDepartment: boolean,
): number[] {
  const hasPivotData = responsibilities.some((r) => r.department_id !== null && r.department_id !== undefined);
  if (hasPivotData) {
    return responsibilities.filter((r) => r.department_id === departmentId).map((r) => r.id);
  }
  return singleDepartment ? responsibilities.map((r) => r.id) : [];
}

// Backend only enforces `string` + `max:20` on mobile_tel (Store/UpdateMemberRequest) —
// no format rule — so this is a frontend-only guard against typing plain text
// (e.g. lorem-ipsum placeholder data) into a phone number field.
const PHONE_PATTERN = /^[0-9+\-\s()]+$/;

// Backend only enforces `string` + `max:20` on national_id — no format rule —
// so a Rwandan national ID's real shape (exactly 16 digits) is enforced here
// on the frontend. The input itself also strips non-digit characters as the
// user types, so this pattern is really just the final length/all-digits check.
const NATIONAL_ID_PATTERN = /^\d{16}$/;

// Basic client-side email shape check so an invalid address is caught before the
// server round-trip. The backend's `email` rule remains the source of truth.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Key dates can never be in the future, so date inputs are capped at today.
const TODAY_ISO = new Date().toISOString().slice(0, 10);

// None of these dates can be after today (blocks things like a 2027 birthday),
// and salvation/baptism/member-since can't predate the person's own birth —
// the `max` attribute on the <input> is only a soft hint some browsers ignore
// on typed/pasted input, so it's re-checked here too.
function isNotFuture(date: string): boolean {
  return date === '' || date <= TODAY_ISO;
}

// Drives whether the "Attends Sunday School?" field shows at all — the
// backend documents that field as being for members "typically under 19".
function calculateAge(dateStr: string): number | null {
  if (!dateStr) return null;
  const dob = new Date(dateStr);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

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
    // See pairFaculties/pairResponsibilities above: reliably reconstructed only
    // when there's a single education/department entry, since this API doesn't
    // return the pivot ids needed to disambiguate multiple.
    education: member?.educations.map((edu) => ({
      education_id: edu.id,
      faculty: pairFaculties(member.faculties, edu.id, member.educations.length === 1),
    })) ?? [],
    department: member?.departments.map((dept) => ({
      department_id: dept.id,
      church_responsibility: pairResponsibilities(
        member.church_responsibilities,
        dept.id,
        member.departments.length === 1,
      ),
    })) ?? [],
    employed: member?.employed === true ? 'yes' : member?.employed === false ? 'no' : '',
    // Both default the way the backend does when the field is omitted:
    // is_member defaults true (official member), attends_sunday_school false.
    is_member: member?.is_member === false ? 'no' : 'yes',
    attends_sunday_school: member?.attends_sunday_school === true ? 'yes' : 'no',
    church_id: member?.church_id ?? '',
    mobile_tel: member?.mobile_tel ?? '',
    email: member?.email ?? '',
    province_id: member?.province_id ?? '',
    district_id: member?.district_id ?? '',
    sector_id: member?.sector_id ?? '',
    cellule_id: member?.cellule_id ?? '',
    village_id: member?.village_id ?? '',
    cell_id: member?.cell_id ?? '',
    pictureFile: null,
  };
}

// True when this member has more than one education/department entry and this
// API returned no pivot data to tell their faculties/responsibilities apart —
// i.e. the pairing above had to fall back to empty rather than guessing.
function educationPairingUncertain(member?: Member): boolean {
  if (!member || member.educations.length <= 1) return false;
  return !member.faculties.some((f) => f.education_id !== null && f.education_id !== undefined);
}

function departmentPairingUncertain(member?: Member): boolean {
  if (!member || member.departments.length <= 1) return false;
  return !member.church_responsibilities.some((cr) => cr.department_id !== null && cr.department_id !== undefined);
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
  payload.is_member = form.is_member === 'yes';
  payload.attends_sunday_school = form.attends_sunday_school === 'yes';
  if (form.is_member === 'no' && form.church_id) payload.church_id = Number(form.church_id);
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
  if (form.pictureFile) payload.picture = form.pictureFile;

  return payload;
}

const MAX_PICTURE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_PICTURE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
  // Jumping backward is always allowed; jumping forward requires every step
  // in between to be complete, so users can't skip past unresolved errors.
  function canReach(id: number): boolean {
    if (id <= current) return true;
    for (let s = current; s < id; s++) {
      if (!isComplete(s)) return false;
    }
    return true;
  }

  return (
    <div className="stepper">
      {STEPS.map((s) => {
        const done = isComplete(s.id) && s.id !== current;
        const reachable = canReach(s.id);
        const cls = (s.id === current ? 'active' : done ? 'done' : '') + (reachable ? '' : ' locked');
        return (
          <div key={s.id} className={'step ' + cls} onClick={() => reachable && setStep(s.id)}>
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

  const talentOptions = lookups.talents;
  const giftOptions = lookups.spiritualGifts;
  const occupationOptions = lookups.occupations;
  const churchOptions = lookups.churches;

  const geo = useGeographyCascade(form.province_id, form.district_id, form.sector_id, form.cellule_id);

  // Local preview for the picture — either a freshly chosen file (object URL,
  // revoked on change/unmount) or the member's existing picture_url when editing.
  const [pictureError, setPictureError] = useState<string | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(resolveMediaUrl(member?.picture_url));
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function handlePictureChange(file: File | null): void {
    setPictureError(null);
    if (!file) {
      set('pictureFile', null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPicturePreview(resolveMediaUrl(member?.picture_url));
      return;
    }
    if (!ACCEPTED_PICTURE_TYPES.includes(file.type)) {
      setPictureError('Please choose a JPEG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_PICTURE_BYTES) {
      setPictureError('That image is larger than 2MB — please choose a smaller one.');
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPicturePreview(url);
    set('pictureFile', file);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const age = calculateAge(form.date_birthday);
  const showsSundaySchool = age !== null && age < 19;

  // If the date of birth changes so the person's no longer under 19, don't
  // silently keep submitting a stale "attends Sunday school" answer for a
  // field that's no longer even shown.
  useEffect(() => {
    if (!showsSundaySchool && form.attends_sunday_school === 'yes') {
      set('attends_sunday_school', 'no');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showsSundaySchool]);

  // The "which church do they belong to" field only makes sense for a
  // visitor/attendee — clear it if they're toggled back to being an official
  // member so a stale selection doesn't linger unseen.
  useEffect(() => {
    if (form.is_member === 'yes' && form.church_id !== '') {
      set('church_id', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.is_member]);

  const isEditing = Boolean(member);
  const mobileValid = form.mobile_tel.trim() === '' || PHONE_PATTERN.test(form.mobile_tel.trim());
  const emailValid = form.email.trim() === '' || EMAIL_PATTERN.test(form.email.trim());
  const nationalIdValid = form.national_id.trim() === '' || NATIONAL_ID_PATTERN.test(form.national_id.trim());
  const dobValid = isNotFuture(form.date_birthday);
  // Only "not in the future" is enforced here — these dates are allowed to
  // predate the date of birth, since a record's dates aren't always entered
  // in a perfectly consistent order and that shouldn't block saving.
  const salvationValid = isNotFuture(form.date_salvation);
  const baptismValid = isNotFuture(form.date_baptism);
  const memberSinceValid = isNotFuture(form.member_since);
  const datesValid = dobValid && salvationValid && baptismValid && memberSinceValid;
  const requiredFilled =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    form.sex_id !== '' &&
    form.marital_status_id !== '' &&
    form.date_birthday !== '' &&
    form.talent.length > 0 &&
    form.spiritual_gift.length > 0;
  const canSubmit = requiredFilled && mobileValid && emailValid && nationalIdValid && datesValid && agreed;

  const step1Complete =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    form.sex_id !== '' &&
    form.marital_status_id !== '' &&
    form.date_birthday !== '' &&
    datesValid &&
    nationalIdValid;
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
      const payload = toPayload(form);
      console.log('member payload', payload);
      const saved = await onSubmit(payload);
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
                {SEX_OPTIONS.map((o) => <option key={o.id} value={o.id}>{toDisplayLabel(o.name)}</option>)}
              </select>
            </Field>
            <Field label="Marital Status" required span={4}>
              <select
                className="select"
                value={form.marital_status_id}
                onChange={(e) => set('marital_status_id', e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="" disabled>Select…</option>
                {MARITAL_STATUS_OPTIONS.map((o) => <option key={o.id} value={o.id}>{toDisplayLabel(o.name)}</option>)}
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
              {!dobValid && (
                <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Can't be in the future.</div>
              )}
            </Field>
            <Field label="Is Church Member?" span={4} hint="No = visitor/attendee">
              <select
                className="select"
                value={form.is_member}
                onChange={(e) => set('is_member', e.target.value as FormState['is_member'])}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
            {form.is_member === 'no' && (
              <Field label="Their Church" span={4} hint="which church they belong to">
                <select
                  className="select"
                  value={form.church_id}
                  onChange={(e) => set('church_id', e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Select church…</option>
                  {churchOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            )}
            {showsSundaySchool && (
              <Field label="Attends Sunday School?" span={4}>
                <select
                  className="select"
                  value={form.attends_sunday_school}
                  onChange={(e) => set('attends_sunday_school', e.target.value as FormState['attends_sunday_school'])}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>
            )}
            <Field label="National ID" span={8} hint="16 digits">
              <input
                className="input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={16}
                value={form.national_id}
                onChange={(e) => set('national_id', e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="1199080012345678"
              />
              {!nationalIdValid && (
                <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>
                  National ID must be exactly 16 digits ({form.national_id.length}/16 so far).
                </div>
              )}
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
              {!salvationValid && (
                <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Can't be in the future.</div>
              )}
            </Field>
            <Field label="Date of Baptism" span={4}>
              <input
                className="input"
                type="date"
                max={TODAY_ISO}
                value={form.date_baptism}
                onChange={(e) => set('date_baptism', e.target.value)}
              />
              {!baptismValid && (
                <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Can't be in the future.</div>
              )}
            </Field>
            <Field label="Member Since" span={4}>
              <input
                className="input"
                type="date"
                max={TODAY_ISO}
                value={form.member_since}
                onChange={(e) => set('member_since', e.target.value)}
              />
              {!memberSinceValid && (
                <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Can't be in the future.</div>
              )}
            </Field>

            <div className="field field-col-12" style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
              <div
                className="avatar"
                style={{
                  width: 72,
                  height: 72,
                  fontSize: 22,
                  overflow: 'hidden',
                  backgroundImage: picturePreview ? `url(${picturePreview})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flex: '0 0 auto',
                }}
              >
                {!picturePreview && ((form.first_name[0] ?? '') + (form.last_name[0] ?? '')).toUpperCase()}
              </div>
              <div>
                <label className="label">Photo</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => handlePictureChange(e.target.files?.[0] ?? null)}
                  />
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()}>
                    <Icon name="upload" size={12} /> {picturePreview ? 'Change photo' : 'Upload photo'}
                  </button>
                  {picturePreview && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => handlePictureChange(null)}>
                      Remove
                    </button>
                  )}
                </div>
                <span className="hint">JPEG, PNG, or WEBP — up to 2MB.</span>
                {pictureError && (
                  <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>{pictureError}</div>
                )}
              </div>
            </div>
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
            <div className="field field-col-12" style={{ marginTop: 8 }}>
              <SectionTitle>Education</SectionTitle>
              {isEditing && educationPairingUncertain(member) && (
                <div className="state-banner info" style={{ marginBottom: 12 }}>
                  This member has multiple education levels, and the API doesn't return which field of study belongs
                  to which — please re-select the fields of study below.
                </div>
              )}
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
              {isEditing && departmentPairingUncertain(member) && (
                <div className="state-banner info" style={{ marginBottom: 12 }}>
                  This member belongs to multiple departments, and the API doesn't return which responsibility
                  belongs to which — please re-select the responsibilities below.
                </div>
              )}
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
                  ['Gender', toDisplayLabel(SEX_OPTIONS.find((o) => o.id === form.sex_id)?.name ?? '—')],
                  ['Marital Status', toDisplayLabel(MARITAL_STATUS_OPTIONS.find((o) => o.id === form.marital_status_id)?.name ?? '—')],
                  ['Church Member', form.is_member === 'yes' ? 'Yes' : 'No (visitor/attendee)'],
                  ...(form.is_member === 'no'
                    ? [['Their Church', churchOptions.find((c) => c.id === form.church_id)?.name ?? '—']]
                    : []),
                  ...(showsSundaySchool
                    ? [['Attends Sunday School', form.attends_sunday_school === 'yes' ? 'Yes' : 'No']]
                    : []),
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
                  {!salvationValid && <div>Date of salvation can't be in the future (Personal step).</div>}
                  {!baptismValid && <div>Date of baptism can't be in the future (Personal step).</div>}
                  {!memberSinceValid && <div>Member since can't be in the future (Personal step).</div>}
                  {!nationalIdValid && <div>National ID must be exactly 16 digits (Personal step).</div>}
                  {!emailValid && <div>The email address isn't valid (check it on the Contact step).</div>}
                  {!mobileValid && <div>The mobile number has invalid characters — numbers only (Contact step).</div>}
                  {requiredFilled && datesValid && nationalIdValid && emailValid && mobileValid && !agreed && (
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
          <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!isStepComplete(step)}>
            Next Step <Icon name="arrow" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
