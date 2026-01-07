'use client';

import { Shield } from 'lucide-react';
import { getContrastingColor } from '@uiw/color-convert';
import { type CurrentMemberProps } from '~/components/leagues/actions/league/members/current';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from '~/components/common/alertDialog';
import ColorRow from '~/components/shared/colorRow';
import { useQueryClient } from '@tanstack/react-query';
import updateMemberRole from '~/actions/updateMemberRole';
import { useParams } from 'next/navigation';
import { Button } from '~/components/common/button';
import { useState } from 'react';
import { cn } from '~/lib/utils';

export default function AdminToggle({ member, loggedInMember }: CurrentMemberProps) {
  const { hash } = useParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const enabled = loggedInMember?.role === 'Owner' && loggedInMember?.memberId !== member.memberId;

  async function handleToggleAdmin() {
    if (!enabled) {
      alert('Only the Owner can change admin roles.');
      return;
    }

    try {
      await updateMemberRole(
        String(hash),
        member.memberId,
        member.role === 'Admin' ? 'Member' : 'Admin'
      );
      await queryClient.invalidateQueries({ queryKey: ['league', hash] });
      await queryClient.invalidateQueries({ queryKey: ['settings', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      alert(`Member ${member.displayName} is now ${member.role === 'Admin' ? 'a Member' : 'an Admin'}.`);
      setOpen(false);
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('An error occurred while updating the member role.');
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger disabled={!enabled}>
        <Shield
          className={cn('my-auto', !enabled && 'opacity-75 cursor-not-allowed text-muted-foreground')}
          color={getContrastingColor(member.color)}
          fill={member.role === 'Admin' ? getContrastingColor(member.color) : 'none'}
          size={18} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>
          {member.role === 'Admin' ? 'Demote to Member' : 'Promote to Admin'}
        </AlertDialogTitle>
        <AlertDialogDescription className='my-4'>
          Are you sure you want to {member.role === 'Admin' ? 'demote ' : 'promote '}
          <ColorRow
            className='inline w-min px-1 leading-tight my-auto'
            color={member.color}>
            {member.displayName}
          </ColorRow>{' '}
          to <b>{member.role === 'Admin' ? 'Member' : 'Admin'}</b>?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <form action={() => handleToggleAdmin()}>
            <Button type='submit'>
              Yes, {member.role === 'Admin' ? 'demote' : 'promote'}
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
