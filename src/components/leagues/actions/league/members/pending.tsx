'use client';

import { useState } from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/common/alertDialog';
import { Button } from '~/components/common/button';
import ColorRow from '~/components/shared/colorRow';
import admitMember from '~/actions/admitMember';
import deleteMember from '~/actions/deleteMember';
import { cn } from '~/lib/utils';
import { type PendingLeagueMember, type LeagueMember } from '~/types/leagueMembers';

interface PendingMemberProps {
  member: PendingLeagueMember;
  loggedInMember?: LeagueMember;
}

export default function PendingMember({ member, loggedInMember }: PendingMemberProps) {
  const { hash } = useParams();
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isAdmitting, setIsAdmitting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const enabled = loggedInMember?.role !== 'Member' && !isAdmitting && !isRejecting;

  async function handleAdmitMember() {
    if (!enabled) return;

    setIsAdmitting(true);
    try {
      await admitMember(String(hash), member.memberId);
      await queryClient.invalidateQueries({ queryKey: ['league', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', 'pending', hash] });
      alert(`Member ${member.displayName} has been admitted to the league.`);
    } catch (error) {
      console.error('Error admitting member:', error);
      alert('An error occurred while admitting the member.');
    } finally {
      setIsAdmitting(false);
    }
  }

  async function handleRejectMember() {
    if (!enabled) return;

    setIsRejecting(true);
    try {
      await deleteMember(String(hash), member.memberId);
      await queryClient.invalidateQueries({ queryKey: ['league', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', 'pending', hash] });
      alert(`Member ${member.displayName} has been rejected from the league.`);
      setRejectOpen(false);
    } catch (error) {
      console.error('Error rejecting member:', error);
      alert('An error occurred while rejecting the member.');
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <ColorRow className='w-full mb-1' color={member.color}>
      <span className='w-full flex items-center justify-between'>
        <p className='text-sm'>{member.displayName}</p>
        <span className='flex gap-2'>
          {/* Reject Button */}
          <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <AlertDialogTrigger asChild>
              <Button className='p-0.5! h-6 w-6' variant='outline' disabled={!enabled}>
                <UserX
                  className={cn(
                    'stroke-destructive',
                    !enabled && 'opacity-75 cursor-not-allowed text-muted-foreground'
                  )}
                  size={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Reject Member</AlertDialogTitle>
              <AlertDialogDescription className='my-4'>
                Are you sure you want to reject{' '}
                <ColorRow
                  className='inline w-min leading-tight my-auto'
                  color={member.color}>
                  {member.displayName}
                </ColorRow>
                ? They will need to request to join again.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <div className='grid grid-cols-2 gap-2'>
                  <form action={() => handleRejectMember()}>
                    <Button
                      className='w-full'
                      variant='destructive'
                      type='submit'
                      disabled={isRejecting}>
                      {isRejecting ? 'Rejecting...' : 'Yes, reject'}
                    </Button>
                  </form>
                  <AlertDialogCancel variant='secondary' className='m-0'>No, cancel</AlertDialogCancel>
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Admit Button */}
          <form action={() => handleAdmitMember()}>
            <Button className='p-0.5! h-6 w-6' variant='outline' disabled={!enabled}>
              <UserCheck
                className={cn(
                  'stroke-green-600',
                  !enabled && 'opacity-75 cursor-not-allowed text-muted-foreground'
                )}
                size={18}
              />
            </Button>
          </form>
        </span>
      </span>
    </ColorRow>
  );
}
