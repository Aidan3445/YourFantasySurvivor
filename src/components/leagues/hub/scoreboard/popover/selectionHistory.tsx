import { MoveRight, History } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { Separator } from '~/components/common/separator';
import { type EnrichedCastaway } from '~/types/castaways';
import ColorRow from '~/components/shared/colorRow';
import { useMemo } from 'react';

interface SelectionHistoryProps {
  selectionList: (EnrichedCastaway | null)[] | undefined;
  secondaryPickList: (EnrichedCastaway | null)[] | undefined;
}

export default function SelectionHistory({ selectionList, secondaryPickList }: SelectionHistoryProps) {
  const condensedTimeline = useMemo(() => (selectionList ?? [])
    .reduce((acc, castaway, index) => {
      if (castaway === null) return acc;
      const prev = acc[acc.length - 1];
      if (prev) {
        acc[acc.length - 1] = { ...prev, end: index - 1 };
      }
      if (acc[acc.length - 1]?.castaway?.fullName === castaway.fullName) {
        acc[acc.length - 1]!.end = index;
        return acc;
      }

      const start = acc.length === 0 ? 'Draft' : index;
      const isReEntry = typeof start === 'number'
        && castaway.eliminatedEpisode !== null
        && start >= castaway.eliminatedEpisode;

      let end: number | null;
      if (isReEntry && castaway.redemption?.length) {
        // Find the most recent redemption that applies to this selection
        const relevantRedemption = [...castaway.redemption]
          .sort((a, b) => b.reentryEpisode - a.reentryEpisode)
          .find(r => typeof start === 'number' && r.reentryEpisode <= start);
        end = relevantRedemption?.secondEliminationEpisode ?? null;
      } else {
        end = castaway.eliminatedEpisode ?? null;
      }

      return [...acc, { castaway, start, end }];
    }, [] as { castaway: EnrichedCastaway, start: number | string, end: number | null }[]),
    [selectionList]);

  return (
    <Popover>
      <PopoverTrigger className='ml-1'>
        <History
          size={18}
          className='cursor-pointer stroke-muted-foreground hover:stroke-primary transition-colors' />
      </PopoverTrigger>
      <PopoverContent
        className='p-3 space-y-2 border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card w-full'
        align='end'>
        <div className='text-sm font-bold uppercase tracking-wider text-center'>Selection History</div>
        <Separator className='bg-primary/20' />
        <div className='grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm'>
          {condensedTimeline.map(({ castaway, start, end }, index) => (
            <span key={index} className='grid col-span-2 grid-cols-subgrid'>
              <ColorRow
                className='justify-center font-medium text-sm'
                color={castaway.tribe?.color ?? '#AAAAAA'}>
                {castaway.fullName}
              </ColorRow>
              <div className='flex gap-1 items-center text-nowrap font-medium'>
                {start}
                <MoveRight className='w-4 h-4 shrink-0' />
                {end ? `${end}` : 'Present'}
              </div>
            </span>
          ))}
        </div>
        {!!secondaryPickList?.slice(1)?.length && (
          <>
            <Separator className='mt-2 bg-primary/20' />
            <div className='text-sm font-semibold uppercase tracking-wide text-center'>Secondaries</div>
            <div className='grid grid-cols-[max-content_1fr] gap-x-1 gap-y-1 text-sm'>
              {secondaryPickList.slice(1).map((castaway, index) => (
                <span key={index} className='grid col-span-2 grid-cols-subgrid'>
                  <ColorRow
                    className='justify-center font-medium text-sm'
                    color={castaway?.tribe?.color ?? '#AAAAAA'}>
                    {castaway?.fullName ?? 'No Pick'}
                  </ColorRow>
                  <div className='flex gap-1 items-center text-nowrap font-medium'>
                    <MoveRight className='w-4 h-4 shrink-0' />
                    {index + 1}
                  </div>
                </span>
              ))}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
