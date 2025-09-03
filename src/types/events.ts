import z from 'zod';
import {
  type EventSources, type PredictionTimings, ReferenceTypes, BaseEventNames,
  type ScoringBaseEventNames, type EliminationEventNames, type EventTypes
} from '~/lib/events';

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
  episodeNumber: number;
  eventId: number;
  eventName: string;
  label: string | null;
  notes: string[] | null;
};

export type EventWithReferences = Event & {
  references: EventReference[];
};

export type ScoringBaseEventName = typeof ScoringBaseEventNames[number];
export type EliminationEventName = typeof EliminationEventNames[number];
export type BaseEventName = typeof BaseEventNames[number];

export type Elimination = {
  eventId: number;
  castawayId: number;
};

export type PredictionTiming = (typeof PredictionTimings)[number];

export type Prediction = {
  eventSource: EventSource;
  episodeNumber: number;
  predictionMakerId: number;
  eventId: number;
  referenceId: number;
  referenceType: ReferenceType;
  bet: number;
  hit: boolean | null;
};

export const BaseEventInsertZod = z.object({
  episodeId: z.number().int().min(0),
  eventName: z.enum(BaseEventNames),
  label: z.string().max(64).nullable().optional(),
  notes: z.string().array().max(10).nullable().optional(),
  referenceType: z.enum(ReferenceTypes),
  references: z.number().array().min(1),
  updateTribe: z.number().int().min(0).optional(),
});
export type BaseEventInsert = z.infer<typeof BaseEventInsertZod>;
