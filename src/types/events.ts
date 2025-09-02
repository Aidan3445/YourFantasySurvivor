import type { EventSources, EventTypes, ReferenceTypes, BaseEventNames, ScoringBaseEventNames, EliminationEventNames, PredictionTimings } from '~/lib/events';

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
  sourceId: number; // either the seasonId or leagueId depending on eventSource
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
