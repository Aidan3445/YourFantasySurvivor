import { pgEnum, varchar } from 'drizzle-orm/pg-core';
import { TimingOptions, ReferenceOptions } from '~/types/sharedEvents';

export const reference = pgEnum('event_reference', ReferenceOptions);

export const notes = (name: string) => varchar(name, { length: 256 }).array();

export const timing = pgEnum('event_timing', TimingOptions);

export const keywords = (name: string) => varchar(name, { length: 32 }).array();
