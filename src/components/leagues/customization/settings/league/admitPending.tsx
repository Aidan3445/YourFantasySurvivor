'use client';

import { Button } from '~/components/common/button';
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogPortal, AlertDialogTitle
} from '~/components/common/alertDialog';
import { useEffect, useState } from 'react';
import ColorRow from '~/components/shared/colorRow';
import { getContrastingColor } from '@uiw/color-convert';
import { usePendingMembers } from '~/hooks/leagues/usePendingMembers';
import admitMember from '~/actions/admitMember';
import { useQueryClient } from '@tanstack/react-query';

interface ManagePendingMembersProps {
  hash: string;
  open: boolean;
}

export default function ManagePendingMembers({ hash, open }: ManagePendingMembersProps) {
  const queryClient = useQueryClient();
  const { data: pendingMembers } = usePendingMembers(hash);
  const [isOpen, setIsOpen] = useState(open);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  if (!pendingMembers || pendingMembers.members.length === 0) {
    return null;
  }

  const handleSubmit = async () => {
    if (selectedMembers.size === 0) {
      alert('No members selected for admission.');
      return;
    }

    try {
      const admissions = await Promise.all(
        Array.from(selectedMembers).map((memberId) => admitMember(hash, memberId))
      );
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', 'pending', hash] });
      alert(`Admitted ${admissions.length} member${admissions.length > 1 ? 's' : ''} to the league.`);
      setIsOpen(false);
    } catch (e) {
      console.error('Error admitting members:', e);
      alert('Failed to admit selected members.');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogPortal>
        <AlertDialogContent
          className='sm:w-160 w-96 flex flex-col animate-scale-in-fast'>
          <span className='flex items-center gap-3 mb-2'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
              Manage Pending Members
            </AlertDialogTitle>
          </span>
          <AlertDialogDescription className='text-base text-left'>
            Select which pending members to admit to the league:
          </AlertDialogDescription>
          <form className='space-y-2' action={() => handleSubmit()}>
            {pendingMembers?.members.map((member) => (
              <ColorRow key={member.memberId} color={member.color}>
                <input
                  type='checkbox'
                  id={`member-${member.memberId}`}
                  className='h-4 w-4'
                  onChange={(e) => {
                    const newSelectedMembers = new Set(selectedMembers);
                    if (e.target.checked) {
                      newSelectedMembers.add(member.memberId);
                    } else {
                      newSelectedMembers.delete(member.memberId);
                    }
                    setSelectedMembers(newSelectedMembers);
                  }}
                />
                <label
                  htmlFor={`member-${member.memberId}`}
                  className='text-sm'
                  style={{ color: getContrastingColor(member.color) }}>
                  {member.displayName} {member.memberId}
                </label>
              </ColorRow>
            ))}
            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => setIsOpen(false)}>
                Admit Later
              </Button>
              <Button type='submit' disabled={selectedMembers.size === 0}>
                Admit Selected
              </Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
} 
