'use client';

import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';

export default function SetSurvivalCap() {
  return (
    <article className='p-2 bg-card rounded-xl w-full'>
      <h2 className='text-lg font-bold text-card-foreground'>Survival Streak</h2>
      <p className='text-sm'>
        The <i>Survival Streak</i> rewards players for picking a castaway that survives each episode.
      </p>
      <div className='text-sm'>
        Each episode your pick survives, their streak grows:
        <br />
        <ul className='list-disc pl-4'>
          <li><b>Episode 1</b>: Earn 1 point</li>
          <li><b>Episode 2</b>: Earn 2 points</li>
          <li><b>Episode 3</b>: Earn 3 points, and so on...</li>
        </ul>
        If your pick is eliminated, you must choose a new unclaimed castaway, and your streak resets.
      </div>
      <br />
      <span className='flex gap-4'>
        <div>
          <p className='text-base font-bold'>Survival Cap</p>
          <Input className={cn('w-full cursor-pointer transition-all')} type='number' placeholder='Survival Cap' />
          <p className='text-sm'>
            Set a cap on the maximum points a player can earn from their streak.
            <br />
            <b>Note:</b> An <i>unlimited cap</i> will favor the player who picks the winner.
          </p>
        </div>
        <div>
          <p className='text-base font-bold'>Preserve Streaks</p>
          <Input className={cn('w-full cursor-pointer transition-all')} type='checkbox' />
          <p className='text-sm'>
            Should streaks be <i>preserved</i> if a player switches their pick voluntarily?
          </p>
        </div>
      </span>
    </article>
  );
}
