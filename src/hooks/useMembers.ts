import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Member, MemberFormData } from '../types/member';

const STORAGE_KEY = 'church_members';

function loadFromStorage(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Member[]) : [];
  } catch (error) {
    console.warn('Failed to load members from storage:', error);
    return [];
  }
}

function saveToStorage(members: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (error) {
    console.warn('Failed to save members to storage:', error);
  }
}

interface UseMembersReturn {
  members: Member[];
  addMember: (data: MemberFormData) => Member;
  updateMember: (id: string, data: MemberFormData) => void;
  deleteMember: (id: string) => void;
  getMemberById: (id: string) => Member | undefined;
}

export function useMembers(): UseMembersReturn {
  const [members, setMembers] = useState<Member[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(members);
  }, [members]);

  const addMember = useCallback((data: MemberFormData): Member => {
    const newMember: Member = {
      ...data,
      id: uuidv4(),
      dateJoined: new Date().toISOString().split('T')[0],
    };
    setMembers((prev) => [newMember, ...prev]);
    return newMember;
  }, []);

  const updateMember = useCallback((id: string, data: MemberFormData): void => {
    setMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, ...data } : member)),
    );
  }, []);

  const deleteMember = useCallback((id: string): void => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  }, []);

  const getMemberById = useCallback(
    (id: string): Member | undefined => members.find((m) => m.id === id),
    [members],
  );

  return { members, addMember, updateMember, deleteMember, getMemberById };
}
