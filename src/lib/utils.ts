import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type baseEventPredictionRulesSchema } from '~/server/db/schema/baseEvents';
import { type BaseEventPredictionRules, type BaseEventPredictionRulesSchema } from '~/types/leagues';
import { defaultPredictionRules, ScoringBaseEventNames } from '~/lib/events';
import { type PredictionTiming } from '~/types/events';

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
    Object.entries(tribeUpdates[i]).forEach(([tribeUpdateName, update]) => {
      if (tribeUpdateName === tribeName) {
        update.castaways.forEach((castaway) => onTribe.add(castaway));
      } else {
        update.castaways.forEach((castaway) => onTribe.delete(castaway));
      }
    });
  }

  return [...onTribe];
}

/**
  * Determine if a prediction is correct based on tribe and castaway of the event and prediction
  * @param prediction the referenceId and referenceType of the prediction
  * @param event the referenceId and referenceType of the event result
  * @param tribeUpdates The tribe updates for the season
  * @param eliminations The eliminations for the season
  * @returns true if the prediction is correct, false otherwise
  */
export function isPredictionCorrect(
  prediction: { referenceName: string, referenceType: 'Castaway' | 'Tribe' },
  event: { referenceName: string, referenceType: 'Castaway' | 'Tribe' },
  tribeUpdates: Awaited<ReturnType<typeof SEASON_QUERIES.getTribesTimeline>>,
  eliminations: Awaited<ReturnType<typeof SEASON_QUERIES.getEliminations>>,
  episodeNumber: EpisodeNumber
) {
  if (prediction.referenceType === event.referenceType) {
    return prediction.referenceName === event.referenceName;
  }

  if (event.referenceType === 'Tribe') {
    const castawayOnTribe = findTribeCastaways(
      tribeUpdates, eliminations, event.referenceName, episodeNumber
    ).includes(prediction.referenceName);
    return castawayOnTribe;
  }

  if (prediction.referenceType === 'Tribe') {
    const castawayOnTribe = findTribeCastaways(
      tribeUpdates, eliminations, prediction.referenceName, episodeNumber
    ).includes(event.referenceName);
    return castawayOnTribe;
  }

  return false;
}

export function basePredictionRulesSchemaToObject(
  schema: BaseEventPredictionRulesSchema | null
): BaseEventPredictionRules {
  const rules: BaseEventPredictionRules = defaultPredictionRules;

  // If no schema is provided, return the default rules 
  // (all disabled with default points and timing values ready)
  if (!schema) return rules;

  for (const eventName of ScoringBaseEventNames) {
    // Construct keys for the event based on the event name
    // Lots of TypeScript magic here but it should be safe
    const enabledKey = `${eventName}Prediction` as keyof BaseEventPredictionRulesSchema;
    const pointsKey = `${eventName}PredictionPoints` as keyof BaseEventPredictionRulesSchema;
    const timingKey = `${eventName}PredictionTiming` as keyof BaseEventPredictionRulesSchema;

    if (schema[enabledKey]) {
      rules[eventName] = {
        enabled: schema[enabledKey] as boolean,
        points: (schema[pointsKey] ?? 0) as number,
        timing: (schema[timingKey] ?? []) as PredictionTiming[],
      };

    } else {
      rules[eventName].enabled = false;
    }
  }

  return rules;
}

export function basePredictionRulesObjectToSchema(
  rules: BaseEventPredictionRules
) {
  const schema: Record<string, boolean | number | PredictionTiming[]> = {};

  for (const eventName of ScoringBaseEventNames) {
    const rule = rules[eventName];

    const enabledKey = `${eventName}Prediction` as keyof BaseEventPredictionRulesSchema;
    const pointsKey = `${eventName}PredictionPoints` as keyof BaseEventPredictionRulesSchema;
    const timingKey = `${eventName}PredictionTiming` as keyof BaseEventPredictionRulesSchema;

    schema[enabledKey] = rule.enabled;
    schema[pointsKey] = rule.points;
    schema[timingKey] = rule.timing;
  }

  return schema as BaseEventPredictionRulesSchema;
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
