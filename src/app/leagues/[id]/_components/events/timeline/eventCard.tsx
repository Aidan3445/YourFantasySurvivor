import { MoveRight } from 'lucide-react';
import { type MemberCastaways } from '~/app/api/leagues/[id]/score/query';
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

interface SelectionUpdateCardProps {
  episode: number;
  memberCastaways: MemberCastaways;
}

export function SelectionUpdateCard({ episode, memberCastaways }: SelectionUpdateCardProps) {
  const updates = Object.entries(memberCastaways).map(([member, castaways]) => {
    const prevCastaway = castaways[episode - 2];
    const newCastaway = castaways[episode - 1];
    if (!newCastaway || prevCastaway === newCastaway) return;
    return { member, from: prevCastaway, to: newCastaway };
  }).filter((update) => update !== undefined);

  if (updates.length === 0) return null;

  return (
    <EventCard eventName='Castaway Selections'>
      <div className='flex flex-col items-center'>
        {updates.map(({ member, from, to }) => (
          <div key={member} className='flex items-baseline gap-1'>
            <p className='text-nowrap'>{member}:</p>
            {from && <>
              <p className='text-xs text-nowrap'>{from}</p>
              <MoveRight className='translate-y-1' size={16} />
            </>}
            <p className='text-xs text-nowrap'>{to}</p>
          </div>
        ))}
      </div>
    </EventCard>
  );
}
