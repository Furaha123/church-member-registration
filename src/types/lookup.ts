// Shapes returned by the backend's simple lookup resources
// (OccupationResource, TalentResource, SpiritualGiftResource, EducationResource,
// FacultyResource, DepartmentResource, ChurchResponsibilityResource) — all of
// which are just { id, name }.
export interface NamedLookup {
  id: number;
  name: string;
}

// Geographic lookups additionally carry their parent id.
export interface DistrictLookup extends NamedLookup {
  province_id: number;
}

export interface SectorLookup extends NamedLookup {
  district_id: number;
}

export interface CelluleLookup extends NamedLookup {
  sector_id: number;
}

export interface VillageLookup extends NamedLookup {
  cellule_id: number;
}
