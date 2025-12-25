import 'server-only';

import { createTable } from '~/server/db/schema/createTable';
import { seasonSchema } from '~/server/db/schema/seasons';
import { integer, serial, smallint, unique, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const castawaySchema = createTable(
  'castaway',
  {
    castawayId: serial('castaway_id').notNull().primaryKey(),
    fullName: varchar('full_name', { length: 64 }).notNull(),
    shortName: varchar('short_name', { length: 16 }).notNull(),
    age: smallint('age').notNull(),
    hometown: varchar('hometown', { length: 128 }).notNull().default('Unknown'),
    residence: varchar('residence', { length: 128 }).notNull().default('Unknown'),
    occupation: varchar('job', { length: 128 }).notNull().default('Unknown'),
    imageUrl: varchar('photo', { length: 512 }).notNull().default('https://media.istockphoto.com/id/1980276924/vector/no-photo-thumbnail-graphic-element-no-found-or-available-image-in-the-gallery-or-album-flat.jpg?s=612x612&w=0&k=20&c=ZBE3NqfzIeHGDPkyvulUw14SaWfDj2rZtyiKv3toItk='),
    // null seasonId for Jeff/Production (or like Rob and Sandra on Island of the Islands)
    seasonId: integer('season_id').references(() => seasonSchema.seasonId, { onDelete: 'cascade' }),
    previouslyOn: varchar('previously_on', { length: 64 }).array().notNull().default(sql`ARRAY[]::varchar[]`),
  },
  // unique name and shortname for each season
  (table) => [
    unique('cast_fullname_season_unq').on(table.fullName, table.seasonId),
    unique('cast_shortname_season_unq').on(table.shortName, table.seasonId)
  ]
);

