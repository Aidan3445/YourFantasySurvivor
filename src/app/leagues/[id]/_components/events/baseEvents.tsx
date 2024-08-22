'use client';

import { ListRestart } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { Advantages, Challenges, Other } from '~/app/playground/_components/rules';
import { type EventsProps } from './eventForm';
import { defaultBaseRules } from '~/server/db/schema/leagues';

const defaultBase = defaultBaseRules();

export default function BaseEvents({ className, form }: EventsProps) {
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
      <span className='flex gap-2 pr-2 items-center'>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='challenges'>Challenges</SelectItem>
            <SelectItem value='advantages'>Advantages</SelectItem>
            <SelectItem value='other'>Other</SelectItem>
          </SelectContent>
        </Select>
        <ListRestart className='inline-flex align-middle ml-4 cursor-pointer' size={24} onClick={reset} />
      </span>
      <div className='light-scroll h-96 pb-4 gap-4'>
        {(category === 'all' || category === 'challenges') && <Challenges />}
        {(category === 'all' || category === 'advantages') && <Advantages />}
        {(category === 'all' || category === 'other') && <Other />}
      </div>
    </article>
  );
}
