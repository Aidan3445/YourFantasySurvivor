import { type BaseEventPredictionRules, type BaseEventPredictionRulesSchema } from '~/types/leagues';
import { defaultPredictionRules, ScoringBaseEventNames } from '~/lib/events';
import { type Eliminations, type PredictionTiming } from '~/types/events';
import { type TribesTimeline } from '~/types/tribes';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
  * Find the castaways on a tribe at a given episode
  * @param tribeUpdates The tribe updates for the season
  * @param eliminations The eliminations for the season
  * @param tribeId The tribe to find castaways for
  * @param episodeNumber The episode to find castaways for
  * @returns The castaways on the tribe at the given episode
  */
export function findTribeCastaways(
  tribeUpdates: TribesTimeline,
  eliminations: Eliminations,
  tribeId: number,
  episodeNumber: number) {
  const onTribe = new Set(tribeUpdates[1]?.[tribeId] ?? []);

  for (let i = 2; i <= episodeNumber; i++) {
    eliminations[i - 1]?.forEach((castaway) => onTribe.delete(castaway.castawayId));
    if (!tribeUpdates[i]) continue;
    Object.entries(tribeUpdates[i]!).forEach(([tribeUpdateId, update]) => {
      const tuid = parseInt(tribeUpdateId, 10);
      if (tuid === tribeId) {
        update.forEach((castaway) => onTribe.add(castaway));
      } else {
        update.forEach((castaway) => onTribe.delete(castaway));
      }
    });
  }

  return Array.from(onTribe);
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

export function camelToTitle(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}

export function getHslIndex(index: number, total: number) {
  return `hsl(${300 * index / total}, ${index & 1 ? '50%' : '80%'}, 50%)`;
}
