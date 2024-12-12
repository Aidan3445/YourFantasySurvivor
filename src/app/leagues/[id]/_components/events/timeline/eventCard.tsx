import { type ComponentProps } from '~/lib/utils';

export interface EventCardProps extends ComponentProps {
  eventName: string;
  points?: number;
  events?: { reference: { castaway: string | null, tribe: string | null } }[];
  castaway?: boolean;
  tribe?: boolean;
}


export function EventCard({ eventName, points = 0, events, castaway = true, tribe = true, children }: EventCardProps) {
  const pointValue = points !== 0 ?
    `(${points > 0 ? '+' : ''}${points})` :
    '';

  return (
    <article className='p-1 rounded-md bg-b4'>
      <h3 className='text-lg font-semibold text-nowrap'>{eventName} {pointValue}</h3>
      <div className='overflow-y-auto max-h-24 min-w-32 overflow-x-clip dark-scroll'>
        {children}
        {!children && events?.map((event, index) => (
          <p key={index} className='px-1 text-sm text-nowrap'>
            {(castaway ? event.reference.castaway : null) ??
              (tribe ? event.reference.tribe : 'NOT FOUND')}
          </p>
        ))}
      </div>
    </article>
  );
}

