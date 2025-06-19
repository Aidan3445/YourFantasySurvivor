'use client';

import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/ui/table';
import { useLeague } from '~/hooks/useLeague';
import type { CastawayDetails, CastawayName } from '~/server/db/defs/castaways';
import { type LeagueMemberDisplayName } from '~/server/db/defs/leagueMembers';
import { ColorRow } from '../draftOrder';
import { MoveRight, Circle, Flame, History, Skull, CircleHelp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { useIsMobile } from '~/hooks/useMobile';
import { cn } from '~/lib/utils';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Separator } from '~/components/ui/separator';
import { getContrastingColor } from '@uiw/color-convert';

export default function Scoreboard() {
  const { leagueData, league } = useLeague();
  const sortedMemberScores = Object.entries(leagueData.scores.Member)
    .sort(([_, scoresA], [__, scoresB]) => (scoresB.slice().pop() ?? 0) - (scoresA.slice().pop() ?? 0));

  return (
    <ScrollArea className='bg-card rounded-lg gap-0'>
      <Table>
        <TableCaption className='sr-only'>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow className={cn(
            'px-4 bg-white hover:bg-white')}>
            <TableHead className='text-center w-0'>Place</TableHead>
            <TableHead className='text-center w-0 text-nowrap'>
              Points
              <Flame className='align-top inline w-4 h-4 stroke-muted-foreground' />
            </TableHead>
            <TableHead className='text-center'>Member</TableHead>
            <TableHead className='text-center w-0 relative'>
              Survivor
              <ScoreboardHelp hasSurvivalCap={league.settings.survivalCap > 0} />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMemberScores.map(([member, scores], index) => {
            const color = league.members.list
              .find((m) => m.displayName === member)?.color ?? '#ffffff';
            const survivorName = leagueData.selectionTimeline.memberCastaways[member]?.slice()
              .pop() ?? 'None';
            const survivor = leagueData.castaways.find((c) => c.fullName === survivorName)!;
            return (
              <MemberRow
                key={index}
                place={index + 1}
                member={member}
                points={scores.slice().pop() ?? 0}
                survivor={survivor}
                color={color} />
            );
          })}
        </TableBody>
      </Table>
      <ScrollBar hidden orientation='horizontal' />
    </ScrollArea>
  );
}

interface MemberRowProps {
  place: number;
  member: LeagueMemberDisplayName;
  points: number;
  survivor: CastawayDetails;
  color: string;
}

function MemberRow({ place, member, points, survivor, color }: MemberRowProps) {
  const { leagueData, league } = useLeague();
  const isMobile = useIsMobile();

  const condensedTimeline = (leagueData.selectionTimeline.memberCastaways[member] ?? []).reduce((acc, castaway, index) => {
    if (castaway === null) return acc;

    const prev = acc[acc.length - 1];
    if (prev) {
      acc[acc.length - 1] = { ...prev, end: index - 1 };
    }

    if (acc[acc.length - 1]?.fullName === castaway) {
      acc[acc.length - 1]!.end = index;
      return acc;
    }
    return [...acc, {
      fullName: castaway,
      start: acc.length === 0 ? 'Draft' : index,
      end: leagueData.castaways.find((c) => c.fullName === castaway)?.eliminatedEpisode
    }];
  }, [] as { fullName: CastawayName, start: number | string, end?: number | null }[]);

  return (
    <TableRow>
      <TableCell className='px-1'>
        <ColorRow className='justify-center p-0' color={color}>
          {place}
        </ColorRow>
      </TableCell>
      <TableCell className='px-1'>
        <ColorRow className='justify-center p-0' color={color}>
          {points}
        </ColorRow>
      </TableCell>
      <TableCell className='text-nowrap px-1'>
        <ColorRow className='justify-center' color={color}>
          {member}
        </ColorRow>
      </TableCell>
      <TableCell className='text-nowrap px-1'>
        <ColorRow className='justify-center pr-0' color={survivor.eliminatedEpisode
          ? '#AAAAAA' : survivor.startingTribe.tribeColor}>
          {isMobile ? survivor.shortName : survivor.fullName}
          <div className='ml-auto flex gap-0.5'>
            {survivor.tribes.length > 1 && survivor.tribes.map((tribe) => (
              <Popover key={`${tribe.tribeName}-${tribe.episode}`}>
                <PopoverTrigger>
                  <Circle size={16} fill={tribe.tribeColor} />
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {tribe.tribeName} - Episode {tribe.episode}
                </PopoverContent>
              </Popover>
            ))}
            <Popover>
              <PopoverTrigger className='ml-2 mr-1'>
                <History
                  size={16}
                  color={survivor.eliminatedEpisode
                    ? 'black'
                    : getContrastingColor(survivor.startingTribe.tribeColor)} />
              </PopoverTrigger>
              <PopoverContent
                className='p-1 space-y-1 pt-0 grid grid-cols-[max-content,1fr] gap-x-2 w-full'
                align='end'>
                <PopoverArrow />
                <div className='text-center'>Survivor</div>
                <div className='text-center'>Episodes</div>
                <Separator className='col-span-2' />
                {condensedTimeline.map((castaway, index) => (
                  <span key={index} className='grid col-span-2 grid-cols-subgrid'>
                    <ColorRow
                      className='px-1 justify-center'
                      color={leagueData.castaways
                        .find((c) => c.fullName === castaway.fullName)?.startingTribe.tribeColor ?? '#AAAAAA'}>
                      {castaway.fullName}
                    </ColorRow>
                    <div className='flex gap-1 items-center text-nowrap'>
                      {castaway.start}
                      <MoveRight className='w-4 h-4' />
                      {castaway.end ? `${castaway.end}` :
                        leagueData.episodes.find((e) => e.isFinale && e.airStatus !== 'Upcoming') ?
                          'Finale' : 'Present'}
                    </div>
                  </span>
                ))}
              </PopoverContent>
            </Popover>
            {league.settings.survivalCap > 0 && (
              <Popover>
                <PopoverTrigger>
                  <div className='ml-1 w-4 flex justify-center'>
                    {Math.min(leagueData.currentStreaks[member]!, league.settings.survivalCap) ||
                      <Skull
                        size={16}
                        color={survivor.eliminatedEpisode
                          ? 'black'
                          : getContrastingColor(survivor.startingTribe.tribeColor)} />}
                  </div>
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='end'>
                  <PopoverArrow />
                  {`Survival streak: ${leagueData.currentStreaks[member] ?? 0}`}
                  <Separator className='my-1' />
                  {`Point cap: ${league.settings.survivalCap}`}
                  <Flame className='align-baseline inline w-4 h-4' />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </ColorRow>
      </TableCell>
    </TableRow>
  );
}

interface ScoreboardHelpProps {
  hasSurvivalCap?: boolean;
}

function ScoreboardHelp({ hasSurvivalCap }: ScoreboardHelpProps) {
  const isMobile = useIsMobile();
  return (
    <Popover>
      <PopoverTrigger className='absolute top-3 right-3 z-50 pointer-events-auto'>
        <CircleHelp className='w-4 h-4 stroke-muted-foreground' />
      </PopoverTrigger>
      <PopoverContent className='w-min text-nowrap p-0 border-none text-sm' side='left'>
        <ColorRow className='justify-center pr-0' color='#FF90CC'>
          {isMobile ? 'Castaway' : 'Current Survivor'}
          <div className='ml-auto flex gap-0.5'>
            <Popover open>
              <PopoverTrigger>
                <Circle size={16} fill='#FF90CC' />
              </PopoverTrigger>
              <PopoverContent className='w-min text-nowrap p-1' side='top' align='end' alignOffset={-10}>
                <PopoverArrow />
                Current Survivor Tribe History
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger>
                <Circle size={16} fill='#3ADA00' />
              </PopoverTrigger>
              <PopoverContent className='w-min text-nowrap p-1' align='end'>
                <PopoverArrow />
                Tribe Swap - Episode 4
              </PopoverContent>
            </Popover>
            <Popover open={isMobile ? undefined : true}>
              <PopoverTrigger>
                <Circle size={16} fill='#FEF340' />
              </PopoverTrigger>
              <PopoverContent className='w-min text-nowrap p-1' side='top' align='start'>
                <PopoverArrow />
                Merge Tribe - Episode 8
              </PopoverContent>
            </Popover>
            <Popover open>
              <PopoverTrigger className='ml-2'>
                <History size={16} />
              </PopoverTrigger>
              <PopoverContent
                className='p-1 space-y-1 pt-0 grid grid-cols-[max-content,1fr] gap-x-2 w-full'
                align='end'
                side='bottom'>
                <PopoverArrow />
                <div className='text-center'>Selection History</div>
                <div className='text-center'>Timeline</div>
                <Separator className='col-span-2' />
                <span className='grid col-span-2 grid-cols-subgrid'>
                  <ColorRow
                    className='px-1 justify-center'
                    color='#3ADA00'>
                    First Castaway
                  </ColorRow>
                  <div className='flex gap-1 items-center text-nowrap'>
                    Draft
                    <MoveRight className='w-4 h-4' />
                    Eliminated Episode
                  </div>
                </span>
                <span className='grid col-span-2 grid-cols-subgrid'>
                  <ColorRow
                    className='px-1 justify-center'
                    color='#FF90CC'>
                    Current Survivor
                  </ColorRow>
                  <div className='flex gap-1 items-center text-nowrap'>
                    5
                    <MoveRight className='w-4 h-4' />
                    Present
                  </div>
                </span>
              </PopoverContent>
            </Popover>
            {hasSurvivalCap && (
              <Popover open={isMobile ? undefined : true}>
                <PopoverTrigger>
                  <div className='mx-1 flex justify-center'>
                    2
                  </div>
                </PopoverTrigger>
                <PopoverContent className='w-min text-nowrap p-1' align='start' side='bottom'>
                  <PopoverArrow />
                  Survival streak points available
                  <br />
                  <br />
                  Current streak: 2
                  <Separator className='my-1' />
                  Point cap from league settings: 5
                  <Flame className='align-baseline inline w-4 h-4' />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </ColorRow>
      </PopoverContent>
    </Popover>
  );
}
