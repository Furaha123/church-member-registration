import { useCallback, useEffect, useState } from 'react';
import {
  getFamilies,
  createFamily,
  updateFamily,
  deleteFamily,
  addFamilyMember,
  removeFamilyMember,
} from '../api/families';
import type { Family, FamilyPayload, AddFamilyMemberPayload } from '../types/family';

interface UseFamiliesReturn {
  families: Family[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addFamily: (data: FamilyPayload) => Promise<Family>;
  editFamily: (id: number, data: FamilyPayload) => Promise<Family>;
  removeFamily: (id: number) => Promise<void>;
  attachMember: (familyId: number, data: AddFamilyMemberPayload) => Promise<Family>;
  detachMember: (familyId: number, memberId: number) => Promise<void>;
}

export function useFamilies(enabled: boolean = true): UseFamiliesReturn {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setFamilies(await getFamilies());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load families.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  const addFamily = useCallback(async (data: FamilyPayload): Promise<Family> => {
    const created = await createFamily(data);
    setFamilies((prev) => [created, ...prev]);
    return created;
  }, []);

  const editFamily = useCallback(async (id: number, data: FamilyPayload): Promise<Family> => {
    const updated = await updateFamily(id, data);
    setFamilies((prev) => prev.map((f) => (f.id === id ? updated : f)));
    return updated;
  }, []);

  const removeFamily = useCallback(async (id: number): Promise<void> => {
    await deleteFamily(id);
    setFamilies((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const attachMember = useCallback(
    async (familyId: number, data: AddFamilyMemberPayload): Promise<Family> => {
      const updated = await addFamilyMember(familyId, data);
      setFamilies((prev) => prev.map((f) => (f.id === familyId ? updated : f)));
      return updated;
    },
    [],
  );

  const detachMember = useCallback(async (familyId: number, memberId: number): Promise<void> => {
    await removeFamilyMember(familyId, memberId);
    setFamilies((prev) =>
      prev.map((f) =>
        f.id === familyId
          ? { ...f, members: f.members.filter((m) => m.member_id !== memberId) }
          : f,
      ),
    );
  }, []);

  return {
    families,
    loading,
    error,
    refresh,
    addFamily,
    editFamily,
    removeFamily,
    attachMember,
    detachMember,
  };
}
