'use client';

import { useLeague } from '~/hooks/useLeague';

export default function ChangeSurvivor() {
  const { leagueData } = useLeague();

  console.log(leagueData);

  return (
    <section className='md:w-full bg-card rounded-lg relative'>
      <span className='flex flex-wrap gap-x-4 items-baseline px-2 mr-14'>
        <h2 className='text-lg font-bold text-card-foreground'>Change Survivor Pick</h2>
      </span>
    </section>
  );
}
