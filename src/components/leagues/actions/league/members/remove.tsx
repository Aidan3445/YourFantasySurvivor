'use client';
import { Ban } from 'lucide-react';
import { getContrastingColor } from '@uiw/color-convert';
import { type CurrentMemberProps } from '~/components/leagues/actions/league/members/current';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '~/components/common/alertDialog';
import ColorRow from '~/components/shared/colorRow';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Button } from '~/components/common/button';
import { useState } from 'react';
import deleteMember from '~/actions/deleteMember';
import { cn } from '~/lib/utils';

export default function RemoveMember({ member, loggedInMember }: CurrentMemberProps) {
  const { hash } = useParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Owner can remove anyone except themselves, Admin can remove regular Members only
  const enabled =
    loggedInMember?.memberId !== member.memberId &&
    (loggedInMember?.role === 'Owner' || (loggedInMember?.role === 'Admin' && member.role === 'Member'));

  async function handleRemoveMember() {
    if (!enabled) {
      alert('You do not have permission to remove this member.');
      return;
    }
    try {
      await deleteMember(String(hash), member.memberId);
      await queryClient.invalidateQueries({ queryKey: ['league', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      setOpen(false);
      alert(`Member ${member.displayName} has been removed from the league.`);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('An error occurred while removing the member.');
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger disabled={!enabled}>
        <Ban
          className={cn('my-auto ml-4', !enabled && 'opacity-75 cursor-not-allowed text-muted-foreground')}
          color={getContrastingColor(member.color)}
          size={14} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Remove Member</AlertDialogTitle>
        <AlertDialogDescription className='my-4'>
          Are you sure you want to remove{' '}
          <ColorRow
            className='inline w-min px-1 leading-tight my-auto'
            color={member.color}>
            {member.displayName}
          </ColorRow>{' '}
          from this league? This action cannot be undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <form action={() => handleRemoveMember()}>
            <Button type='submit' variant='destructive'>
              Yes, remove
            </Button>
          </form>
          <AlertDialogCancel variant='secondary'>No, cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
