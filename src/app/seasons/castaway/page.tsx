import { redirect } from 'next/navigation';
import { getCastaway } from '~/app/api/seasons/[name]/castaways/[castaway]/query';
import { TribeLabel } from '../_components/castaways';
import CardContainer from '~/app/_components/cardContainer';
import { ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '~/app/_components/commonUI/separator';
import { type CastawayEvent } from '~/app/api/seasons/[name]/events/query';
import { type CastawayDetails } from '~/server/db/schema/castaways';

interface CastawayPageProps {
  searchParams: Promise<{ season?: string, castaway?: string }>;
}

export default async function CastawayPage(props: CastawayPageProps) {
  const searchParams = await props.searchParams;

  if (!searchParams.castaway || !searchParams.season) redirect('/seasons');
  const { details, events } = await getCastaway(searchParams.season, searchParams.castaway);

  return (
    <main>
      <section className='flex flex-col gap-4 justify-between items-center md:flex-row'>
        <LargeCastawayCard details={details} />
        <CardContainer className='px-6 h-full min-w-60 min-h-40 w-fit6 lg:min-w-80'>STATS</CardContainer>
      </section>
      <section>
        <ul className='flex flex-col gap-4'>
          {events.map((event, index) => (
            <li key={index} className='py-2'>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

interface LargeCastawayCardProps {
  details: CastawayDetails;
}

function LargeCastawayCard({ details }: LargeCastawayCardProps) {
  return (
    <CardContainer className='px-6 h-full min-w-60 w-fit lg:min-w-80'>
      <h3 className='w-full text-xl font-semibold text-center'>{details.name}</h3>
      <div className='flex gap-6 justify-between items-center'>
        <div className='flex flex-col'>
          <article className='flex flex-col'>
            <h4 className='text-lg font-semibold'>Castaway Info</h4>
            <ul className='flex flex-col space-y-2'>
              <li> Age: {details.more.age}</li>
              <li> Hometown: {details.more.hometown}</li>
              {details.more.residence != details.more.hometown &&
                <li> Current Residence: {details.more.residence}</li>}
              <li> Occupation: {details.more.job}</li>
            </ul>
          </article>
          <Separator className='my-4' />
          <article className='flex flex-col'>
            <h3 className='text-lg font-semibold'>Tribes</h3>
            <TribeLabel
              className='text-xl'
              tribe={details.startingTribe.name}
              color={details.startingTribe.color} />
            <div className='flex flex-col space-y-2'>
              {details.tribes.slice(1).map((tribe, index) => (
                <div key={index} className='items-center'>
                  <ArrowDown className='w-4 h-4' />
                  <TribeLabel className='text-sm' tribe={tribe.name} color={tribe.color} />
                </div>
              ))}
            </div>
          </article>
        </div>
        <div className='flex relative items-start mb-4 min-w-20 min-h-40 lg:min-w-40 lg:min-h-80'>
          <Image
            src={details.photo}
            alt={`${details.name} photo`}
            className='object-cover object-top overflow-hidden rounded-md'
            sizes='250px'
            fill />
        </div>
      </div>
    </CardContainer>
  );
}

interface EventCardProps {
  event: CastawayEvent;
}

function EventCard({ event }: EventCardProps) {
  return (
    <CardContainer className='px-6 w-full h-full'>
      <h3 className='w-full text-xl font-semibold text-center'>{event.name}</h3>
      <div className='flex flex-col gap-2'>
        <p className='text-sm'>{event.name}</p>
        <p className='text-sm'>Episode: {event.episode}</p>
      </div>
    </CardContainer>
  );
}
