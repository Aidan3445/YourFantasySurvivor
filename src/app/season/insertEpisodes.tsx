import { db } from '~/server/db';
import { Button } from '../_components/commonUI/button';
import { basicGet } from '../api/fetchFunctions';
import { seasons } from '~/server/db/schema/seasons';
import { episodes, type Episode } from '~/server/db/schema/episodes';

export default async function InsertEpisodes() {
  return (
    <div>
      <br />
      <form action={async () => {
        'use server';

        const data = await db.select({ id: seasons.id, name: seasons.name }).from(seasons);
        await insert(data);
      }}>
        <Button type='submit' className='p-2 rounded-md border border-black bg-b3 hover:bg-b4'>
          Insert Episodes
        </Button>
      </form>
    </div>
  );
}

type FetchEpisode = {
    id: number;
    airDate: string;
    number: number;
    title: string;
    season: number;
    merged: boolean;
    runtime: number;
    merge: boolean;
};

async function insert(data: { id: number, name: string }[]) {
  // eslint-disable-next-line prefer-const
  for (let { id, name } of data) {
    name = name.replace('Survivor', 'Season');
    const url = new URL(`https://fantasyapi-zzxp.onrender.com/api/${name}/episodes`);
    const fetchEpisodes: FetchEpisode[] = await basicGet(url);
    const newEpisodes: Episode[] = fetchEpisodes.map((episode) => {
      const newEp = episode as Episode;
      newEp.season = id;
      newEp.merge = episode.merged;
      return episode;
    });

    console.log(newEpisodes);

    const newEntries = await db.insert(episodes).values(newEpisodes).returning({ id: episodes.id, number: episodes.number }).onConflictDoNothing();
    console.log(newEntries);
  }
}

