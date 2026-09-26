import { apiGet, apiPost } from './client';
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

// ── Create a lookup value the user couldn't find in the list ─────────────────
// Each returns the newly created { id, name } so it can be selected immediately.
// Requires the matching backend endpoints (POST of the GET routes above).
export const createTalent = (name: string): Promise<NamedLookup> =>
  apiPost('/members/talents', { name });
export const createSpiritualGift = (name: string): Promise<NamedLookup> =>
  apiPost('/members/spiritual-gifts', { name });
export const createOccupation = (name: string): Promise<NamedLookup> =>
  apiPost('/members/occupations', { name });
export const createFacultyForEducation = (educationId: number, name: string): Promise<NamedLookup> =>
  apiPost(`/members/educations/${educationId}/faculties`, { name });

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
