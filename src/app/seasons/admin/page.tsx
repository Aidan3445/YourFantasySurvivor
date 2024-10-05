import SelectSeason from '~/app/_components/selectSeason';
import { getBaseEvents } from '~/app/api/leagues/[id]/score/query';
import { sysAuth } from '~/app/api/system/query';
import NewBaseEvent from '~/app/leagues/[id]/admin/_components/newBase';

export default function AdminPage() {
  const { sys } = await sysAuth();
  if (!sys) throw new Error('Not authorized');

  const [events, { castaways, tribes, remaining }, episodes] = await Promise.all([
    getBaseEvents(leagueId), getDraftDetails(leagueId), getEpisodes(leagueId),
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
        events={events} />
    </main>
  );
}
