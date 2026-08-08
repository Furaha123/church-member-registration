// Shapes for the Family API (FamilyController + FamilyResource / FamilyMemberResource).
// Mirrors StoreFamilyRequest / UpdateFamilyRequest / AddFamilyMemberRequest and
// the App\Enums\RoleType enum in the Laravel backend.

export type RoleType = 'father' | 'mother' | 'child' | 'guardian';

export const ROLE_TYPES: readonly RoleType[] = ['father', 'mother', 'child', 'guardian'];

// One member's membership within a family, as returned by FamilyMemberResource.
export interface FamilyMember {
  member_id: number;
  first_name: string;
  last_name: string;
  role_type: RoleType;
  start_date: string | null;
  end_date: string | null;
}

// Shape returned by FamilyResource (GET /v1/families, /v1/families/{id}).
export interface Family {
  id: number;
  family_name: string;
  address: string | null;
  date_formed: string | null;
  members: FamilyMember[];
}

// One entry in the `members` array sent to POST/PUT /v1/families.
export interface FamilyMemberInput {
  member_id: number;
  role_type: RoleType;
  start_date?: string;
  end_date?: string;
}

// Payload for POST /v1/families and PUT /v1/families/{id}.
export interface FamilyPayload {
  family_name: string;
  address?: string;
  date_formed?: string;
  members?: FamilyMemberInput[];
}

// Payload for POST /v1/families/{family}/members (AddFamilyMemberRequest).
export interface AddFamilyMemberPayload {
  member_id: number;
  role_type: RoleType;
  start_date?: string;
  end_date?: string;
}
