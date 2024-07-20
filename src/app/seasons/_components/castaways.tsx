import { type CastawayDetails, getCastaways } from '~/app/api/seasons/[name]/castaways/query';
import CardContainer from '~/app/_components/cardContainer';
import Image from 'next/image';
import { cn } from '~/lib/utils';
import { ArrowDown } from 'lucide-react';

interface CastawaysProps {
  season: string;
}

export default async function Castaways({ season }: CastawaysProps) {

  const castaways = await getCastaways(season, null);

  return (
    <div>
      <h2 className='font-medium text-2xl'>Castaways</h2>
      <ul className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 pb-4'>
        {castaways.map((castaway, index) => (
          <li key={index} className='py-2'>
            <CastawayCard season={season} castaway={castaway} />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface CastawayCardProps {
  castaway: CastawayDetails
  season?: string;
  className?: string;
}

export function CastawayCard({ season, castaway, className }: CastawayCardProps) {
  return (
    <CardContainer className={cn('px-6 min-w-60 lg:min-w-80 h-full', className)}>
      <a href={`/seasons/castaway?season=${season}&castaway=${castaway.name}`}>
        <h3 className='text-xl font-semibold w-full text-center'>{castaway.name}</h3>
        <div className='flex justify-between items-center'>
          <article className='flex flex-col'>
            <TribeLabel
              className='text-xl'
              tribe={castaway.startingTribe.name}
              color={castaway.startingTribe.color} />
            <div className='flex flex-col space-y-2'>
              {castaway.tribes.slice(1).map((tribe, index) => (
                <div key={index} className='items-center'>
                  <ArrowDown className='w-4 h-4' />
                  <TribeLabel className='text-sm' tribe={tribe.name} color={tribe.color} />
                </div>
              ))}
            </div>
          </article>
          <div className='flex min-w-20 min-h-20 lg:min-w-40 lg:min-h-40 relative items-start'>
            <Image
              src={castaway.photo}
              alt={`${castaway.name} photo`}
              className='rounded-md object-top object-cover overflow-hidden'
              sizes='250px'
              fill />
          </div>
        </div>
      </a>
    </CardContainer>
  );
}

interface TribeLabelProps {
  className?: string;
  tribe: string;
  color: string;
}

export function TribeLabel({ className, tribe, color }: TribeLabelProps) {
  return (
    <h2
      className={cn('w-min font-medium drop-shadow-text', className)}
      style={{ color: color }}>
      {tribe}
    </h2>
  );
}
