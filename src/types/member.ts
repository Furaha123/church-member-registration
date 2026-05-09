export type MembershipStatus = 'active' | 'inactive' | 'visitor';
export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';
export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export interface Member {
  readonly id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  address: string;
  city: string;
  occupation: string;
  department: string;
  membershipStatus: MembershipStatus;
  baptised: boolean;
  dateJoined: string;
  notes: string;
}

export type MemberFormData = Omit<Member, 'id' | 'dateJoined'>;

export interface MemberFilters {
  search: string;
  status: MembershipStatus | 'all';
  department: string;
}
