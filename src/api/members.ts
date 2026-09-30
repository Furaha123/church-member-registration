import { apiGet, apiGetWithMeta, apiPost, apiPostForm, apiPut, apiPutForm, apiDownload, type PageMeta, type DownloadResult } from './client';
import type { Member, MemberPayload, MemberFilters } from '../types/member';

const BASE = '/members';

// Serialises MemberFilters into a Laravel-friendly query string. Arrays use the
// `key[]=1&key[]=2` convention that FilterMemberRequest's `array` rules expect;
// empty, null, and undefined values are dropped so they don't narrow the result.
function buildMemberQuery(filters: MemberFilters): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(`${key}[]`, String(item)));
      continue;
    }

    if (typeof value === 'boolean') {
      params.append(key, value ? '1' : '0');
      continue;
    }

    params.append(key, String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

// The backend list endpoint paginates (default 20 per page). The directory
// paginates on the client, so request the max page size (100) to load the full
// working set in one call. Callers can still override via filters.per_page.
const MEMBERS_PAGE_SIZE = 100;

export const getMembers = (filters: MemberFilters = {}): Promise<Member[]> =>
  apiGet(`${BASE}${buildMemberQuery({ per_page: MEMBERS_PAGE_SIZE, ...filters })}`);

export interface MembersPage {
  members: Member[];
  meta: PageMeta | null;
}

// Real server-side page fetch (as opposed to getMembers' bulk load above) —
// used by the directory table so Next/Prev actually round-trips to the
// backend for that page instead of just re-slicing an already-loaded array.
export const getMembersPage = (filters: MemberFilters): Promise<MembersPage> =>
  apiGetWithMeta<Member[]>(`${BASE}${buildMemberQuery(filters)}`).then(({ data, meta }) => ({
    members: data,
    meta,
  }));

function timestampForFilename(): string {
  // "2026-09-30T14-05-22" style, safe to use in a filename on every OS.
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// GET /members/export — same filter query params as GET /members (page/
// per_page are ignored server-side: it always returns every matching member),
// but responds with an .xlsx file instead of JSON.
export const exportMembers = (filters: MemberFilters = {}): Promise<DownloadResult> =>
  apiDownload(`${BASE}/export${buildMemberQuery(filters)}`, `members-${timestampForFilename()}.xlsx`);

export const getMember = (id: number): Promise<Member> => apiGet(`${BASE}/${id}`);

// StoreMemberRequest/UpdateMemberRequest accept plain JSON just fine when no
// file is attached (Laravel doesn't require multipart unless a real upload is
// present), so JSON is used for the common case and multipart/form-data is
// only built when the user actually attached a picture — per the backend's
// documented multipart shape: repeated fields or a JSON string for arrays,
// the literal string "true"/"false" for booleans, and education/department
// arrays-of-objects JSON-encoded (they can't be expressed as plain fields).
function buildMemberFormData(data: MemberPayload): FormData {
  const form = new FormData();

  function appendArray(key: string, values: number[] | undefined): void {
    (values ?? []).forEach((v) => form.append(`${key}[]`, String(v)));
  }

  form.append('first_name', data.first_name);
  form.append('last_name', data.last_name);
  form.append('sex_id', String(data.sex_id));
  form.append('marital_status_id', String(data.marital_status_id));
  form.append('date_birthday', data.date_birthday);
  appendArray('talent', data.talent);
  appendArray('spiritual_gift', data.spiritual_gift);

  if (data.fathers_name) form.append('fathers_name', data.fathers_name);
  if (data.mothers_name) form.append('mothers_name', data.mothers_name);
  if (data.national_id) form.append('national_id', data.national_id);
  if (data.employed !== undefined) form.append('employed', data.employed ? 'true' : 'false');
  if (data.date_salvation) form.append('date_salvation', data.date_salvation);
  if (data.date_baptism) form.append('date_baptism', data.date_baptism);
  if (data.member_since) form.append('member_since', data.member_since);
  appendArray('occupation', data.occupation);
  if (data.education && data.education.length > 0) form.append('education', JSON.stringify(data.education));
  if (data.department && data.department.length > 0) form.append('department', JSON.stringify(data.department));
  if (data.mobile_tel) form.append('mobile_tel', data.mobile_tel);
  if (data.email) form.append('email', data.email);
  if (data.province_id !== undefined) form.append('province_id', String(data.province_id));
  if (data.district_id !== undefined) form.append('district_id', String(data.district_id));
  if (data.sector_id !== undefined) form.append('sector_id', String(data.sector_id));
  if (data.cellule_id !== undefined) form.append('cellule_id', String(data.cellule_id));
  if (data.cell_id !== undefined) form.append('cell_id', String(data.cell_id));
  if (data.village_id !== undefined) form.append('village_id', String(data.village_id));
  // The backend's multipart field for the upload is named `pictureFile`, not
  // `picture` (confirmed against the live API — POST/PUT /members request a
  // pictureFile field). `picture_url` on the response is a different, output-only
  // field, so don't confuse the two.
  if (data.picture) form.append('pictureFile', data.picture);

  return form;
}

export const createMember = (data: MemberPayload): Promise<Member> =>
  data.picture ? apiPostForm(BASE, buildMemberFormData(data)) : apiPost(BASE, data);

export const updateMember = (id: number, data: MemberPayload): Promise<Member> =>
  data.picture ? apiPutForm(`${BASE}/${id}`, buildMemberFormData(data)) : apiPut(`${BASE}/${id}`, data);

// Note: there is no destroy route in routes/api.php
// (Route::apiResource('members', MemberController::class)->except('destroy')),
// so member deletion is intentionally not available from the frontend.
