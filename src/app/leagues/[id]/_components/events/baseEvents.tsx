'use client';
import { ListRestart } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { Advantages, Challenges, Other } from '~/app/playground/_components/rules';
import { type EventsProps } from './eventForm';
import { defaultBaseRules } from '~/server/db/schema/leagues';

const defaultBase = defaultBaseRules();

export default function BaseEvents({ className, form, freeze }: EventsProps) {
  const [category, setCategory] = useState('all');

  const reset = () => {
    if (category === 'all' || category === 'challenges') {
      const challengeKeys: (keyof typeof defaultBase)[] = [
        'tribe1st', 'tribe2nd', 'indivWin', 'indivReward'
      ];
      challengeKeys.forEach(key => form.setValue(key, defaultBase[key]));
    }
    if (category === 'all' || category === 'advantages') {
      const advantageKeys: (keyof typeof defaultBase)[] = [
        'advFound', 'advPlay', 'badAdvPlay', 'advElim'
      ];
      advantageKeys.forEach(key => form.setValue(key, defaultBase[key]));
    }
    if (category === 'all' || category === 'other') {
      const otherKeys: (keyof typeof defaultBase)[] = [
        'spokeEpTitle', 'finalists', 'fireWin', 'soleSurvivor'
      ];
      otherKeys.forEach(key => form.setValue(key, defaultBase[key]));
    }
  };

  return (
    <article className={className}>
      <span className='flex gap-2 items-center pr-2'>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className='mb-2' >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='challenges'>Challenges</SelectItem>
            <SelectItem value='advantages'>Advantages</SelectItem>
            <SelectItem value='other'>Other</SelectItem>
          </SelectContent>
        </Select>
        {!freeze && <ListRestart className='inline-flex ml-4 align-middle cursor-pointer' size={24} onClick={reset} />}
      </span>
      <div className='gap-4 pb-4 h-96 light-scroll'>
        <div className={freeze ? 'pointer-events-none' : ''}>
          {(category === 'all' || category === 'challenges') && <Challenges />}
          {(category === 'all' || category === 'advantages') && <Advantages />}
          {(category === 'all' || category === 'other') && <Other />}
        </div>
      </div>
    </article>
  );
}
