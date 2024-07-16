'use client';
import SelectSeason from '../_components/selectSeason';
import Castaways from './_components/castaways';
import { useSearchParams } from 'next/navigation';

export default function SeasonPage() {
  const searchParams = useSearchParams();
  const season = searchParams.get('season')!;

  return (
    <main>
      <h1 className='text-5xl font-bold text-black'>Survivor Seasons</h1>
      <SelectSeason />
      <Castaways season={season} />
    </main>
  );
}
