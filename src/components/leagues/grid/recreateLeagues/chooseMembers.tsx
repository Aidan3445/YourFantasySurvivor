'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertDialogDescription } from '~/components/common/alertDialog';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { Button } from '~/components/common/button';
import ColorRow from '~/components/shared/colorRow';
import { useSeasons } from '~/hooks/seasons/useSeasons';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import { useRouter } from 'next/navigation';
import recreateLeague from '~/actions/recreateLeague';

interface ChooseMembersProps {
  hash: string;
  onSuccess: () => void;
}

export default function ChooseMembers({ hash, onSuccess }: ChooseMembersProps) {
  const { data: seasons } = useSeasons(true);
  const { sortedMemberScores } = useLeagueData(hash);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const currentSeason = useMemo(() => {
    if (!seasons || seasons.length === 0) return null;
    return seasons[0];
  }, [seasons]);

  useEffect(() => {
    if (sortedMemberScores) {
      setSelectedMembers(new Set(sortedMemberScores.map(({ member }) => member.memberId)));
    }
  }, [sortedMemberScores]);

  const toggleMember = (memberId: number, isLoggedIn: boolean) => {
    if (isLoggedIn) return;
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const sortedSelectedMembers = sortedMemberScores
        .toReversed()
        .filter(({ member }) => selectedMembers.has(member.memberId))
        .map(({ member }) => member.memberId);

      const { newHash } = await recreateLeague(hash, sortedSelectedMembers);
      alert('League cloned successfully!');
      onSuccess();
      router.push(`/leagues/${newHash}/predraft`);
    } catch (e) {
      console.error('Failed to clone league', e);
      alert('An error occurred while cloning the league.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AlertDialogDescription className='text-base text-left mb-4'>
        Choose which members to bring into the new league.
        {currentSeason && (
          <span className='block text-sm text-muted-foreground mt-1'>
            {currentSeason.name}
          </span>
        )}
      </AlertDialogDescription>
      <ScrollArea className='min-h-[40svh]'>
        <p className='text-xs text-muted-foreground mb-3'>
          The default draft order will start from the losers of the previous season.
          You can change this later.
        </p>
        <div className='space-y-2'>
          {sortedMemberScores?.toReversed().map(({ member }) => (
            <ColorRow key={member.memberId} color={member.color}>
              <input
                type='checkbox'
                id={`member-${member.memberId}`}
                checked={selectedMembers.has(member.memberId)}
                className='h-4 w-4'
                disabled={member.loggedIn}
                onChange={() => toggleMember(member.memberId, member.loggedIn)} />
              <label htmlFor={`member-${member.memberId}`} className='text-sm cursor-pointer'>
                {member.displayName}
              </label>
            </ColorRow>
          ))}
        </div>
        <ScrollBar orientation='vertical' forceMount />
      </ScrollArea>
      <Button
        className='m-4 mt-auto w-80 self-center font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transition-all'
        disabled={selectedMembers.size === 0 || isSubmitting}
        onClick={handleSubmit}>
        {isSubmitting ? 'Cloning...' : 'Clone League'}
      </Button>
    </>
  );
}
