import { type AdvantageStat } from '~/app/api/seasons/[name]/events/stats';

interface AdvantagesTableProps {
  advantages: AdvantageStat[];
}

export default function AdvantagesTable({ advantages }: AdvantagesTableProps) {
  if (advantages.length === 0) {
    return <h2 className='text-lg text-center'>No advantages yet in this season.</h2>;
  }

  // pad advantages with at least 8 entries
  while (advantages.length < 8) {
    advantages.push({ name: '-', advName: '-', status: '-' });
  }

  return (
    <figure className='stats-scroll'>
      {advantages.map((adv, index) => (
        <span key={index} className={`grid grid-cols-4 text-xs text-center border-r border-black divide-x divide-black lg:text-sm ${index & 1 ? 'bg-white/20' : 'bg-white/10'}`}>
          <h3 className='col-span-2 px-1 font-medium text-md truncate'>{adv.name}</h3>
          <h4 className='font-normal'>{adv.advName}</h4>
          <h4 className='font-normal'>{adv.status}</h4>
        </span>
      ))}
    </figure>
  );
}
