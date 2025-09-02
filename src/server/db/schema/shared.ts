import { pgEnum, varchar } from 'drizzle-orm/pg-core';
import { ReferenceTypes } from '~/lib/events';
import { TimingOptions } from '~/types/deprecated/sharedEvents';

export const reference = pgEnum('event_reference', ReferenceTypes);

export const timing = pgEnum('event_timing', TimingOptions);

export const label = (name: string) => varchar(name, { length: 64 });

export const notes = (name: string) => varchar(name, { length: 256 }).array();
