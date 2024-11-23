import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { HoverCardArrow, HoverCardPortal } from '@radix-ui/react-hover-card';
import { type EliminationStat } from '~/app/api/seasons/[name]/events/stats';

type EliminationsTableProps = {
  eliminations: EliminationStat[];
}

export default function EliminationsTable({ eliminations }: EliminationsTableProps) {
  if (eliminations.length === 0) {
    return <h2 className='text-lg text-center'>No one eliminated yet in this season.</h2>;
  }
  // pad eliminations with at least 8 entries
  while (eliminations.length < 8) {
    eliminations.push({ episode: -1, name: '-', votes: [] });
  }

  return (
    <figure className='stats-scroll'>
      {eliminations.map((elim, index) => (
        <span key={index} className={`grid grid-cols-3 text-xs text-center border-r border-black divide-x divide-black lg:text-sm ${index & 1 ? 'bg-white/20' : 'bg-white/10'}`}>
          {elim.episode === -1 ? <h3>-</h3> : <h3>Episode {elim.episode}</h3>}
          <h4 className='font-medium'>{elim.name}</h4>
          {elim.episode === -1 ?
            <h4>-</h4> :
            <HoverCard openDelay={100} closeDelay={0}>
              <HoverCardTrigger>
                <h4 >{elim.votes.length} vote{elim.votes.length > 1 ? 's' : ''}</h4>
              </HoverCardTrigger>
              <HoverCardPortal>
                <HoverCardContent className='w-min px-1 py-0' side='top' sideOffset={-2}>
                  <HoverCardArrow />
                  <article className='flex flex-col gap-1'>
                    <h3 className='text-lg font-semibold'>Votes</h3>
                    {elim.votes.map((vote, index) => (
                      <p key={index} className='text-sm text-nowrap px-1'>{vote}</p>
                    ))}
                  </article>
                </HoverCardContent>
              </HoverCardPortal>
            </HoverCard>}
        </span>
      ))}
    </figure>
  );
}

