import 'server-only';
import { createTable } from './createTable';
import { seasonsSchema } from './seasons';
import { integer, serial, varchar, smallint, unique } from 'drizzle-orm/pg-core';

export const castawaysSchema = createTable(
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
    seasonId: integer('season_id').references(() => seasonsSchema.seasonId, { onDelete: 'cascade' }).notNull(),
  },
  // unique name and shortname for each season
  (table) => [
    unique().on(table.fullName, table.seasonId),
    unique().on(table.shortName, table.seasonId)
  ]
);

