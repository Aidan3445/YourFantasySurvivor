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
import { Separator } from '~/app/_components/commonUI/separator';
import { mouseOutLeaderboard, mouseOverLeaderboard } from './leaderboard';
import { cn, type ComponentProps } from '~/lib/utils';
import { ColorRow } from '~/app/leagues/[id]/_components/scores/membersScores';

interface ScoreChartProps extends ComponentProps {
  data: {
    name: string;
    color: string;
    episodeScores: number[];
  }[];
  label?: boolean;
}

export default function Chart({ data, label, className }: ScoreChartProps) {
  // sort the data so that the end of a line is always visible for hover purposes
  const sortedData = [...data].sort(
    (a, b) => b.episodeScores.length - a.episodeScores.length,
  );
  console.log('sortedData:', sortedData);

  return (
    <div className={cn(className, 'rounded-lg border border-black bg-b4/50')}>
      <ResponsiveContainer>
        <LineChart
          id='score-chart'
          data={formatData({ data })}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid stroke='#4D4D4D' />
          <XAxis
            dataKey='episode' type='category' stroke='black'
            label={label ? <text x={175} y={275} fill='black' transform='rotate(0)'>Episodes</text> : undefined} />
          <YAxis
            stroke='black'
            tickCount={10}
            allowDecimals={false}
            label={label ? <text x={-150} y={15} fill='black' transform='rotate(-90)'>Points</text> : undefined}
            domain={[
              (dataMin: number) => dataMin,
              (dataMax: number) => dataMax + 1,
            ]} />
          <Tooltip content={<CustomTooltip />} offset={-200} allowEscapeViewBox={{ x: true, y: true }} />
          {sortedData.map((line, index) => (
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
              onMouseOver={() => mouseOverLeaderboard(
                line.name,
                sortedData.map((d) => d.name))}
              onMouseOut={() => mouseOutLeaderboard(
                line.name,
                line.color,
                sortedData.map((d) => d.name))} />))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

type FormattedData = {
  episode: string | number;
  [key: string]: number | string;
}[];

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
    firstSet = payload.slice(0, payload.length / 2 + 1);
    secondSet = payload.slice(payload.length / 2);
  } else {
    firstSet = payload;
    secondSet = [];
  }

  return (
    <div className='flex flex-col p-1 rounded-md border border-black bg-b3/95'>
      <div>Episode {label}:</div>
      <Separator className='mb-1' />
      <div className='flex gap-2'>
        <div className='grid grid-cols-min gap-1'>
          {firstSet.map((p) => (
            <span
              key={p.dataKey}
              className='grid grid-cols-subgrid col-span-2 opacity-60'
              style={{ color: p.stroke, stroke: p.stroke }}>
              <ColorRow className='col-start-1' color={p.stroke}>
                <h3 className='col-start-2'>{p.dataKey}</h3>
              </ColorRow>
              <ColorRow className='col-start-2' color={p.stroke}>
                <h3>{p.value}</h3>
              </ColorRow>
            </span>
          ))}
        </div>
        {secondSet.length > 0 && (
          <div className='grid grid-cols-min gap-1'>
            {secondSet.map((p) => (
              <span
                key={p.dataKey}
                className='grid grid-cols-subgrid col-span-2 opacity-60'
                style={{ color: p.stroke, stroke: p.stroke }}>
                <ColorRow className='col-start-1' color={p.stroke}>
                  <h3 className='col-start-2'>{p.dataKey}</h3>
                </ColorRow>
                <ColorRow className='col-start-2' color={p.stroke}>
                  <h3>{p.value}</h3>
                </ColorRow>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
