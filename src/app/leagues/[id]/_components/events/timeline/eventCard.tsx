import { type ComponentProps } from '~/lib/utils';

export interface EventCardProps extends ComponentProps {
  eventName: string;
  events?: { reference: { castaway: string | null, tribe: string | null } }[];
  castaway?: boolean;
  tribe?: boolean;
}


export function EventCard({ eventName, events, castaway = true, tribe = true, children }: EventCardProps) {
  return (
    <article className='p-1 rounded-md bg-b4'>
      <h3 className='text-lg font-semibold text-nowrap'>{eventName}</h3>
      <div className='max-h-24 min-w-32 overflow-y-auto dark-scroll overflow-x-clip'>
        {children}
        {!children && events?.map((event, index) => (
          <p key={index} className='text-sm text-nowrap px-1'>
            {(castaway ? event.reference.castaway : null) ??
              (tribe ? event.reference.tribe : 'NOT FOUND')}
          </p>
        ))}
      </div>
    </article>
  );
}

