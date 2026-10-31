import type { RoleType } from '../types/family';

export function roleLabel(role: RoleType): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function roleTone(role: RoleType): string {
  if (role === 'father' || role === 'mother') return 'gold';
  if (role === 'guardian') return 'blue';
  return '';
}

// 'sprout' marks the family a member was born into (child); every other role
// (father/mother/guardian) heads or belongs to the family as an adult, so it
// gets the 'home' icon instead.
export function roleIcon(role: RoleType): string {
  return role === 'child' ? 'sprout' : 'home';
}
