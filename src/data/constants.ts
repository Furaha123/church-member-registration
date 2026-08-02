import type { NamedLookup } from '../types/lookup';

// The backend has no API endpoints for sex, marital status, or "cell" lookups
// (no SexController/MaritalStatusController/CellController exist, unlike every
// other lookup table). These three lists are hardcoded here to mirror the
// database seeders exactly (SexSeeder, MaritalStatusSeeder, CellSeeder) so the
// ids line up with what StoreMemberRequest/UpdateMemberRequest validate against
// (`exists:sex,id`, `exists:marital_status,id`, `exists:cell,id`).
//
// If the seeded data in the target database ever changes, these must be updated
// to match, or the backend should add real lookup endpoints for them.

export const SEX_OPTIONS: NamedLookup[] = [
  { id: 1, name: 'MALE' },
  { id: 2, name: 'FEMALE' },
];

export const MARITAL_STATUS_OPTIONS: NamedLookup[] = [
  { id: 1, name: 'SINGLE' },
  { id: 2, name: 'MARRIED' },
  { id: 3, name: 'ENGAGED' },
  { id: 4, name: 'WIDOWED' },
  { id: 5, name: 'DIVORCED' },
];

export const CELL_OPTIONS: NamedLookup[] = [
  { id: 1, name: 'Kanombe' },
  { id: 2, name: 'Kicukiro' },
  { id: 3, name: 'Gikondo' },
  { id: 4, name: 'Rebero' },
  { id: 5, name: 'Kimironko' },
  { id: 6, name: 'Nyamirambo' },
  { id: 7, name: 'Gisozi' },
  { id: 8, name: 'Muhima' },
  { id: 9, name: 'Kibagabaga' },
];
