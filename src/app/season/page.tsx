import InsertCastaways from './insertCastaways';
import InsertEpisodes from './insertEpisodes';
import InsertEvents from './insertEvents';
import InsertSeasons from './insertSeasons';
import InsertTribes from './insertTribes';

export default function SeasonPage() {
  return (
    <main>
      Season Page
      <InsertSeasons />
      <InsertCastaways />
      <InsertTribes />
      <InsertEpisodes />
      <InsertEvents />
    </main>
  );
}
