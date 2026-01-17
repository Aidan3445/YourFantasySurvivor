'use client';

import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo } from 'react';
import CustomTooltip from '~/components/leagues/hub/chart/tooltip';
import { formatDataForMui } from '~/components/leagues/hub/chart/utils';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';

export default function Chart() {
  const { sortedMemberScores, league } = useLeagueData();

  const data = useMemo(() => sortedMemberScores.map(({ member, scores }) => ({
    name: member.displayName,
    episodeScores: scores,
    color: member.color,
  })), [sortedMemberScores]);

  const { xAxisData, series } = useMemo(() => formatDataForMui({
    data,
    startWeek: league?.startWeek ?? 1
  }), [data, league?.startWeek]);

  const maxY = useMemo(() => {
    let max = 0;
    data.forEach(({ episodeScores }) => {
      episodeScores.forEach((score) => {
        if (score > max) {
          max = score;
        }
      });
    });
    return max;
  }, [data]);

  return (
    <div className='w-full h-full rounded-lg bg-card'>
      {sortedMemberScores[0]?.scores?.[league?.startWeek ?? 1] === undefined ? (
        <div className='w-full h-64 flex items-center justify-center text-muted-foreground'>
          No scores available to display the chart.
        </div>
      ) : (
        <LineChart
          xAxis={[{
            data: xAxisData,
            label: 'Episode',
            scaleType: 'point',
          }]}
          yAxis={[{
            label: 'Points',
            max: maxY * 1.1,
          }]}
          margin={{ top: 0, right: 24, bottom: 0, left: 12 }}
          series={series}
          grid={{ horizontal: true }}
          slots={{
            tooltip: CustomTooltip,
          }}
          slotProps={{
            legend: {
              position: { horizontal: 'center' },
            },
          }}
          sx={{
            '& .MuiLineElement-root': {
              strokeWidth: 5,
              strokeLinecap: 'round',
              strokeOpacity: 0.7,
            },
            '& .MuiChartsGrid-line': {
              stroke: '#4D4D4D',
            },
            '& .MuiChartsAxis-line': {
              stroke: 'black',
            },
            '& .MuiChartsAxis-tick': {
              stroke: 'black',
            },
            '& .MuiChartsAxis-tickLabel': {
              fill: 'currentColor',
            },
          }}
        />
      )}
    </div >
  );
}
