import z from 'zod';
import {
  type PredictionTimings, ReferenceTypes, BaseEventNames,
  type ScoringBaseEventNames, type EliminationEventNames, EventSources, type EventTypes
} from '~/lib/events';
import { type Tribe } from '~/types/tribes';
import { type EnrichedCastaway } from '~/types/castaways';
import { type LeagueMember } from '~/types/leagueMembers';

export type EventSource = (typeof EventSources)[number];
export type EventType = (typeof EventTypes)[number];
export type ReferenceType = (typeof ReferenceTypes)[number];

export type EventReference = {
  type: ReferenceType;
  id: number;
};

export type Event = {
  eventSource: EventSource;
  eventType: EventType;
  episodeNumber: number; // episode that the event occurred in
  eventId: number;
  eventName: string;
  label: string | null;
  notes: string[] | null;
  episodeId: number;
  customEventRuleId?: number;
};

export type EventWithReferences = Event & {
  references: EventReference[];
};

export type EnrichedEvent = EventWithReferences & {
  points: number | null;
  referenceMap: {
    tribe: Tribe | null;
    pairs: {
      castaway: EnrichedCastaway;
      member: LeagueMember | null;
    }[];
  }[];
};

export type ScoringBaseEventName = typeof ScoringBaseEventNames[number];
export type EliminationEventName = typeof EliminationEventNames[number];
export type BaseEventName = typeof BaseEventNames[number];

export type Elimination = {
  eventId: number;
  castawayId: number;
};

export type Eliminations = Elimination[][]

export type PredictionTiming = (typeof PredictionTimings)[number];

export type Prediction = {
  predictionId: number;
  eventSource: EventSource;
  episodeNumber: number; // episode that the prediction was made in
  eventName: string;
  predictionMakerId: number;
  referenceId: number;
  referenceType: ReferenceType;
  eventId: number | null; // eventId that the prediction is linked to, if any
  bet: number | null;
  hit: boolean | null;
};

export type PredictionWithEvent = Prediction & {
  points: number;
  event: EventWithReferences | undefined;
  timing: PredictionTiming[];
};

export type EnrichedPrediction = {
  event: EnrichedEvent;
  points: number;
  hits: {
    member: LeagueMember
    hit: boolean;
    bet: number | null;
    reference: {
      type: ReferenceType;
      name: string;
      color: string;
    };
  }[];
  misses: {
    member: LeagueMember
    reference: {
      type: ReferenceType;
      name: string;
      color: string;
    } | null;
    hit: boolean;
    bet: number | null;
  }[];
};

/**
  * Record<episodeNumber, Record<eventId, EventWithReferences>>
  */
export type Events = Record<number, Record<number, EventWithReferences>>;

/**
  * Record<episodeNumber, Record<eventName, Prediction[]>>
  */
export type Predictions = Record<number, Record<string, Prediction[]>>;

export type CustomEvents = {
  events: Events;
  predictions: Predictions;
};

export const BaseEventInsertZod = z.object({
  episodeId: z.coerce.number().int().min(0),
  eventName: z.enum(BaseEventNames),
  label: z.string().max(64).nullable().optional(),
  notes: z.string().array().max(10).nullable().optional(),
  references: z.object({
    type: z.enum(ReferenceTypes),
    id: z.coerce.number().int().min(0),
  }).array().min(1)
}).refine((data) => {
  // If eventName is 'tribeUpdate', we need at least one tribe and at least one castaway
  if (data.eventName === 'tribeUpdate') {
    const hasTribe = data.references.some((ref) => ref.type === 'Tribe');
    const hasCastaway = data.references.some((ref) => ref.type === 'Castaway');
    return hasTribe && hasCastaway;
  }
  return true;
}, { message: 'Tribe Update events must reference at least one tribe and one castaway' });
export type BaseEventInsert = z.infer<typeof BaseEventInsertZod>;

export const CustomEventInsertZod = z.object({
  episodeId: z.coerce.number().int().min(0),
  customEventRuleId: z.coerce.number().int().min(0),
  label: z.string().max(64).nullable().optional(),
  notes: z.string().array().max(10).nullable().optional(),
  references: z.object({
    type: z.enum(ReferenceTypes),
    id: z.coerce.number().int().min(0),
  }).array().min(1)
});
export type CustomEventInsert = z.infer<typeof CustomEventInsertZod>;

export const PredictionInsertZod = z.object({
  eventSource: z.enum(EventSources),
  referenceId: z.coerce.number().int().min(0),
  referenceType: z.enum(ReferenceTypes),
  eventName: z.string().max(64),
  bet: z.coerce.number().int().min(0).nullable(),
});
export type PredictionInsert = z.infer<typeof PredictionInsertZod>;

export type MakePrediction = {
  eventSource: EventSource;
  eventName: string;
  label: string;
  description: string;
  points: number;
  referenceTypes: ReferenceType[];
  timing: PredictionTiming[];
  predictionMade: Prediction | null;
  shauhinEnabled?: boolean;
}

/**
  * Record<ReferenceType | 'Member', Record<referneceId, runningScores[]>>
  */
export type Scores = Record<ReferenceType | 'Member', Record<number, number[]>>;
/**
  * Record<memberId, streakCount>
  */
export type Streaks = Record<number, number>;
