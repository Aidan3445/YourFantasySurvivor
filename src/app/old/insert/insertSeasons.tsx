import { db } from '~/server/db';
import { Button } from '../_components/commonUI/button';
import { basicGet } from '../api/fetchFunctions';
import { seasons, type Season } from '~/server/db/schema/seasons';

export default async function InsertSeasons() {
  return (
    <div>
      <br />
      <form action={async () => {
        'use server';

        await insert();
      }}>
        <Button type='submit' className='p-2 rounded-md border border-black bg-b3 hover:bg-b4'>
          Insert Seasons
        </Button>
      </form>
    </div>
  );
}

async function insert() {
  const url = new URL('https://fantasyapi-zzxp.onrender.com/api/seasons');
  const fetchSeasons: Season[] = await basicGet(url);

  const newSeasons = fetchSeasons.map((season) => {
    season.name = season.name.replace('Season', 'Survivor');
    season.finaleDate = '4/20/2024';
    season.premierDate = '4/20/2024';
    return season;
  });

  await db.insert(seasons).values(newSeasons).returning({ id: seasons.seasonId, name: seasons.seasonName }).onConflictDoNothing();
}
