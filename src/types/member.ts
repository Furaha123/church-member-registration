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

  fathers_name?: string;
  mothers_name?: string;
  employed?: boolean;

  occupation?: number[];
  education?: EducationEntry[];
  department?: DepartmentEntry[];

  mobile_tel?: string;
  email?: string;

  province_id?: number;
  district_id?: number;
  sector_id?: number;
  cellule_id?: number;
  cell_id?: number;
  village_id?: number;
}

// ── Shape returned by MemberResource (GET /v1/members, /v1/members/{id}) ─────
// educations/departments come back as flat distinct lists, but faculties and
// church_responsibilities now carry the pivot's education_id/department_id
// (FacultyResource/ChurchResponsibilityResource expose it via whenPivotLoaded),
// so the original education<->faculty and department<->responsibility pairing
// can be reconstructed on the frontend by grouping on those ids.

export interface MemberFaculty extends NamedLookup {
  education_id: number | null;
}

export interface MemberChurchResponsibility extends NamedLookup {
  department_id: number | null;
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
}
