import SelectSeason from '../_components/selectSeason';
import Castaways from './_components/castaways';

interface SeasonProps {
  searchParams: { season: string };
}

export default function SeasonPage({ searchParams }: SeasonProps) {
  const season = searchParams.season;

  return (
    <main>
      <h1 className='text-5xl font-bold text-black'>Survivor Seasons</h1>
      <SelectSeason />
      {season && <Castaways season={season} />}
    </main>
  );
}
