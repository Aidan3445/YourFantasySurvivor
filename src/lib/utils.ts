import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type seasonsService as SEASON_QUERIES } from '~/services/seasons';
import { type CastawayDetails } from '~/types/castaways';
import { type EpisodeNumber } from '~/types/episodes';
import { type BasePredictionRules, defaultPredictionRules, type PredictionEventTiming, ScoringBaseEventNames } from '~/types/events';
import { type LeagueHash } from '~/types/leagues';
import { type TribeName } from '~/types/tribes';
import { type baseEventPredictionRulesSchema } from '~/server/db/schema/baseEvents';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SWRKey = { leagueHash: LeagueHash, key: string };

/**
  * Find the castaways on a tribe at a given episode
  * @param tribeUpdates The tribe updates for the season
  * @param eliminations The eliminations for the season
  * @param tribeName The tribe to find castaways for
  * @param episodeNumber The episode to find castaways for
  * @returns The castaways on the tribe at the given episode
  */
export function findTribeCastaways(
  tribeUpdates: Awaited<ReturnType<typeof SEASON_QUERIES.getTribesTimeline>>,
  eliminations: Awaited<ReturnType<typeof SEASON_QUERIES.getEliminations>>,
  tribeName: TribeName,
  episodeNumber: EpisodeNumber) {
  const onTribe = new Set(tribeUpdates[1]?.[tribeName]?.castaways ?? []);

  for (let i = 2; i <= episodeNumber; i++) {
    eliminations[i - 1]?.forEach((castaway) => onTribe.delete(castaway));
    if (!tribeUpdates[i]) continue;
    Object.entries(tribeUpdates[i]!).forEach(([tribeUpdateName, update]) => {
      if (tribeUpdateName === tribeName) {
        update.castaways.forEach((castaway) => onTribe.add(castaway));
      } else {
        update.castaways.forEach((castaway) => onTribe.delete(castaway));
      }
    });
  }

  return [...onTribe];
}

type BaseEventPredictionSchema = typeof baseEventPredictionRulesSchema.$inferSelect;

export function basePredictionRulesSchemaToObject(
  schema: BaseEventPredictionSchema | null
): BasePredictionRules {
  const rules: BasePredictionRules = defaultPredictionRules;

  // If no schema is provided, return the default rules 
  // (all disabled with default points and timing values ready)
  if (!schema) return rules;

  for (const eventName of ScoringBaseEventNames) {
    // Construct keys for the event based on the event name
    // Lots of TypeScript magic here but it should be safe
    const enabledKey = `${eventName}Prediction` as keyof BaseEventPredictionSchema;
    const pointsKey = `${eventName}PredictionPoints` as keyof BaseEventPredictionSchema;
    const timingKey = `${eventName}PredictionTiming` as keyof BaseEventPredictionSchema;

    if (schema[enabledKey]) {
      rules[eventName] = {
        enabled: schema[enabledKey] as boolean,
        points: (schema[pointsKey] ?? 0) as number,
        timing: (schema[timingKey] ?? []) as PredictionEventTiming[],
      };

    } else {
      rules[eventName].enabled = false;
    }
  }

  return rules;
}

export function basePredictionRulesObjectToSchema(
  rules: BasePredictionRules
): BaseEventPredictionSchema {
  const schema: Record<string, boolean | number | PredictionEventTiming[]> = {};

  for (const eventName of ScoringBaseEventNames) {
    const rule = rules[eventName];

    const enabledKey = `${eventName}Prediction` as keyof BaseEventPredictionSchema;
    const pointsKey = `${eventName}PredictionPoints` as keyof BaseEventPredictionSchema;
    const timingKey = `${eventName}PredictionTiming` as keyof BaseEventPredictionSchema;

    schema[enabledKey] = rule.enabled;
    schema[pointsKey] = rule.points;
    schema[timingKey] = rule.timing;
  }

  return schema as BaseEventPredictionSchema;
}

export function castawaysByTribe(options: CastawayDetails[]): Record<string, CastawayDetails[]> {
  return options.reduce((acc, c) => {
    if (!acc[c.startingTribe.tribeName]) acc[c.startingTribe.tribeName] = [];
    acc[c.startingTribe.tribeName]!.push(c);
    return acc;
  }, {} as Record<string, CastawayDetails[]>);
}

export function getCurrentTribe(castaway?: CastawayDetails, episode?: number) {
  if (!castaway) return;

  episode ??= castaway.tribes[castaway.tribes.length - 1]?.episode;
  return [...castaway.tribes].find((t) => t.episode <= (episode ?? 0)) ?? castaway.startingTribe;
}

export function camelToTitle(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}

export function getHslIndex(index: number, total: number) {
  return `hsl(${300 * index / total}, ${index & 1 ? '50%' : '80%'}, 50%)`;
}
