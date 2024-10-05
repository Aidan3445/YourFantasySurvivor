import SelectSeason from '~/app/_components/selectSeason';
import { getCastaways, getRemainingCastaways } from '~/app/api/seasons/[name]/castaways/query';
import { getEpisodes } from '~/app/api/seasons/[name]/episodes/query';
import { getCastawayEvents, getTribeEvents, getTribeUpdates } from '~/app/api/seasons/[name]/events/query';
import { getTribes } from '~/app/api/seasons/[name]/tribes/query';
import { sysAuth } from '~/app/api/system/query';
import NewBaseEvent from '~/app/leagues/[id]/admin/_components/newBase';

interface AdminPageProps {
  params: { season: string };
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { sys } = await sysAuth();
  if (!sys) throw new Error('Not authorized');

  const season = params.season;

  const [castaways, tribes, remaining, episodes, castawayEvents, tribeEvents, tribeUpdates] = await Promise.all([
    getCastaways(season), getTribes(season), getRemainingCastaways(season), getEpisodes(season),
    getCastawayEvents(season, null), getTribeEvents(season, null), getTribeUpdates(season)
  ]);

  return (
    <main>
      <SelectSeason />
      <br />
      <NewBaseEvent
        castaways={castaways}
        tribes={tribes}
        remaining={remaining}
        episodes={episodes as [{ id: number, title: string, number: number, airDate: string }]}
        events={{ castawayEvents, tribeEvents, tribeUpdates }} />
    </main>
  );
}
