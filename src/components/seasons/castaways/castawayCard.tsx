'use client';

import ColorRow from '~/components/shared/colorRow';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import { cn, getTribeTimeline } from '~/lib/utils';
import { type TribesTimeline } from '~/types/tribes';
import { useMemo } from 'react';
import { getContrastingColor } from '@uiw/color-convert';
import Link from 'next/link';
import Image from 'next/image';
import { type LeagueMember } from '~/types/leagueMembers';
import TribeHistoryCircles from '~/components/shared/castaways/tribeHistoryCircles';
import EliminationIndicator from '~/components/shared/castaways/eliminationIndicator';
import { ExternalLink } from 'lucide-react';

interface CastawayCardProps {
  castaway: EnrichedCastaway;
  tribesTimeline: TribesTimeline;
  tribes: Tribe[];
  member?: LeagueMember;
}

export default function CastawayCard({ castaway, tribesTimeline, tribes, member }: CastawayCardProps) {
  const tribeTimeline = useMemo(
    () => getTribeTimeline(castaway.castawayId, tribesTimeline, tribes),
    [castaway.castawayId, tribesTimeline, tribes]
  );

  return (
    <div className='bg-primary/5 flex flex-col gap-2 border-2 border-primary/20 rounded-lg p-3 hover:border-primary/30 transition-all'>
      <ColorRow
        className='relative justify-start gap-2 px-2 py-2 h-16 border-2'
        color={castaway.eliminatedEpisode ? '#AAAAAA' : castaway.tribe?.color}>
        <div
          className='leading-none flex items-center gap-2'
          style={{
            color: getContrastingColor(castaway?.eliminatedEpisode
              ? '#AAAAAA'
              : castaway?.tribe?.color ?? '#AAAAAA')
          }}>
          <Image
            src={castaway.imageUrl}
            alt={castaway.fullName}
            width={50}
            height={50}
            className={cn('rounded-full border-2',
              (!!member || !!castaway.eliminatedEpisode) && 'grayscale')}
            style={{
              borderColor: getContrastingColor(castaway?.eliminatedEpisode
                ? '#AAAAAA'
                : castaway?.tribe?.color ?? '#AAAAAA')
            }} />
          <span
            className='font-bold'
            style={{
              color: getContrastingColor(castaway?.eliminatedEpisode
                ? '#AAAAAA'
                : castaway?.tribe?.color ?? '#AAAAAA')
            }}>
            {castaway.fullName}
          </span>
          {member && (
            <ColorRow
              className='absolute -right-1 top-1 rotate-30 text-xs font-bold leading-tight p-0 px-1.5 z-50 border-2'
              color={member.color}>
              {member.displayName}
            </ColorRow>
          )}
        </div>

        {tribeTimeline && (
          <TribeHistoryCircles
            tribeTimeline={tribeTimeline}
            showAll={!!castaway.eliminatedEpisode} />
        )}
        {castaway.eliminatedEpisode && (
          <EliminationIndicator episode={castaway.eliminatedEpisode} />
        )}
      </ColorRow>

      <div className='space-y-1 text-sm'>
        <p><span className='font-bold text-muted-foreground'>Residence:</span> {castaway.residence}</p>
        <p><span className='font-bold text-muted-foreground'>Occupation:</span> {castaway.occupation}</p>
        {castaway.previouslyOn && castaway.previouslyOn.length > 0 && (
          <p className='text-pretty'>
            <span className='font-bold text-muted-foreground'>Previously On:</span> {castaway.previouslyOn.join(', ')}
          </p>
        )}
      </div>

      <Link
        className='flex items-center gap-1 text-primary hover:text-primary/80 font-bold uppercase text-xs tracking-wider w-fit mt-auto transition-colors'
        href={`https://survivor.fandom.com/wiki/${castaway.fullName}`}
        target='_blank'>
        Learn more
        <ExternalLink className='w-3 h-3 shrink-0' />
      </Link>
    </div>
  );
}
