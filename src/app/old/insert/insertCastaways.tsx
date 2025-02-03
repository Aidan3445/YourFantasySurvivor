import { db } from '~/server/db';
import { Button } from '../_components/commonUI/button';
import { basicGet } from '../api/fetchFunctions';
import { seasons } from '~/server/db/schema/seasons';
import { castaways, type Castaway } from '~/server/db/schema/castaways';

export default async function InsertCastaways() {
  return (
    <div>
      <br />
      <form action={async () => {
        'use server';

        const data = await db.select({ id: seasons.seasonId, name: seasons.seasonName }).from(seasons);
        await insert(data);
      }}>
        <Button type='submit' className='p-2 rounded-md border border-black bg-b3 hover:bg-b4'>
          Insert Castaways
        </Button>
      </form>
    </div>
  );
}

async function insert(data: { id: number, name: string }[]) {
  // eslint-disable-next-line prefer-const
  for (let { id, name } of data) {
    name = name.replace('Survivor', 'Season');
    const url = new URL(`https://fantasyapi-zzxp.onrender.com/api/${name}/survivors`);
    try {
      const fetchCastaways: Castaway[] = await basicGet(url);
      const newCastaways = fetchCastaways.map((castaway) => {
        castaway.season = id;
        castaway.shortName = castaway.name.split(' ')[0] ?? castaway.name;
        if (castaway.photo.length > 512) {
          castaway.photo = 'https://via.placeholder.com/150';
        }
        return castaway;
      });
      await db.insert(castaways).values(newCastaways).returning({ id: castaways.castawayId, name: castaways.shortName }).onConflictDoNothing();
    } catch (e) {
      console.error(e);
    }
  }
}

