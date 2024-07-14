'use client';
import { useState } from 'react';
import SelectSeason from '../_components/stats/selectSeason';
import Castaways from './_components/castaways';

export default function SeasonPage() {
  const [season, setSeason] = useState('');

  return (
    <main>
      <h1 className='text-5xl font-bold text-black'>Survivor Seasons</h1>
      <SelectSeason season={season} setSeason={setSeason} />
      <Castaways season={season} />
    </main>
  );
}
