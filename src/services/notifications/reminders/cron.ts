import 'server-only';
import { db } from '~/server/db';
import { episodeSchema } from '~/server/db/schema/episodes';
import { seasonSchema } from '~/server/db/schema/seasons';
import { and, between, eq, isNotNull } from 'drizzle-orm';
import { scheduleEpisodeNotifications } from '~/services/notifications/reminders/episode';
import { type Episode } from '~/types/episodes';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { scheduleDraftReminderNotification } from '~/lib/qStash';

/**
  * Cron job to schedule notifications for all episodes airing in the next week
  */
export async function scheduleUpcomingEpisodeNotifications() {
  const now = new Date();
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Get all episodes airing in the next 7 days
  const episodes: Episode[] = await db
    .select({
      episodeId: episodeSchema.episodeId,
      episodeNumber: episodeSchema.episodeNumber,
      title: episodeSchema.title,
      airDate: episodeSchema.airDate,
      runtime: episodeSchema.runtime,
      seasonId: episodeSchema.seasonId,
      seasonName: seasonSchema.name,
      isMerge: episodeSchema.isMerge,
      isFinale: episodeSchema.isFinale,
    })
    .from(episodeSchema)
    .innerJoin(seasonSchema, eq(episodeSchema.seasonId, seasonSchema.seasonId))
    .where(between(episodeSchema.airDate, now.toISOString(), oneWeek.toISOString()))
    .then(rows => rows.map(row => ({
      ...row,
      airDate: new Date(`${row.airDate} Z`),
      airStatus: 'Upcoming'
    })));

  const scheduled: (string | null)[] = await Promise.all(episodes.map(async (episode) => {
    try {
      await scheduleEpisodeNotifications(episode);
      return episode.episodeId.toString();
    }
    catch (e) {
      console.error(`Failed to schedule notifications for episode ${episode.episodeId} - ${episode.title}`, e);
      return null;
    }
  }));

  scheduled.filter(Boolean);

  console.log(`Cron: scheduled ${scheduled.length} notifications for ${episodes.length} episodes`);

  return { episodes: episodes.length, notifications: scheduled.length };
}

/**
  * Cron job to schedule notifications for upcoming drafts within the next week
  */
export async function scheduleUpcomingDraftNotifications() {
  const now = new Date();
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const leagues = await db
    .select({
      leagueId: leagueSchema.leagueId, 
      leagueHash: leagueSchema.hash, 
      leagueName: leagueSchema.name,
      draftDate: leagueSettingsSchema.draftDate,
    })
    .from(leagueSchema)
    .innerJoin(leagueSettingsSchema, eq(leagueSchema.leagueId, leagueSettingsSchema.leagueId))
    .where(and(
      eq(leagueSchema.status, 'Predraft'),
      isNotNull(leagueSettingsSchema.draftDate),
      between(leagueSettingsSchema.draftDate, now.toISOString(), oneWeek.toISOString())
    ))
    .then(rows => rows.map(row => ({
      leagueId: row.leagueId,
      leagueHash: row.leagueHash,
      leagueName: row.leagueName,
      draftDate: new Date(`${row.draftDate} Z`).toISOString(),
    })));

    const scheduled: (string | null)[] = await Promise.all(leagues.map(async (league) => {
      try {
        const messageId = await scheduleDraftReminderNotification(league);
        return messageId;
      }
      catch (e) {
        console.error(`Failed to schedule notifications for league ${league.leagueId} - ${league.leagueName}`, e);
        return null;
      }
    }));

    scheduled.filter(Boolean);

    console.log(`Cron: scheduled ${scheduled.length} notifications for ${leagues.length} upcoming drafts`);
}
