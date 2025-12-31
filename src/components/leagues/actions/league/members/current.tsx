'use client';

import ColorRow from '~/components/shared/colorRow';
import { type LeagueMember } from '~/types/leagueMembers';
import { getContrastingColor } from '@uiw/color-convert';
import { Ban, Crown } from 'lucide-react';
import AdminToggle from '~/components/leagues/actions/league/members/adminToggle';

export interface CurrentMemberProps {
  member: LeagueMember;
  loggedInRole?: string;
}

export default function CurrentMember({ member }: CurrentMemberProps) {
  return (
    <ColorRow
      key={member.memberId}
      className='w-full mb-1'
      color={member.color}>
      <span className='w-full grid grid-cols-2'>
        <p
          className='text-sm'
          style={{ color: getContrastingColor(member.color) }}>
          {member.displayName}
        </p>
        <span className='justify-self-end flex gap-2'>
          <AdminToggle member={member} />
          <Crown
            className='my-auto'
            color={getContrastingColor(member.color)}
            fill={member.role === 'Owner' ? getContrastingColor(member.color) : 'none'}
            size={14} />
          <Ban
            className='my-auto ml-4'
            color={getContrastingColor(member.color)}
            size={14} />
        </span>
      </span>
    </ColorRow >
  );
}

