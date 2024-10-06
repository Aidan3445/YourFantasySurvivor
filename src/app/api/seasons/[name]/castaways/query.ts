import 'server-only';
import { and, asc, eq, inArray, notExists, or } from 'drizzle-orm';
import { db } from '~/server/db';
import { seasons } from '~/server/db/schema/seasons';
import { baseEventTribes, baseEventCastaways, baseEvents, episodes } from '~/server/db/schema/episodes';
import { tribes } from '~/server/db/schema/tribes';
import { type CastawayDetails, castaways, type TribeEp } from '~/server/db/schema/castaways';

export const CastawayDetailsSelect = {
  id: castaways.id,
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
    job: castaways.job,
    season: seasons.name,
  }
};

export async function getCastaways(seasonName: string, castawayName?: string): Promise<CastawayDetails[]> {
  const rows = await db
    .select(CastawayDetailsSelect)
    .from(castaways)
    .innerJoin(baseEventCastaways, eq(baseEventCastaways.reference, castaways.id))
    .innerJoin(baseEventTribes, eq(baseEventTribes.event, baseEventCastaways.event))
    .innerJoin(tribes, eq(tribes.id, baseEventTribes.reference))
    .innerJoin(baseEvents, eq(baseEvents.id, baseEventTribes.event))
    .innerJoin(episodes, eq(episodes.id, baseEvents.episode))
    .innerJoin(seasons, eq(seasons.id, castaways.season))
    .where(and(
      eq(seasons.name, seasonName),
      eq(baseEvents.eventName, 'tribeUpdate'),
      or(eq(castaways.name, castawayName ?? castaways.name),
        eq(castaways.shortName, castawayName ?? castaways.shortName))))
    .orderBy(asc(episodes.number));

  const castawaysWithTribes = rows.reduce((acc, row) => {
    const castaway = acc[row.name] ?? {
      id: row.id,
      name: row.name,
      photo: row.photo,
      tribes: [] as TribeEp[],
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

// remaining castaways are the ones that haven't been eliminated
export async function getRemainingCastaways(seasonName: string) {
  return await db
    .select({
      id: castaways.id,
      name: castaways.name,
      more: { shortName: castaways.shortName }
    })
    .from(castaways)
    .innerJoin(seasons, eq(seasons.id, castaways.season))
    .where(and(
      eq(seasons.name, seasonName),
      notExists(db
        .select({ id: baseEventCastaways.reference })
        .from(baseEventCastaways)
        .innerJoin(baseEvents, eq(baseEvents.id, baseEventCastaways.event))
        .where(and(
          eq(baseEventCastaways.reference, castaways.id),
          inArray(baseEvents.eventName, ['elim', 'noVoteExit'])))))) as CastawayDetails[];
}

