import 'server-only';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { seasons } from '~/server/db/schema/seasons';
import { baseEventTribes, baseEventCastaways, baseEvents, episodes } from '~/server/db/schema/episodes';
import { tribes } from '~/server/db/schema/tribes';
import { castaways } from '~/server/db/schema/castaways';

export type CastawayDetails = {
  name: string;
  photo: string;
  tribes: Tribe[];
  startingTribe: Tribe;
};

export async function getCastaways(seasonName: string, castawayName: string)  {
  const rows = await db.select()
    .from(
}
