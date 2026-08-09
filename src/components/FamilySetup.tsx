import type { Member } from '../types/member';
import type { FamilyMemberInput, RoleType } from '../types/family';
import { SEX_OPTIONS } from '../data/constants';
import { createFamily } from '../api/families';
import { FamilyForm } from './FamilyForm';

interface FamilySetupProps {
  member: Member;
  members: Member[];
  onDone: (memberId: number) => void;
}

// The just-registered member is seeded into the new family with a role derived
// from their sex; the admin can change it and add existing members as the rest
// of the household.
function inferRole(member: Member): RoleType {
  const sex = SEX_OPTIONS.find((option) => option.id === member.sex_id)?.name;
  if (sex === 'MALE') return 'father';
  if (sex === 'FEMALE') return 'mother';
  return 'guardian';
}

export function FamilySetup({ member, members, onDone }: FamilySetupProps) {
  const seedMembers: FamilyMemberInput[] = [{ member_id: member.id, role_type: inferRole(member) }];

  return (
    <>
      <div className="state-banner info" style={{ marginBottom: 12 }}>
        <strong>{member.first_name} {member.last_name} is registered.</strong> They're married, so you can set up
        their family now — add a spouse and children from existing members, adjust roles, then save. You can also
        skip and do this later from the Families tab.
      </div>

      <FamilyForm
        members={members}
        seedName={`${member.last_name} Family`}
        seedMembers={seedMembers}
        onSubmit={createFamily}
        onSuccess={() => onDone(member.id)}
        onCancel={() => onDone(member.id)}
      />
    </>
  );
}
