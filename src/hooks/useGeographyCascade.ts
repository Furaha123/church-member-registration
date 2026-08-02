import { useEffect, useState } from 'react';
import {
  getDistrictsForProvince,
  getSectorsForDistrict,
  getCellulesForSector,
  getVillagesForCellule,
} from '../api/lookups';
import type { DistrictLookup, SectorLookup, CelluleLookup, VillageLookup } from '../types/lookup';

interface UseGeographyCascadeReturn {
  districts: DistrictLookup[];
  sectors: SectorLookup[];
  cellules: CelluleLookup[];
  villages: VillageLookup[];
}

/**
 * Fetches each level of the province -> district -> sector -> cellule -> village
 * chain on demand as the parent selection changes. Each GET /v1/{parentId}/... call
 * only fires once its parent id is known.
 */
export function useGeographyCascade(
  provinceId: number | '',
  districtId: number | '',
  sectorId: number | '',
  celluleId: number | '',
): UseGeographyCascadeReturn {
  const [districts, setDistricts] = useState<DistrictLookup[]>([]);
  const [sectors, setSectors] = useState<SectorLookup[]>([]);
  const [cellules, setCellules] = useState<CelluleLookup[]>([]);
  const [villages, setVillages] = useState<VillageLookup[]>([]);

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    getDistrictsForProvince(provinceId)
      .then((data) => { if (!cancelled) setDistricts(data); })
      .catch(() => { if (!cancelled) setDistricts([]); });
    return () => { cancelled = true; };
  }, [provinceId]);

  useEffect(() => {
    if (!districtId) {
      setSectors([]);
      return;
    }
    let cancelled = false;
    getSectorsForDistrict(districtId)
      .then((data) => { if (!cancelled) setSectors(data); })
      .catch(() => { if (!cancelled) setSectors([]); });
    return () => { cancelled = true; };
  }, [districtId]);

  useEffect(() => {
    if (!sectorId) {
      setCellules([]);
      return;
    }
    let cancelled = false;
    getCellulesForSector(sectorId)
      .then((data) => { if (!cancelled) setCellules(data); })
      .catch(() => { if (!cancelled) setCellules([]); });
    return () => { cancelled = true; };
  }, [sectorId]);

  useEffect(() => {
    if (!celluleId) {
      setVillages([]);
      return;
    }
    let cancelled = false;
    getVillagesForCellule(celluleId)
      .then((data) => { if (!cancelled) setVillages(data); })
      .catch(() => { if (!cancelled) setVillages([]); });
    return () => { cancelled = true; };
  }, [celluleId]);

  return { districts, sectors, cellules, villages };
}
