'use client';

import { Button } from '~/components/common/button';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from '~/components/common/alertDialog';
import { useEffect, useMemo, useState } from 'react';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import ColorRow from '~/components/shared/colorRow';
import { getContrastingColor } from '@uiw/color-convert';
import { Recycle } from 'lucide-react';
import { useSeasons } from '~/hooks/seasons/useSeasons';

interface RefreshLeagueProps {
  leagueHash: string;
}

export default function RefreshLeague({ leagueHash }: RefreshLeagueProps) {
  const { data: seasons } = useSeasons(true);
  const { data: leagueMembers } = useLeagueMembers(leagueHash);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());

  const currentSeason = useMemo(() => {
    if (!seasons || seasons.length === 0) return null;
    return seasons[seasons.length - 1];
  }, [seasons]);

  useEffect(() => {
    if (leagueMembers) {
      setSelectedMembers(new Set(leagueMembers.members.map(member => member.memberId)));
    }
  }, [leagueMembers]);

  const handleSubmit = () => {
    console.log('Selected Members:', Array.from(selectedMembers));
    // Here you would typically call an API to recreate the league with the selected members
    setIsOpen(false);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button
            size='sm'
            variant='default'
            className='mt-2'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(true);
            }}>
            <p className='text-wrap text-white'>
              Recreate League <Recycle className='inline ml-1' size={16} color='white' />
            </p>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogContent
            className='sm:w-160 w-96 flex flex-col animate-scale-in-fast'>
            <AlertDialogTitle className='text-2xl'>
              Recreate League
              {currentSeason && (
                <div className='text-sm text-muted-foreground'>
                  {currentSeason.name}
                </div>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Do you want all members to be added again?
              <br />
              Selected members will automatically be added to the new league.
            </AlertDialogDescription>
            <form className='mt-4 space-y-2' action={handleSubmit}>
              {leagueMembers?.members.map((member) => (
                <ColorRow key={member.memberId} color={member.color}>
                  <input
                    type='checkbox'
                    id={`member-${member.memberId}`}
                    defaultChecked
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
                    {member.displayName}
                  </label>
                </ColorRow>
              ))}
              <div className='mt-6 flex justify-end space-x-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>
                  Recreate League
                </Button>
              </div>
            </form>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </div>
  );
} 
