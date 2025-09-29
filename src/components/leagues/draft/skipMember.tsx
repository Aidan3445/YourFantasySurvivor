'use client';

import { useQueryClient } from '@tanstack/react-query';
import updateDraftOrder from '~/actions/updateDraftOrder';
import { Button } from '~/components/common/button';
import { type LeagueMember } from '~/types/leagueMembers';

interface SkipMemberProps {
  hash: string;
  member: LeagueMember;
  leagueMembers: LeagueMember[];
}

export default function SkipMember({ hash, member, leagueMembers }: SkipMemberProps) {
  const queryClient = useQueryClient();

  const handleSkip = async () => {
    try {
      // push memberId back one spot in the draft order
      // find member with the next highest draft position, member.draftOrder + 1
      const memberToSwap = leagueMembers.find(m => m.draftOrder === member.draftOrder + 1);
      if (!memberToSwap) {
        alert('Cannot skip, already at the end of the draft order');
        return;
      }
      const draftOrder = leagueMembers
        .map((m) => {
          if (m.memberId === member.memberId) return { memberId: m.memberId, draftOrder: m.draftOrder + 1 };
          if (m.memberId === memberToSwap.memberId) return { memberId: m.memberId, draftOrder: m.draftOrder - 1 };
          return { memberId: m.memberId, draftOrder: m.draftOrder };
        })
        .sort((a, b) => a.draftOrder - b.draftOrder);


      await updateDraftOrder(hash, draftOrder.map(m => m.memberId));
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      alert('Successfully skipped member');
    } catch (error) {
      alert('Failed to skip member');
    }
  };

  const handleSendToBack = async () => {
    try {
      // push memberId to the back of the draft order
      const draftOrder = leagueMembers
        .filter(m => m.memberId !== member.memberId)
        .map((m, index) => ({ memberId: m.memberId, draftOrder: index }));
      draftOrder.push({ memberId: member.memberId, draftOrder: draftOrder.length });

      await updateDraftOrder(hash, draftOrder.map(m => m.memberId));
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      alert('Successfully sent member to back of the draft order');
    } catch (error) {
      alert('Failed to send member to back of the draft order');
    }
  };

  return (
    <span className='flex items-center gap-2 flex-wrap py-1 justify-end'>
      <form action={handleSkip}>
        <Button type='submit' variant='secondary' size='sm' className='w-full'>
          SKIP
        </Button>
      </form>
      <form action={handleSendToBack}>
        <Button type='submit' variant='destructive' size='sm'>
          SEND TO BACK
        </Button>
      </form>
    </span>
  );
}
