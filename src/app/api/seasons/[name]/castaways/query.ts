import 'server-only';
import { and, asc, eq, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { seasons } from '~/server/db/schema/seasons';
import { baseEventTribes, baseEventCastaways, baseEvents, episodes } from '~/server/db/schema/episodes';
import { tribes } from '~/server/db/schema/tribes';
import { castaways } from '~/server/db/schema/castaways';

type Tribe = {
  name: string;
  color: string;
  episode: number;
};
export type CastawayDetails = {
  name: string;
  photo: string;
  tribes: Tribe[];
  startingTribe: Tribe;
  more: {
    shortName: string;
    age: number;
    hometown: string;
    residence: string;
    job: string;
  };
};

export async function getCastaways(seasonName: string, castawayName: string | null): Promise<CastawayDetails[]> {
  const rows = await db.select({
    name: castaways.name,
    photo: castaways.photo,
    tribe: tribes.name,
    color: tribes.color,
    episode: episodes.number,
    moreDetails: {
      shortName: castaways.shortName,
      age: castaways.age,
      hometown: castaways.hometown,
      residence: castaways.residence,
      job: castaways.job
    }
  }).from(castaways)
    .rightJoin(seasons, eq(seasons.id, castaways.season))
    .rightJoin(baseEventCastaways, eq(baseEventCastaways.castaway, castaways.id))
    .rightJoin(baseEventTribes, eq(baseEventTribes.event, baseEventCastaways.event))
    .rightJoin(tribes, eq(tribes.id, baseEventTribes.tribe))
    .rightJoin(baseEvents, eq(baseEvents.id, baseEventTribes.event))
    .rightJoin(episodes, eq(episodes.id, baseEvents.episode))
    .where(and(
      eq(seasons.name, seasonName),
      eq(baseEvents.name, 'tribeUpdate'),
      or(eq(castaways.name, castawayName ?? castaways.name),
        eq(castaways.shortName, castawayName ?? castaways.shortName))))
    .orderBy(asc(episodes.number));

  const castawaysWithTribes = rows.reduce((acc, row) => {
    // this is a hack to filter out rows that don't have all the necessary data
    // this shouldn't happen but will make typescript happy
    if (!row?.name || !row?.tribe || !row?.color || !row?.photo || !row?.moreDetails) {
      console.warn('Skipping row:', row);
      return acc;
    }

    const castaway = acc[row.name] ?? {
      name: row.name,
      photo: row.photo,
      tribes: [] as Tribe[],
      startingTribe: {
        name: row.tribe,
        color: row.color,
        episode: row.episode
      },
      more: row.moreDetails
    };
    castaway.tribes.push({ name: row.tribe, color: row.color, episode: row.episode });
    acc[row.name] = castaway;
    return acc;
  }, {} as Record<string, CastawayDetails>);

  return Object.values(castawaysWithTribes).sort(
    (a, b) => a.startingTribe.name.localeCompare(b.startingTribe.name));
}

