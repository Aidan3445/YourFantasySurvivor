import { useEffect, useState } from 'react';
import { type CastawayDetails } from '~/app/api/seasons/[name]/castaways/query';
import { useToast } from '~/app/_components/commonUI/use-toast';
import CardContainer from '~/app/_components/cardContainer';
import Image from 'next/image';

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
            status: 'error',
          });
        });
    }
  }, [season, toast]);

  return (
    <div>
      <h2 className='font-medium text-2xl'>Castaways</h2>
      <ul className='flex flex-col gap-4'>
        {castaways.map((castaway, index) => (
          <li key={index}>
            <CardContainer className='p-6'>
              <div className='flex justify-between items-center'>
                <h3 className='text-xl'>{castaway.name}</h3>
                <Image src={castaway.photo} alt={`${castaway.name} photo`} width={50} height={50} />
              </div>
            </CardContainer>
          </li>
        ))}
      </ul>
    </div>
  );
}
