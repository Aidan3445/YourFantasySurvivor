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
import { useRouter } from 'next/navigation';
import leaveLeague from '~/actions/leaveLeague';

interface LeaveLeagueProps {
  member?: LeagueMember;
}

export default function LeaveLeague({ member }: LeaveLeagueProps) {
  const router = useRouter();
  const { hash } = useParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  if (!member?.loggedIn) return null;

  const isOwner = member.role === 'Owner';

  async function handleLeaveLeague() {
    if (!member || isOwner) return;
    try {
      await leaveLeague(String(hash), member.memberId);
      await queryClient.invalidateQueries({ queryKey: ['leagues'] });
      queryClient.removeQueries({ queryKey: ['league', hash] });
      setOpen(false);
      router.push('/leagues');
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
      <AlertDialogContent className='z-100'>
        <AlertDialogTitle>Leave League</AlertDialogTitle>
        <AlertDialogDescription className='my-4'>
          {isOwner ? (
            'You must transfer ownership to another member before leaving the league.'
          ) : (
            'Are you sure you want to leave this league? This action cannot be undone.'
          )}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <div className='grid grid-cols-2 gap-2 self-end'>
            {isOwner ? (
              <AlertDialogCancel variant='secondary'>OK</AlertDialogCancel>
            ) : (
              <>
                <form action={() => handleLeaveLeague()}>
                  <Button className='w-full' type='submit'>
                    Yes, leave
                  </Button>
                </form>
                <AlertDialogCancel className='m-0'>
                  No, cancel
                </AlertDialogCancel>
              </>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
