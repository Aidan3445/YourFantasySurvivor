'use client';
import { getContrastingColor } from '@uiw/color-convert';
import { Skeleton } from '~/app/_components/commonUI/skeleton';
import { ColorRow, type HeaderRowProps } from './membersScores';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { getHslIndex } from '~/lib/utils';

interface CastawaysProps {
  castaways: (CastawayDetails & { points: number })[];
}

export default function Castaways({ castaways }: CastawaysProps) {
  const showPointsPlace = castaways.some((c) => c.points > 0);

  return (
    <table className='space-y-2 space-x-1 h-min'>
      <CastawayHeaders showPointsPlace={showPointsPlace} />
      <tbody>
        {castaways.map((castaway, index) => {
          //const color = getCurrentTribe(castaway)?.color ?? '#AAAAAA';
          //const cColor = getContrastingColor(color);

          const color = getHslIndex(index, castaways.length / 1.31);
          const cColor = index >= 9 ? '#FFFFFF' : '#000000';

          return (
            <tr key={castaway.id}>
              {showPointsPlace &&
                <td>
                  <ColorRow color={color} className='flex justify-center py-1 text-xs'>
                    <h3 style={{ color: cColor }}>{index + 1}</h3>
                  </ColorRow>
                </td>}
              {showPointsPlace &&
                <td>
                  <ColorRow color={color} className='flex justify-center py-1 text-xs'>
                    <h3 style={{ color: cColor }}>{castaway.points}</h3>
                  </ColorRow>
                </td>}
              <td>
                <ColorRow
                  color={color}
                  className='flex justify-center py-1 text-xs' >
                  <h3 style={{ color: cColor }}>{castaway.name}</h3>
                  {/*<Circle strokeWidth={3} stroke='black' size={14} fill={color} />*/}
                </ColorRow>
              </td>
              <td className='flex space-x-0.5 w-full'>
                {castaway.tribes.map((tribe, index) => (
                  <ColorRow
                    key={`${castaway.id}-tribe-${index}`}
                    color={tribe.color}
                    className='flex justify-center py-1 text-xs w-full'>
                    <h3 style={{ color: getContrastingColor(tribe.color) }}>{tribe.name}</h3>
                  </ColorRow>
                ))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CastawayHeaders({ showPointsPlace }: HeaderRowProps) {
  return (
    <thead>
      <tr>
        {showPointsPlace &&
          <th>
            <ColorRow key='header-pl' color={'white'} className='flex col-start-1 justify-center py-1 text-xs'>
              <h3>Place</h3>
            </ColorRow>
          </th>}
        {showPointsPlace &&
          <th>
            <ColorRow key='header-po' color={'white'} className='flex col-start-2 justify-center py-1 text-xs'>
              <h3>Points</h3>
            </ColorRow>
          </th>}
        <th>
          <ColorRow key='header-d' color={'white'} className='flex col-start-4 justify-center py-1 text-xs'>
            <h3>Castaway</h3>
          </ColorRow>
        </th>
        <th>
          <ColorRow key='header-t' color={'white'} className='flex col-start-5 justify-center py-1 text-xs'>
            <h3>Tribe(s)</h3>
          </ColorRow>
        </th>
      </tr>
    </thead>
  );
}

export function CastawaysSkeleton() {
  return (
    <table className='space-y-2 space-x-1 h-min'>
      <CastawayHeaders showPointsPlace />
      <tbody>
        {Array.from({ length: 9 }).map((_, index) => (
          <tr key={index}>
            <td>
              <Skeleton className='min-w-8 h-[26px]' />
            </td>
            <td>
              <Skeleton className='min-w-8 h-[26px]' />
            </td>
            <td>
              <Skeleton className='min-w-8 h-[26px]' />
            </td>
            <td className='flex space-x-0.5'>
              <Skeleton className='min-w-12 h-[26px]' />
              <Skeleton className='min-w-12 h-[26px]' />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
