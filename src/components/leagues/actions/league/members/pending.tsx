'use client';

import { UserCheck } from 'lucide-react';
import ColorRow from '~/components/shared/colorRow';
import { getContrastingColor } from '@uiw/color-convert';
import { type PendingLeagueMember, type LeagueMember } from '~/types/leagueMembers';
import { cn } from '~/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import admitMember from '~/actions/admitMember';

interface PendingMemberProps {
  member: PendingLeagueMember;
  loggedInMember?: LeagueMember;
}

export default function PendingMember({ member, loggedInMember }: PendingMemberProps) {
  const { hash } = useParams();
  const queryClient = useQueryClient();
  const enabled = loggedInMember?.role !== 'Member';

  async function handleAdmitMember() {
    if (!enabled) return;

    try {
      await admitMember(String(hash), member.memberId);
      await queryClient.invalidateQueries({ queryKey: ['league', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', 'pending', hash] });
      alert(`Member ${member.displayName} has been admitted to the league.`);
    } catch (error) {
      console.error('Error admitting member:', error);
      alert('An error occurred while admitting the member.');
    }
  }

  return (
    <ColorRow className='w-full mb-1' color={member.color}>
      <span className='w-full grid grid-cols-2'>
        <p
          className='text-sm'
          style={{ color: getContrastingColor(member.color) }}>
          {member.displayName}
        </p>
        <form className='justify-self-end flex gap-2' action={() => handleAdmitMember()}>
          <button
            className='bg-transparent border-0 p-0 cursor-pointer disabled:cursor-not-allowed'
            disabled={!enabled}>
            <UserCheck
              className={cn('my-auto', !enabled && 'opacity-75 cursor-not-allowed text-muted-foreground')}
              color={enabled ? getContrastingColor(member.color) : undefined}
              size={18}
            />
          </button>
        </form>
      </span>
    </ColorRow>
  );
}
