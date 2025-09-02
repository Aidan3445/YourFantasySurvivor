'use server';

import { eq } from 'drizzle-orm';
import { systemAdminAuth } from '~/lib/auth';
import { db } from '~/server/db';
import { type NewCastaway } from '~/types/castaways';
import { type NewSeason } from '~/types/deprecated/seasons';
import { type NewTribe } from '~/types/deprecated/tribes';
import { baseEventReferenceSchema, baseEventSchema } from '~/server/db/schema/baseEvents';
import { castawaySchema } from '~/server/db/schema/castaways';
import { episodeSchema } from '~/server/db/schema/episodes';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { tribeSchema } from '~/server/db/schema/tribes';

/**
  * Import contestants from fandom
  * @param season - the season to import
  * @param castaways - the castaways to import
  * @param tribes - the tribes to import
  */
export async function importContestants(
  season: NewSeason,
  castaways: NewCastaway[],
  tribes: NewTribe[]
) {
  const { userId } = await systemAdminAuth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Create transaction
  await db.transaction(async (trx) => {
    try {
      const { seasonName, premiereDate } = season;
      // Insert season
      const seasonId = await trx
        .insert(seasonsSchema)
        .values({ seasonName, premiereDate: premiereDate.toUTCString() })
        .returning({ seasonId: seasonsSchema.seasonId })
        .then((seasons) => seasons[0]?.seasonId);
      if (!seasonId) throw new Error('Failed to insert season');

      // Insert castaways
      const insertedCastaways = await trx
        .insert(castawaySchema)
        .values(castaways.map((castaway) => ({ ...castaway, seasonId })))
        .returning({ castawayId: castawaySchema.castawayId, fullName: castawaySchema.fullName });

      // Insert tribes
      const insertedTribes = await trx
        .insert(tribeSchema)
        .values(tribes.map((tribe) => ({ ...tribe, seasonId })))
        .returning({ tribeId: tribeSchema.tribeId, tribeName: tribeSchema.tribeName });

      // Insert first episode
      const episodeId = await trx
        .insert(episodeSchema)
        .values({
          episodeNumber: 1,
          title: season.premiereTitle,
          airDate: premiereDate.toUTCString(),
          runtime: 120,
          seasonId,
        })
        .returning({ episodeId: episodeSchema.episodeId })
        .then((episodes) => episodes[0]!.episodeId);

      // Assign castaways to tribes
      for (const tribe of insertedTribes) {
        const tribeUpdateId = await trx
          .insert(baseEventSchema)
          .values({
            episodeId,
            eventName: 'tribeUpdate',
            keywords: ['Initial Tribes'],
          })
          .returning({ eventId: baseEventSchema.baseEventId })
          .then((events) => events[0]!.eventId);

        await trx
          .insert(baseEventReferenceSchema)
          .values({
            baseEventId: tribeUpdateId,
            referenceType: 'Tribe',
            referenceId: tribe.tribeId,
          });

        const thisTribeMembers = insertedCastaways
          .filter((castaway) => castaways
            .find((c) => c.fullName === castaway.fullName)?.tribe === tribe.tribeName);

        for (const castaway of thisTribeMembers) {
          await trx
            .insert(baseEventReferenceSchema)
            .values({
              baseEventId: tribeUpdateId,
              referenceType: 'Castaway',
              referenceId: castaway.castawayId,
            });
        }
      }


    } catch (error) {
      console.error('Error importing castaways:', error);
      trx.rollback();
      throw new Error('Failed to import castaways please try again');
    }
  });
}

/**
  * Import episode from fandom
  * @param seasonName - the season to import to
  * @param episode - the episode to import
  */
export async function importEpisode(
  seasonName: string,
  episode: { episodeNumber: number, episodeTitle: string, episodeAirDate: string }
) {
  const { userId } = await systemAdminAuth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const seasonId = await db
    .select({ seasonId: seasonsSchema.seasonId })
    .from(seasonsSchema)
    .where(eq(seasonsSchema.seasonName, seasonName))
    .then((seasons) => seasons[0]?.seasonId);
  if (!seasonId) throw new Error('Season not found');

  await db
    .insert(episodeSchema)
    .values({
      episodeNumber: episode.episodeNumber,
      title: episode.episodeTitle.replaceAll('"', ''),
      airDate: episode.episodeAirDate,
      seasonId,
    });
}
