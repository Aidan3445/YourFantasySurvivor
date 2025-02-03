import 'server-only';
import { sysAuth } from '../system/query';
import { db } from '~/server/db';
import { type SeasonInsert, seasons } from '~/server/db/schema/seasons';
import { eq } from 'drizzle-orm';
import { type CastawayInsert, castaways } from '~/server/db/schema/castaways';
import { type TribeInsert, tribes } from '~/server/db/schema/tribes';

export async function createSeason(newSeason: SeasonInsert) {
  const { userId, sys } = await sysAuth();
  if (!userId || !sys) throw new Error('Not authorized');

  const season = await db
    .insert(seasons)
    .values(newSeason)
    .returning({ id: seasons.seasonId });

  if (!season?.[0]) throw new Error('Failed to create season');

  return season[0].id;
}

export async function changeSeasonName(seasonId: number, seasonName: string) {
  const { userId, sys } = await sysAuth();
  if (!userId || !sys) throw new Error('Not authorized');

  const updated = await db
    .update(seasons)
    .set({ seasonName })
    .where(eq(seasons.seasonId, seasonId))
    .returning({ id: seasons.seasonId });

  if (!updated?.[0]) throw new Error('Failed to update season');

  return updated[0].id;
}

export async function changeSeasonPremierDate(seasonId: number, premierDate: Date) {
  const { userId, sys } = await sysAuth();
  if (!userId || !sys) throw new Error('Not authorized');

  const updated = await db
    .update(seasons)
    .set({ premierDate: premierDate.toUTCString() })
    .where(eq(seasons.seasonId, seasonId))
    .returning({ id: seasons.seasonId });

  if (!updated?.[0]) throw new Error('Failed to update season');

  return updated[0].id;
}

export async function changeSeasonFinaleDate(seasonId: number, finaleDate: Date) {
  const { userId, sys } = await sysAuth();
  if (!userId || !sys) throw new Error('Not authorized');

  const updated = await db
    .update(seasons)
    .set({ finaleDate: finaleDate.toUTCString() })
    .where(eq(seasons.seasonId, seasonId))
    .returning({ id: seasons.seasonId });

  if (!updated?.[0]) throw new Error('Failed to update season');

  return updated[0].id;
}

export async function deleteSeason(seasonId: number) {
  const { userId, sys } = await sysAuth();
  if (!userId || !sys) throw new Error('Not authorized');

  const deleted = await db
    .delete(seasons)
    .where(eq(seasons.seasonId, seasonId))
    .returning({ id: seasons.seasonId });

  if (!deleted?.[0]) throw new Error('Failed to delete season');

  return deleted[0].id;
}

export async function newCastaway(seasonId: number, newCastaway: CastawayInsert) {
  const { userId, sys } = await sysAuth();
  if (!userId || !sys) throw new Error('Not authorized');

  const castaway = await db
    .insert(castaways)
    .values({ ...newCastaway, season: seasonId })
    .returning({ id: castaways.castawayId });

  if (!castaway?.[0]) throw new Error('Failed to create castaway');

  return castaway[0].id;
}

export async function newTribe(seasonId: number, newTribe: TribeInsert) {
  const { userId, sys } = await sysAuth();
  if (!userId || !sys) throw new Error('Not authorized');

  const tribe = await db
    .insert(tribes)
    .values({ ...newTribe, season: seasonId })
    .returning({ id: tribes.tribeId });

  if (!tribe?.[0]) throw new Error('Failed to create tribe');

  return tribe[0].id;
}
