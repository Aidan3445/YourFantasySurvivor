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
import { Separator } from '~/components/ui/separator';
import { useLeague } from '~/hooks/useLeague';
import { ColorRow } from '../draftOrder';
import { useMemo } from 'react';

export default function Chart() {
  const {
    leagueData: {
      scores: {
        Member: memberScores,
      }
    },
    league: {
      members: {
        list: members,
      }
    }
  } = useLeague();

  const highestScore = useMemo(() => Math.max(
    ...Object.values(memberScores).map((scores) => scores.slice().pop() ?? 0)
  ), [memberScores]);

  const data = useMemo(() => Object.entries(memberScores).map(([name, scores]) => ({
    name,
    episodeScores: scores,
    color: members.find((member) => member.displayName === name)?.color ?? '#ffffff'
  })), [memberScores, members]);

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
            left: Math.floor(highestScore * 0.6).toString().length * 10 - 30,
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
            content={<CustomTooltip />}
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

type FormattedData = {
  episode: string | number;
  [key: string]: number | string;
}[];

type ScoreChartProps = {
  data: {
    name: string;
    episodeScores: number[];
    color: string;
  }[];
};

function formatData({ data }: ScoreChartProps) {
  const formattedData: FormattedData = [{ episode: '' }];
  data.forEach((data) => {
    const ep1 = formattedData[0]!;
    ep1[data.name] = 0;

    data.episodeScores.forEach((value, episodeNumber) => {
      if (!formattedData[episodeNumber]) {
        formattedData[episodeNumber] = {
          episode: episodeNumber,
        };
      }
      const episode = formattedData[episodeNumber];
      episode[data.name] = value;
    });
  });

  return formattedData;
}

interface CustomTooltipProps {
  payload?: {
    dataKey: string;
    value: number;
    stroke: string;
  }[];
  label?: string;
}

function CustomTooltip({ payload, label }: CustomTooltipProps) {
  if (!label || !payload) return;

  payload.sort((a, b) => b.value - a.value);

  let firstSet: typeof payload, secondSet: typeof payload;

  if (payload.length > 9) {
    firstSet = payload.slice(0, payload.length / 2);
    secondSet = payload.slice(payload.length / 2);
  } else {
    firstSet = payload;
    secondSet = [];
  }

  return (
    <div className='flex flex-col p-1 rounded-md border border-black bg-b3/95 scale-75'>
      <div>Episode {label}:</div>
      <Separator className='mb-1' />
      <div className='flex gap-2'>
        <div className='grid gap-1 grid-cols-min'>
          {firstSet.map((p) => (
            <ColorRow key={p.dataKey} color={p.stroke}>
              {p.dataKey} <div className='w-full' /> {p.value}
            </ColorRow>
          ))}
        </div>
        {secondSet.length > 0 && (
          <div className='grid gap-1 grid-cols-min'>
            {secondSet.map((p) => (
              <ColorRow key={p.dataKey} color={p.stroke}>
                {p.dataKey} <div className='w-full' /> {p.value}
              </ColorRow>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

