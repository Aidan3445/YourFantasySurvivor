'use client';

import { type LeagueMember } from '~/types/leagueMembers';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/common/alertDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Button } from '~/components/common/button';
import { useState } from 'react';
import deleteMember from '~/actions/deleteMember';

interface LeaveLeagueProps {
  member?: LeagueMember;
}

export default function LeaveLeague({ member }: LeaveLeagueProps) {
  const { hash } = useParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  if (!member?.loggedIn) return null;

  const isOwner = member.role === 'Owner';

  async function handleLeaveLeague() {
    if (!member || isOwner) return;
    try {
      await deleteMember(String(hash), member.memberId);
      await queryClient.invalidateQueries({ queryKey: ['leagues'] });
      setOpen(false);
      alert('You have left the league.');
    } catch (error) {
      console.error('Error leaving league:', error);
      alert('An error occurred while leaving the league.');
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className='flex-1'
          variant='destructive'
          type='button'>
          Leave League
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Leave League</AlertDialogTitle>
        <AlertDialogDescription className='my-4'>
          {isOwner ? (
            'You must transfer ownership to another member before leaving the league.'
          ) : (
            'Are you sure you want to leave this league? This action cannot be undone.'
          )}
        </AlertDialogDescription>
        <AlertDialogFooter>
          {isOwner ? (
            <AlertDialogCancel variant='secondary'>OK</AlertDialogCancel>
          ) : (
            <>
              <form action={() => handleLeaveLeague()}>
                <Button type='submit' variant='destructive'>
                  Yes, leave
                </Button>
              </form>
              <AlertDialogCancel variant='secondary'>No, cancel</AlertDialogCancel>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
