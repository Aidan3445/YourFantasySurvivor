import { Separator } from '~/components/common/separator';
import ColorRow from '~/components/shared/colorRow';
import { ChartsTooltipContainer, useAxesTooltip } from '@mui/x-charts';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import { useMemo } from 'react';
import { PointsIcon } from '~/components/icons/generated';

export default function CustomTooltip() {
  const tooltipData = useAxesTooltip();
  const { sortedMemberScores } = useLeagueData();

  const data = useMemo(
    () =>
      sortedMemberScores.map(({ member, scores }) => ({
        name: member.displayName,
        episodeScores: scores,
        color: member.color,
      })),
    [sortedMemberScores]
  );

  // Return null if no tooltip data (nothing hovered)
  if (!tooltipData) return null;

  const { axisValue, seriesItems } = tooltipData[0]!;

  // Build payload from series items, sorted by value descending
  const payload = seriesItems
    .map((item) => ({
      dataKey: item.formattedLabel ?? item.seriesId,
      value: item.value as number,
      stroke: item.color ?? '#000',
    }))
    .filter((p) => p.value !== null && p.value !== undefined)
    .sort((a, b) => b.value - a.value);

  if (payload.length === 0) return null;

  let firstSet: typeof payload, secondSet: typeof payload;
  if (payload.length > 9) {
    firstSet = payload.slice(0, Math.ceil(payload.length / 2));
    secondSet = payload.slice(Math.ceil(payload.length / 2));
  } else {
    firstSet = payload;
    secondSet = [];
  }

  const renderRow = (p: (typeof payload)[number]) => {
    const prevScore = data.find((d) => d.name === p.dataKey)?.episodeScores[(axisValue as number - 1)];
    const delta = prevScore !== undefined ? p.value - prevScore : undefined;
    return (
      <ColorRow
        key={p.dataKey}
        className='col-span-3 grid grid-cols-subgrid text-lg font-medium'
        color={p.stroke}>
        <p className='text-start text-inherit'>{p.dataKey}</p>
        <p className='text-center text-inherit'>{p.value}</p>
        <p className='text-center text-inherit opacity-80'>
          {delta ? `${delta < 0 ? '' : '+'}${delta}` : ''}
        </p>
      </ColorRow>
    );
  };

  return (
    <ChartsTooltipContainer trigger='axis'>
      <div className='flex flex-col p-2 rounded-lg border-2 border-primary/30 bg-card shadow-lg shadow-primary/20 scale-75'>
        <div className='font-bold uppercase tracking-wider text-center'>
          Episode {axisValue as number}
          <PointsIcon className='inline w-4 h-4 stroke-primary align-text-top' />
        </div>
        <Separator className='mb-1 bg-primary/20' />
        <div className='flex gap-4'>
          <div className='grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1'>
            <ColorRow
              className='col-span-3 grid grid-cols-subgrid text-lg font-medium bg-white!'
              color='#FFFFFF'>
              <p className='text-start text-inherit'>Name</p>
              <p className='text-center text-inherit'>Total</p>
              <p className='text-center text-inherit opacity-80'>Episode</p>
            </ColorRow>
            {firstSet.map(renderRow)}
          </div>
          {secondSet.length > 0 && (
            <div className='grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1'>
              <ColorRow
                className='col-span-3 grid grid-cols-subgrid text-lg font-medium bg-white!'
                color='#FFFFFF'>
                <p className='text-start text-inherit'>Name</p>
                <p className='text-center text-inherit'>Total</p>
                <p className='text-center text-inherit opacity-80'>Episode</p>
              </ColorRow>
              {secondSet.map(renderRow)}
            </div>
          )}
        </div>
      </div>
    </ChartsTooltipContainer>
  );
}
