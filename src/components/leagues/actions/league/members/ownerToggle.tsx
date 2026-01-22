'use client';

import { Crown } from 'lucide-react';
import { type CurrentMemberProps } from '~/components/leagues/actions/league/members/current';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '~/components/common/alertDialog';
import ColorRow from '~/components/shared/colorRow';
import { useQueryClient } from '@tanstack/react-query';
import updateMemberRole from '~/actions/updateMemberRole';
import { useParams } from 'next/navigation';
import { Button } from '~/components/common/button';
import { useState } from 'react';
import { Input } from '~/components/common/input';
import { cn } from '~/lib/utils';

export default function OwnerToggle({ member, loggedInMember }: CurrentMemberProps) {
  const { hash } = useParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [iUnderstand, setIUnderstand] = useState(false);

  const enabled = loggedInMember?.role === 'Owner' && loggedInMember?.memberId !== member.memberId;

  async function handleToggleOwner() {
    if (!enabled) {
      alert('Only the current Owner can transfer ownership.');
      return;
    }

    try {
      await updateMemberRole(
        String(hash),
        member.memberId,
        member.role === 'Owner' ? 'Member' : 'Owner'
      );
      await queryClient.invalidateQueries({ queryKey: ['league', hash] });
      await queryClient.invalidateQueries({ queryKey: ['settings', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      alert(`Member ${member.displayName} is now the Owner.`);
      setOpen(false);
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('An error occurred while updating the member role.');
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger disabled={!enabled}>
        <Crown
          className={cn('my-auto', !enabled && 'opacity-75 cursor-not-allowed text-muted-foreground')}
          fill={member.role === 'Owner' ? '#000' : 'none'}
          size={18} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>
          Transfer Ownership
        </AlertDialogTitle>
        <AlertDialogDescription className='my-4'>
          Are you sure you want to make{' '}
          <ColorRow
            className='inline w-min leading-tight my-auto'
            color={member.color}>
            {member.displayName}
          </ColorRow>{' '}
          the new <b>Owner</b> of this league? This action cannot be undone.
        </AlertDialogDescription>
        <span className='flex mb-4'>
          <Input
            type='checkbox'
            id='understandOwnerToggle'
            className='mr-2 w-min h-min'
            checked={iUnderstand}
            onChange={(e) => setIUnderstand(e.target.checked)} />
          <label htmlFor='understandOwnerToggle' className='mr-4 text-xs text-muted-foreground'>
            I understand that this will transfer ownership rights to this member and
            only they will be able to undo this action.
          </label>
        </span>
        <AlertDialogFooter>
          <form action={() => handleToggleOwner()}>
            <Button type='submit' disabled={!iUnderstand}>
              Yes, {member.role === 'Owner' ? 'demote' : 'promote'}
            </Button>
          </form>
          <AlertDialogCancel>
            No, cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
