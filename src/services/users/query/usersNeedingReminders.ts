import 'server-only';
import { db } from '~/server/db';
import { and, arrayOverlaps, eq, gt, or, exists, sql, isNotNull, not } from 'drizzle-orm';
import { getActiveTimings } from '~/lib/episodes';
import { baseEventPredictionRulesSchema, baseEventPredictionSchema } from '~/server/db/schema/baseEvents';
import { customEventPredictionSchema, customEventRuleSchema } from '~/server/db/schema/customEvents';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSchema } from '~/server/db/schema/leagues';
import { type ScoringBaseEventName, type PredictionTiming } from '~/types/events';
import { type Episode } from '~/types/episodes';
import { episodeSchema } from '~/server/db/schema/episodes';

/**
  * Get users who need to be sent reminders for predictions
  * @param Episode which episode's predictions to check for
  * @returns Array of user IDs needing reminders per active season
  */
export async function getUsersNeedingReminders(episode: Episode) {
  const hasMerge = await db
    .select({ mergeEpisode: sql`1` })
    .from(episodeSchema)
    .where(and(
      eq(episodeSchema.seasonId, episode.seasonId),
      eq(episodeSchema.isMerge, true),
      gt(episodeSchema.episodeNumber, episode.episodeNumber),
    ))
    .then(res => res[0] ? true : false);
  const keyEpisodes = {
    previousEpisode: null,
    nextEpisode: episode,
    mergeEpisode: hasMerge ? episode : null,
  };
  // This will ignore draft only predictions, including the first week when draft predictions
  // are still available, but given that this only goes out to active leagues, users should have
  // had the chance to make those predictions already.
  const activeTimings = getActiveTimings({
    keyEpisodes,
    leagueStatus: 'Active',
    startWeek: null,
  });
  if (activeTimings.length === 0) return [];

  return await db
    .selectDistinct({
      userId: leagueMemberSchema.userId,
    })
    .from(leagueMemberSchema)
    .innerJoin(
      leagueSchema,
      eq(leagueSchema.leagueId, leagueMemberSchema.leagueId),
    )
    .where(
      and(
        eq(leagueSchema.seasonId, episode.seasonId),
        eq(leagueSchema.status, 'Active'),
        isNotNull(leagueMemberSchema.draftOrder),
        or(
          existsUnmadeBasePrediction(
            activeTimings,
            keyEpisodes.nextEpisode.episodeId,
          ),
          existsUnmadeCustomPrediction(activeTimings),
        ),
      ),
    )
    .then((res) => res.map((r) => r.userId));
}


// join helpers
const existsUnmadeBasePrediction = (activeTimings: PredictionTiming[], episodeId: number) => {
  const baseRuleToName: Record<string, ScoringBaseEventName> = {
    advFoundPrediction: 'advFound',
    advPlayPrediction: 'advPlay',
    badAdvPlayPrediction: 'badAdvPlay',
    advElimPrediction: 'advElim',
    spokeEpTitlePrediction: 'spokeEpTitle',
    tribe1stPrediction: 'tribe1st',
    tribe2ndPrediction: 'tribe2nd',
    indivWinPrediction: 'indivWin',
    indivRewardPrediction: 'indivReward',
    finalistsPrediction: 'finalists',
    fireWinPrediction: 'fireWin',
    soleSurvivorPrediction: 'soleSurvivor',
    elimPrediction: 'elim',
  };

  return exists(
    db
      .select({ one: sql`1` })
      .from(baseEventPredictionRulesSchema)
      .where(
        and(
          eq(baseEventPredictionRulesSchema.leagueId, leagueSchema.leagueId),
          or(
            ...Object.entries(baseRuleToName).map(([ruleField, baseEventName]) => {
              return and(
                eq((baseEventPredictionRulesSchema as never)[ruleField], true),
                gt((baseEventPredictionRulesSchema as never)[`${ruleField}Points`], 0),
                arrayOverlaps(
                  (baseEventPredictionRulesSchema as never)[`${ruleField}Timing`],
                  activeTimings
                ),
                not(
                  exists(
                    db
                      .select({ one: sql`1` })
                      .from(baseEventPredictionSchema)
                      .where(
                        and(
                          eq(baseEventPredictionSchema.memberId, leagueMemberSchema.memberId),
                          eq(baseEventPredictionSchema.episodeId, episodeId),
                          eq(baseEventPredictionSchema.baseEventName, baseEventName)
                        )
                      )
                  )
                )
              );
            })
          )
        )
      )
  );
};

const existsUnmadeCustomPrediction = (activeTimings: PredictionTiming[]) => {
  return exists(
    db
      .select({ one: sql`1` })
      .from(customEventRuleSchema)
      .where(
        and(
          eq(customEventRuleSchema.leagueId, leagueSchema.leagueId),
          eq(customEventRuleSchema.eventType, 'Prediction'),
          arrayOverlaps(customEventRuleSchema.timing, activeTimings),
          not(
            exists(
              db
                .select({ one: sql`1` })
                .from(customEventPredictionSchema)
                .where(
                  and(
                    eq(customEventPredictionSchema.memberId, leagueMemberSchema.memberId),
                    eq(customEventPredictionSchema.customEventRuleId, customEventRuleSchema.customEventRuleId)
                  )
                )
            )
          )
        )
      )
  );
};
