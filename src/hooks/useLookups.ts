import { useEffect, useState } from 'react';
import {
  getOccupations,
  getTalents,
  getSpiritualGifts,
  getEducations,
  getDepartments,
  getProvinces,
} from '../api/lookups';
import type { NamedLookup } from '../types/lookup';

interface UseLookupsReturn {
  occupations: NamedLookup[];
  talents: NamedLookup[];
  spiritualGifts: NamedLookup[];
  educations: NamedLookup[];
  departments: NamedLookup[];
  provinces: NamedLookup[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches the static, top-level dropdown lists used by the member form once on
 * mount. Dependent lookups (faculties by education, church responsibilities by
 * department, and the districts/sectors/cellules/villages geography chain) are
 * fetched on demand inside the form as each parent selection changes, since
 * they depend on user input rather than being fixed lists.
 */
export function useLookups(): UseLookupsReturn {
  const [occupations, setOccupations] = useState<NamedLookup[]>([]);
  const [talents, setTalents] = useState<NamedLookup[]>([]);
  const [spiritualGifts, setSpiritualGifts] = useState<NamedLookup[]>([]);
  const [educations, setEducations] = useState<NamedLookup[]>([]);
  const [departments, setDepartments] = useState<NamedLookup[]>([]);
  const [provinces, setProvinces] = useState<NamedLookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [occ, tal, gifts, edu, dept, prov] = await Promise.all([
          getOccupations(),
          getTalents(),
          getSpiritualGifts(),
          getEducations(),
          getDepartments(),
          getProvinces(),
        ]);
        if (cancelled) return;
        setOccupations(occ);
        setTalents(tal);
        setSpiritualGifts(gifts);
        setEducations(edu);
        setDepartments(dept);
        setProvinces(prov);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load form options.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { occupations, talents, spiritualGifts, educations, departments, provinces, loading, error };
}
