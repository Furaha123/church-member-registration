import { useCallback, useEffect, useState } from 'react';
import { getMembers, createMember, updateMember } from '../api/members';
import type { Member, MemberPayload, MemberFilters } from '../types/member';

interface UseMembersReturn {
  members: Member[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addMember: (data: MemberPayload) => Promise<Member>;
  editMember: (id: number, data: MemberPayload) => Promise<Member>;
  getMemberById: (id: number) => Member | undefined;
}

const NO_FILTERS: MemberFilters = {};

export function useMembers(
  enabled: boolean = true,
  filters: MemberFilters = NO_FILTERS,
): UseMembersReturn {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialised so the effect re-runs only when the filter values actually
  // change, not on every parent render that passes a fresh object literal.
  const filtersKey = JSON.stringify(filters);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMembers(JSON.parse(filtersKey) as MemberFilters);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    // Every member endpoint sits behind auth:sanctum, so don't fire until
    // there's a signed-in session (e.g. before login, or right after logout).
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  const addMember = useCallback(async (data: MemberPayload): Promise<Member> => {
    const created = await createMember(data);
    setMembers((prev) => [created, ...prev]);
    return created;
  }, []);

  const editMember = useCallback(async (id: number, data: MemberPayload): Promise<Member> => {
    const updated = await updateMember(id, data);
    setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  }, []);

  const getMemberById = useCallback(
    (id: number): Member | undefined => members.find((m) => m.id === id),
    [members],
  );

  return { members, loading, error, refresh, addMember, editMember, getMemberById };
}
