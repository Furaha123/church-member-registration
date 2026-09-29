import { useState } from 'react';
import type { Member } from '../types/member';
import type { Family, FamilyPayload, FamilyMemberInput, RoleType } from '../types/family';
import { ROLE_TYPES } from '../types/family';
import { ApiError } from '../api/client';
import { Icon } from './Layout';
import { SearchableSelect } from './form/SearchableSelect';

interface FamilyFormProps {
  family?: Family;
  members: Member[];
  onSubmit: (data: FamilyPayload) => Promise<Family>;
  onSuccess: (family: Family) => void;
  onCancel: () => void;
  // Pre-fill values for creating a NEW family (e.g. seeded from the member who
  // was just registered). Ignored when `family` is provided (edit mode).
  seedName?: string;
  seedMembers?: FamilyMemberInput[];
}

interface FormState {
  family_name: string;
  address: string;
  date_formed: string;
  members: FamilyMemberInput[];
}

function initialState(family: Family | undefined, seedName?: string, seedMembers?: FamilyMemberInput[]): FormState {
  return {
    family_name: family?.family_name ?? seedName ?? '',
    address: family?.address ?? '',
    date_formed: family?.date_formed ?? '',
    members:
      family?.members.map((m) => ({
        member_id: m.member_id,
        role_type: m.role_type,
        start_date: m.start_date ?? undefined,
        end_date: m.end_date ?? undefined,
      })) ?? seedMembers ?? [],
  };
}

function toPayload(form: FormState): FamilyPayload {
  const payload: FamilyPayload = { family_name: form.family_name.trim() };

  if (form.address.trim()) payload.address = form.address.trim();
  if (form.date_formed) payload.date_formed = form.date_formed;

  const validMembers = form.members.filter((m) => m.member_id > 0);
  if (validMembers.length > 0) payload.members = validMembers;

  return payload;
}

function memberLabel(member: Member): string {
  return `${member.first_name} ${member.last_name} (#${member.id})`;
}

// None of these dates can be in the future (blocks things like a 2027 date),
// and a member's end date in the family can't be before their start date.
const TODAY_ISO = new Date().toISOString().slice(0, 10);

function isNotFuture(date: string | undefined): boolean {
  return !date || date <= TODAY_ISO;
}

function isRowValid(row: FamilyMemberInput): boolean {
  if (!isNotFuture(row.start_date) || !isNotFuture(row.end_date)) return false;
  if (row.start_date && row.end_date && row.end_date < row.start_date) return false;
  return true;
}

export function FamilyForm({ family, members, onSubmit, onSuccess, onCancel, seedName, seedMembers }: FamilyFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(family, seedName, seedMembers));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEditing = Boolean(family);
  const dateFormedValid = isNotFuture(form.date_formed);
  const membersValid = form.members.every(isRowValid);
  const canSubmit = form.family_name.trim().length > 0 && dateFormedValid && membersValid && !submitting;

  function updateMember(index: number, patch: Partial<FamilyMemberInput>): void {
    setForm((prev) => ({
      ...prev,
      members: prev.members.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  }

  function addMemberRow(): void {
    setForm((prev) => ({
      ...prev,
      members: [...prev.members, { member_id: 0, role_type: 'child' }],
    }));
  }

  function removeMemberRow(index: number): void {
    setForm((prev) => ({ ...prev, members: prev.members.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) return;
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
          <div className="eyebrow">{isEditing ? 'Edit Family' : 'New Family'}</div>
          <h2 className="card-title">{isEditing ? 'Update Family' : 'Register a Family'}</h2>
          <div className="card-sub">
            Group members into a household and record the role each one plays.
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="field field-col-6">
          <label className="label">Family Name<span className="req">*</span></label>
          <input
            className="input"
            value={form.family_name}
            onChange={(e) => setForm((p) => ({ ...p, family_name: e.target.value }))}
            placeholder="The Doe Family"
          />
        </div>
        <div className="field field-col-3">
          <label className="label">Date Formed</label>
          <input
            className="input"
            type="date"
            max={TODAY_ISO}
            value={form.date_formed}
            onChange={(e) => setForm((p) => ({ ...p, date_formed: e.target.value }))}
          />
          {!dateFormedValid && (
            <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Can't be in the future.</div>
          )}
        </div>
        <div className="field field-col-12">
          <label className="label">Address</label>
          <input
            className="input"
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="KG 11 Ave, Kigali"
          />
        </div>

        <div className="field field-col-12">
          <label className="label">Members</label>
          {form.members.map((row, index) => (
            <div key={index} className="entry-card" style={{ marginBottom: 10 }}>
              <div className="entry-card-header">
                <span className="entry-card-title">Member {index + 1}</span>
                <button
                  type="button"
                  className="entry-remove"
                  onClick={() => removeMemberRow(index)}
                  aria-label={`Remove member ${index + 1}`}
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
              <div className="form-grid">
                <div className="field field-col-6">
                  <label className="label">Member</label>
                  <SearchableSelect
                    options={members.map((m) => ({ id: m.id, label: memberLabel(m) }))}
                    value={row.member_id || ''}
                    onChange={(id) => updateMember(index, { member_id: id })}
                    placeholder="Search members…"
                    emptyText="No matching members."
                  />
                </div>
                <div className="field field-col-6">
                  <label className="label">Role</label>
                  <select
                    className="select"
                    value={row.role_type}
                    onChange={(e) => updateMember(index, { role_type: e.target.value as RoleType })}
                  >
                    {ROLE_TYPES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="field field-col-6">
                  <label className="label">Start Date</label>
                  <input
                    className="input"
                    type="date"
                    max={TODAY_ISO}
                    value={row.start_date ?? ''}
                    onChange={(e) => updateMember(index, { start_date: e.target.value || undefined })}
                  />
                  {!isNotFuture(row.start_date) && (
                    <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Can't be in the future.</div>
                  )}
                </div>
                <div className="field field-col-6">
                  <label className="label">End Date</label>
                  <input
                    className="input"
                    type="date"
                    min={row.start_date || undefined}
                    max={TODAY_ISO}
                    value={row.end_date ?? ''}
                    onChange={(e) => updateMember(index, { end_date: e.target.value || undefined })}
                  />
                  {!isNotFuture(row.end_date) ? (
                    <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Can't be in the future.</div>
                  ) : (
                    row.start_date && row.end_date && row.end_date < row.start_date && (
                      <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 2 }}>Can't be before the start date.</div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="add-entry-btn" onClick={addMemberRow}>
            <Icon name="plus" size={12} /> Add Member
          </button>
        </div>

        {submitError && (
          <div className="field field-col-12">
            <div className="state-banner error">
              {submitError}
              {Object.keys(fieldErrors).length > 0 && (
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {Object.entries(fieldErrors).map(([field, messages]) => (
                    <li key={field}>{messages.join(' ')}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="form-nav">
        <button className="btn btn-outline" onClick={onCancel} disabled={submitting}>Cancel</button>
        <div className="meta">{form.family_name}</div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
          {submitting ? 'Saving…' : <>{isEditing ? 'Save Changes' : 'Create Family'} <Icon name="check" size={14} /></>}
        </button>
      </div>
    </div>
  );
}
