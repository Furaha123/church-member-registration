import type { NamedLookup } from './lookup';

// ── Payload sent to POST /v1/members and PUT /v1/members/{id} ────────────────
// Mirrors StoreMemberRequest / UpdateMemberRequest in the Laravel backend.

export interface EducationEntry {
  education_id: number;
  faculty: number[];
}

export interface DepartmentEntry {
  department_id: number;
  church_responsibility: number[];
}

export interface MemberPayload {
  first_name: string;
  last_name: string;
  sex_id: number;
  marital_status_id: number;
  // Required, min 1 each, per StoreMemberRequest/UpdateMemberRequest.
  talent: number[];
  spiritual_gift: number[];
  // Required on create (StoreMemberRequest), format yyyy-mm-dd.
  date_birthday: string;

  fathers_name?: string;
  mothers_name?: string;
  national_id?: string;
  employed?: boolean;

  // Optional key dates, format yyyy-mm-dd.
  date_salvation?: string;
  date_baptism?: string;
  member_since?: string;

  occupation?: number[];
  education?: EducationEntry[];
  department?: DepartmentEntry[];

  mobile_tel?: string;
  email?: string;

  // Image file (jpeg, jpg, png, webp), max 2MB. Only present when the user
  // attached/changed a picture in the form; when set, the request is sent as
  // multipart/form-data instead of JSON (see buildMemberFormData in api/members.ts).
  picture?: File;

  province_id?: number;
  district_id?: number;
  sector_id?: number;
  cellule_id?: number;
  cell_id?: number;
  village_id?: number;
}

// ── Shape returned by MemberResource (GET /v1/members, /v1/members/{id}) ─────
// educations/departments/faculties/church_responsibilities all come back as
// flat, distinct lists on the live deployed API (confirmed against its actual
// OpenAPI schema) — FacultyResource/ChurchResponsibilityResource there do NOT
// expose an education_id/department_id pivot field. So which faculty belongs
// to which education level (and which responsibility to which department)
// can't be reconstructed from this response; education_id/department_id below
// are typed optional only in case a future backend deploy adds them, and the
// UI (MemberForm, MemberProfile) falls back to flat display when they're absent.

export interface MemberFaculty extends NamedLookup {
  education_id?: number | null;
}

export interface MemberChurchResponsibility extends NamedLookup {
  department_id?: number | null;
}

// One family this member belongs to, as reported inline on MemberResource
// (role_type is "father"/"mother"/"child" etc., matching FamilyMember).
export interface MemberFamilyMembership {
  family_id: number;
  family_name: string;
  address: string | null;
  date_formed: string | null;
  role_type: string;
  start_date: string | null;
  end_date: string | null;
}

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  talents: NamedLookup[];
  spiritual_gifts: NamedLookup[];
  email: string | null;
  mobile_tel: string | null;
  employed: boolean | null;
  fathers_name: string | null;
  mothers_name: string | null;
  national_id: string | null;
  picture_url: string | null;
  date_birthday: string | null;
  age: number | null;
  date_salvation: string | null;
  date_baptism: string | null;
  member_since: string | null;
  sex_id: number;
  marital_status_id: number;
  occupations: NamedLookup[];
  educations: NamedLookup[];
  faculties: MemberFaculty[];
  departments: NamedLookup[];
  church_responsibilities: MemberChurchResponsibility[];
  province_id: number | null;
  district_id: number | null;
  sector_id: number | null;
  cellule_id: number | null;
  cell_id: number | null;
  village_id: number | null;
  // Every family this member is linked to (as father/mother/child/etc).
  families: MemberFamilyMembership[];
  // [true, family_id] when this member is the father of a family (i.e. heads
  // one), otherwise [false, 0].
  has_family: [boolean, number];
  // [true, family_id] when this member is a child in a family (the family
  // they were born into), otherwise [false, 0].
  has_birth_family: [boolean, number];
}

// ── Query params accepted by GET /v1/members (FilterMemberRequest) ───────────
// Only the subset surfaced in the directory filter UI is modelled here; the
// backend accepts more (geography, occupations, talents, etc.) which can be
// added as the UI grows. Array fields serialise to Laravel's `key[]=1&key[]=2`.
export interface MemberFilters {
  first_name?: string;
  last_name?: string;
  national_id?: string;
  sex_id?: number[];
  marital_status_id?: number[];
  department_id?: number[];
  age_min?: number;
  age_max?: number;
  date_birthday_from?: string;
  date_birthday_to?: string;
  employed?: boolean;
  page?: number;
  per_page?: number;
}
