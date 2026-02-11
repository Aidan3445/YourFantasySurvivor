import 'server-only';
import { db } from '~/server/db';
import { and, arrayOverlaps, eq, gt, or, exists, sql, isNotNull, not } from 'drizzle-orm';
import { getActiveTimings } from '~/lib/episodes';
import { baseEventPredictionRulesSchema, baseEventPredictionSchema } from '~/server/db/schema/baseEvents';
import { customEventPredictionSchema, customEventRuleSchema } from '~/server/db/schema/customEvents';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { leagueSchema } from '~/server/db/schema/leagues';
import getCurrentSeasons from '~/services/seasons/query/currentSeasons';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import { type ScoringBaseEventName, type PredictionTiming } from '~/types/events';
import { type Episode } from '~/types/episodes';

/**
  * Get users who need to be sent reminders for predictions
  * @returns Array of user IDs needing reminders per active season
  */
export async function getUsersNeedingReminders() {
  const currentSeasons = await getCurrentSeasons();

  const results = await Promise.all(
    currentSeasons.map(async (season) => {
      const keyEpisodes = await getKeyEpisodes(season.seasonId);
      if (!keyEpisodes.nextEpisode) return null;

      const activeTimings = getActiveTimings({
        keyEpisodes,
        leagueStatus: 'Active',
        startWeek: null,
      });
      if (activeTimings.length === 0) return null;

      const userIds = await db
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
            eq(leagueSchema.seasonId, season.seasonId),
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

      if (userIds.length === 0) return null;

      return [keyEpisodes.nextEpisode, userIds] as const;
    }),
  );

  return results.filter((r): r is readonly [Episode, string[]] => r !== null);
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
