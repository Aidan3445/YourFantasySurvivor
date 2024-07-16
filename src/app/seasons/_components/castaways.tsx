import { useEffect, useState } from 'react';
import { type CastawayDetails } from '~/app/api/seasons/[name]/castaways/query';
import { useToast } from '~/app/_components/commonUI/use-toast';
import CardContainer from '~/app/_components/cardContainer';
import Image from 'next/image';
import { cn } from '~/lib/utils';
import { ArrowRight } from 'lucide-react';

interface CastawaysProps {
  season: string;
}

export default function Castaways({ season }: CastawaysProps) {
  const [castaways, setCastaways] = useState<CastawayDetails[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (season) {
      fetch(`/api/seasons/${season}/castaways`)
        .then((res) => res.json())
        .then((data: CastawayDetails[]) => setCastaways(data))
        .catch((err: Error) => {
          toast({
            title: 'Error fetching castaways',
            description: err.message,
            variant: 'error',
          });
        });
    }
  }, [season, toast]);

  return (
    <div>
      <h2 className='font-medium text-2xl'>Castaways</h2>
      <ul className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {castaways.map((castaway, index) => (
          <li key={index}>
            <CardContainer className='p-6'>
              <div className='flex justify-between items-center'>
                <article className='flex flex-col'>
                  <h3 className='text-xl font-semibold'>{castaway.name}</h3>
                  <TribeLabel
                    className='text-lg'
                    tribe={castaway.startingTribe.name}
                    color={castaway.startingTribe.color} />
                  <div className='flex space-x-2'>
                    {castaway.tribes.slice(1).map((tribe, index) => (
                      <div key={index} className='flex space-x-1 items-center'>
                        <ArrowRight className='w-4 h-4' />
                        <TribeLabel className='text-sm' tribe={tribe.name} color={tribe.color} />
                      </div>
                    ))}
                  </div>
                </article>
                <div className='flex min-w-40 min-h-40 relative items-start'>
                  <Image
                    src={castaway.photo}
                    alt={`${castaway.name} photo`}
                    className='rounded-md object-top object-cover overflow-hidden'
                    fill />
                </div>
              </div>
            </CardContainer>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TribeLabelProps {
  className?: string;
  tribe: string;
  color: string;
}

function TribeLabel({ className, tribe, color }: TribeLabelProps) {
  return (
    <h2
      className={cn('w-min drop-shadow-text', className)}
      style={{ color: color }}>
      {tribe}
    </h2>
  );
}
