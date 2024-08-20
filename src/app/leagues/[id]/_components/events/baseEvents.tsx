'use client';

import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { Advantages, Challenges, Other } from '~/app/playground/_components/rules';
import { type ComponentProps } from '~/lib/utils';

export default function BaseEvents({ className }: ComponentProps) {
  const [category, setCategory] = useState('All');
  return (
    <article className={className}>
      <span className='flex gap-2 pr-2 items-center'>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='All'>All</SelectItem>
            <SelectItem value='Challenges'>Challenges</SelectItem>
            <SelectItem value='Advantages'>Advantages</SelectItem>
            <SelectItem value='Other'>Other</SelectItem>
          </SelectContent>
        </Select>
        <Ellipsis className='inline-flex align-middle' size={24} />
      </span>
      <div className='light-scroll h-96 pb-16 gap-4'>
        {(category === 'All' || category === 'Challenges') && <Challenges />}
        {(category === 'All' || category === 'Advantages') && <Advantages />}
        {(category === 'All' || category === 'Other') && <Other />}
      </div>
    </article>
  );
}
