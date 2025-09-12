import { pgEnum, varchar } from 'drizzle-orm/pg-core';
import { PredictionTimings, ReferenceTypes } from '~/lib/events';

export const reference = pgEnum('event_reference', ReferenceTypes);

export const timing = pgEnum('event_timing', PredictionTimings);

export const label = (name: string) => varchar(name, { length: 64 });

export const notes = (name: string) => varchar(name, { length: 256 }).array();
