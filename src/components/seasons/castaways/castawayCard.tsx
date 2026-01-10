'use client';

import { Circle, FlameKindling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
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
    <div className='bg-accent flex flex-col gap-1 border rounded-md p-2'>
      <ColorRow
        className='relative justify-center gap-2 px-1 py-1 h-14'
        color={castaway.eliminatedEpisode ? '#AAAAAA' : castaway.tribe?.color} >
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
            className={cn('rounded-full',
              (!!member || !!castaway.eliminatedEpisode) && 'grayscale')} />
          {castaway.fullName}
          {member && (
            <ColorRow
              className='absolute -right-1 top-1 rotate-30 text-xs leading-tight p-0 px-1 z-50'
              color={member.color}>
              {member.displayName}
            </ColorRow>
          )}
        </div>

        {
          castaway.eliminatedEpisode && (
            <Popover>
              <PopoverTrigger>
                <div className='text-xs text-muted-foreground cursor-help text-nowrap'>
                  <FlameKindling className='align-text-bottom inline w-4 h-4' />
                  ({castaway.eliminatedEpisode})
                </div>
              </PopoverTrigger>
              <PopoverContent className='w-min text-nowrap p-1' align='end'>
                <PopoverArrow />
                Eliminated Episode {castaway.eliminatedEpisode}
              </PopoverContent>
            </Popover>
          )
        }

        <div className='ml-auto flex gap-0.5'>
          {tribeTimeline && (tribeTimeline.length > 1 || castaway.eliminatedEpisode) && tribeTimeline.map(({ episode, tribe }) => (
            tribe && (
              <Popover key={`${tribe.tribeName}-${episode}`}>
                <PopoverTrigger>
                  <Circle size={16} fill={tribe.tribeColor} className='cursor-help' />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {tribe.tribeName} - Episode {episode}
                </PopoverContent>
              </Popover>
            )
          ))}
        </div>
      </ColorRow >

      <p><b>Current Residence:</b> {castaway.residence}</p>
      <p><b>Occupation:</b> {castaway.occupation}</p>
      {
        castaway.previouslyOn && castaway.previouslyOn.length > 0 && (
          <p className='text-pretty max-w-xs'>
            <b>Previously On:</b> {castaway.previouslyOn.join(', ')}
          </p>
        )
      }
      <Link
        className='text-blue-800 hover:underline w-min text-nowrap mt-auto'
        href={`https://survivor.fandom.com/wiki/${castaway.fullName}`}
        target='_blank'>
        Learn more
      </Link>
    </div >
  );
}
