import { useCallback, useEffect, useState } from 'react';
import {
  getFamilies,
  createFamily,
  updateFamily,
  deleteFamily,
  addFamilyMember,
  removeFamilyMember,
} from '../api/families';
import { notifySuccess, notifyError } from '../notify';
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
    try {
      const created = await createFamily(data);
      setFamilies((prev) => [created, ...prev]);
      notifySuccess('Family created.');
      return created;
    } catch (err) {
      notifyError(err, 'Failed to create family.');
      throw err;
    }
  }, []);

  const editFamily = useCallback(async (id: number, data: FamilyPayload): Promise<Family> => {
    try {
      const updated = await updateFamily(id, data);
      setFamilies((prev) => prev.map((f) => (f.id === id ? updated : f)));
      notifySuccess('Family updated.');
      return updated;
    } catch (err) {
      notifyError(err, 'Failed to update family.');
      throw err;
    }
  }, []);

  const removeFamily = useCallback(async (id: number): Promise<void> => {
    try {
      await deleteFamily(id);
      setFamilies((prev) => prev.filter((f) => f.id !== id));
      notifySuccess('Family deleted.');
    } catch (err) {
      notifyError(err, 'Failed to delete family.');
      throw err;
    }
  }, []);

  const attachMember = useCallback(
    async (familyId: number, data: AddFamilyMemberPayload): Promise<Family> => {
      try {
        const updated = await addFamilyMember(familyId, data);
        setFamilies((prev) => prev.map((f) => (f.id === familyId ? updated : f)));
        notifySuccess('Member added to family.');
        return updated;
      } catch (err) {
        notifyError(err, 'Failed to add member to family.');
        throw err;
      }
    },
    [],
  );

  const detachMember = useCallback(async (familyId: number, memberId: number): Promise<void> => {
    try {
      await removeFamilyMember(familyId, memberId);
      setFamilies((prev) =>
        prev.map((f) =>
          f.id === familyId
            ? { ...f, members: f.members.filter((m) => m.member_id !== memberId) }
            : f,
        ),
      );
      notifySuccess('Member removed from family.');
    } catch (err) {
      notifyError(err, 'Failed to remove member from family.');
      throw err;
    }
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
