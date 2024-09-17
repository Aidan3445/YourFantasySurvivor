import InsertCastaways from './insertCastaways';
import InsertEpisodes from './insertEpisodes';
import InsertEvents from './insertEvents';
import InsertSeasons from './insertSeasons';
import InsertTribes from './insertTribes';

export default function InsertPage() {
  return (
    <main>
      <h1 className='text-5xl font-bold text-black'>Insert Data</h1>
      <InsertSeasons />
      <InsertCastaways />
      <InsertTribes />
      <InsertEpisodes />
      <InsertEvents />
    </main>
  );
}
