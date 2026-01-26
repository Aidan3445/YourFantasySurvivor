'use client';

import ColorRow from '~/components/shared/colorRow';
import { type LeagueMember } from '~/types/leagueMembers';
import AdminToggle from '~/components/leagues/actions/league/members/adminToggle';
import OwnerToggle from '~/components/leagues/actions/league/members/ownerToggle';
import RemoveMember from '~/components/leagues/actions/league/members/remove';

export interface CurrentMemberProps {
  member: LeagueMember;
  loggedInMember?: LeagueMember;
}

export default function CurrentMember({ member, loggedInMember }: CurrentMemberProps) {
  return (
    <ColorRow
      className='w-full'
      color={member.color}>
      <span className='w-full grid grid-cols-2'>
        <p className='text-sm'>{member.displayName}</p>
        <span className='justify-self-end flex gap-2'>
          <AdminToggle member={member} loggedInMember={loggedInMember} />
          <OwnerToggle member={member} loggedInMember={loggedInMember} />
          <RemoveMember member={member} loggedInMember={loggedInMember} />
        </span>
      </span>
    </ColorRow>
  );
}

