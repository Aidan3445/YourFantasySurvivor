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

export default function AdminToggle({ member }: CurrentMemberProps) {
  const { hash } = useParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function handleToggleAdmin() {
    try {
      await updateMemberRole(
        String(hash),
        member.memberId,
        member.role === 'Admin' ? 'Member' : 'Admin'
      );
      await queryClient.invalidateQueries({ queryKey: ['league', hash] });
      await queryClient.invalidateQueries({ queryKey: ['settings', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      alert(`Member ${member.displayName} is now a ${member.role === 'Admin' ? 'Member' : 'Admin'}.`);
      setOpen(false);
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('An error occurred while updating the member role.');
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Shield
          className='my-auto'
          color={getContrastingColor(member.color)}
          fill={member.role === 'Admin' ? getContrastingColor(member.color) : 'none'}
          size={14} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>
          {member.role === 'Admin' ? 'Demote to Member' : 'Promote to Admin'}
        </AlertDialogTitle>
        <AlertDialogDescription className='flex gap-1 my-4'>
          Are you sure you want to {member.role === 'Admin' ? 'demote' : 'promote'}
          <ColorRow
            className='inline w-min px-1 leading-tight my-auto'
            color={member.color}>
            {member.displayName}
          </ColorRow>
          to {member.role === 'Admin' ? 'Member' : 'Admin'}?
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
