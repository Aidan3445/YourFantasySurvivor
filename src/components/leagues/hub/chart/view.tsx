'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';
import CustomTooltip from '~/components/leagues/hub/chart/tooltip';
import { formatData } from '~/components/leagues/hub/chart/utils';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';

export default function Chart() {
  const { sortedMemberScores, } = useLeagueData();

  const highestScore = useMemo(() => Math.max(
    ...sortedMemberScores.map(({ scores }) => scores.slice().pop() ?? 0)
    , 0), [sortedMemberScores]);

  const data = useMemo(() => sortedMemberScores.map(({ member, scores }) => ({
    name: member.displayName,
    episodeScores: scores,
    color: member.color,
  })), [sortedMemberScores]);

  const memberCount = data.length;

  return (
    <div
      className='w-full rounded-lg bg-card'
      style={{ height: `calc(2.45*${memberCount + 1}rem)` }}>
      <ResponsiveContainer>
        <LineChart
          id='score-chart'
          data={formatData({ data: data })}
          margin={{
            top: 10,
            right: 10,
            // add padding depending on the length of the highest score
            // we multiply by 0.6 to get the value near the label where numbers may overlap
            left: highestScore < 100 && highestScore > 10 ? -10 :
              Math.floor(highestScore * 0.6).toString().length * 10 - 30,
            bottom: 12,
          }}>
          <CartesianGrid stroke='#4D4D4D' />
          <XAxis
            dataKey='episode' type='category' stroke='black'
            label={<text x={250} y={(memberCount + 1) * 38.5} fill='black' transform='rotate(0)'>Episodes</text>} />
          <YAxis
            stroke='black'
            tickCount={10}
            allowDecimals={false}
            label={<text x={(memberCount + 1) * -22} y={15} fill='black' transform='rotate(-90)'>Points</text>}
            domain={[
              (dataMin: number) => dataMin,
              (dataMax: number) => dataMax + 1,
            ]} />
          <Tooltip
            content={<CustomTooltip data={data} />}
            allowEscapeViewBox={{ x: false, y: false }}
            offset={0} />
          {data.map((line, index) => (
            <Line
              id={`line-${line.name}`}
              name={`line-${index}`}
              className='cursor-pointer'
              type='monotone'
              dataKey={line.name}
              stroke={line.color}
              strokeWidth={5}
              strokeLinecap='round'
              strokeOpacity={0.7}
              dot={false}
              key={index}
            // onMouseOver={() => mouseOverLeaderboard(
            //   line.name,
            //   sortedData.map((d) => d.name))}
            // onMouseOut={() => mouseOutLeaderboard(
            //   line.name,
            //   line.color,
            //   sortedData.map((d) => d.name))} 
            />))}
        </LineChart>
      </ResponsiveContainer >
    </div >
  );
}
