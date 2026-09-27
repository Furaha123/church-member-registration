import { apiGet } from './client';
import type {
  NamedLookup,
  DistrictLookup,
  SectorLookup,
  CelluleLookup,
  VillageLookup,
} from '../types/lookup';

// ── Member-form dropdown data ─────────────────────────────────────────────────
// Routes are mounted under /v1/members/... in routes/api.php.

export const getOccupations = (): Promise<NamedLookup[]> => apiGet('/members/occupations');
export const getTalents = (): Promise<NamedLookup[]> => apiGet('/members/talents');
export const getSpiritualGifts = (): Promise<NamedLookup[]> => apiGet('/members/spiritual-gifts');
export const getEducations = (): Promise<NamedLookup[]> => apiGet('/members/educations');
export const getDepartments = (): Promise<NamedLookup[]> => apiGet('/members/departments');

export const getFacultiesForEducation = (educationId: number): Promise<NamedLookup[]> =>
  apiGet(`/members/educations/${educationId}/faculties`);

export const getChurchResponsibilitiesForDepartment = (departmentId: number): Promise<NamedLookup[]> =>
  apiGet(`/members/departments/${departmentId}/church-responsibilities`);

// Note: there is no way to create a new talent/spiritual gift/occupation/faculty
// from the frontend — the live API only exposes GET on these lookup routes
// (confirmed: POST returns 405 Method Not Allowed). An earlier version of this
// form had "not on the list?" inputs that called such endpoints; they were
// removed since the deployed backend doesn't support them. New lookup values
// need to be added on the backend (e.g. a seeder or an admin route) first.

// ── Geography (province -> district -> sector -> cellule -> village) ─────────
// Note the backend's route shape is flat, e.g. GET /v1/{province}/districts,
// not GET /v1/provinces/{province}/districts.

export const getProvinces = (): Promise<NamedLookup[]> => apiGet('/provinces');
export const getDistrictsForProvince = (provinceId: number): Promise<DistrictLookup[]> =>
  apiGet(`/${provinceId}/districts`);
export const getSectorsForDistrict = (districtId: number): Promise<SectorLookup[]> =>
  apiGet(`/${districtId}/sectors`);
export const getCellulesForSector = (sectorId: number): Promise<CelluleLookup[]> =>
  apiGet(`/${sectorId}/cellules`);
export const getVillagesForCellule = (celluleId: number): Promise<VillageLookup[]> =>
  apiGet(`/${celluleId}/villages`);
