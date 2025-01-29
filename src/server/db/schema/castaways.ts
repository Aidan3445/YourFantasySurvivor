import { createTable } from './createTable';
import { seasons } from './seasons';
import { integer, serial, varchar, smallint, unique } from 'drizzle-orm/pg-core';

export const castaways = createTable(
  'castaway',
  {
    castawayId: serial('castaway_id').notNull().primaryKey(),
    name: varchar('name', { length: 64 }).notNull(),
    shortName: varchar('short_name', { length: 16 }).notNull(),
    age: smallint('age').notNull(),
    hometown: varchar('hometown', { length: 128 }).notNull().default('Unknown'),
    residence: varchar('residence', { length: 128 }).notNull().default('Unknown'),
    job: varchar('job', { length: 128 }).notNull().default('Unknown'),
    photo: varchar('photo', { length: 512 }).notNull().default('https://media.istockphoto.com/id/1980276924/vector/no-photo-thumbnail-graphic-element-no-found-or-available-image-in-the-gallery-or-album-flat.jpg?s=612x612&w=0&k=20&c=ZBE3NqfzIeHGDPkyvulUw14SaWfDj2rZtyiKv3toItk='),
    season: integer('season_id').references(() => seasons.seasonId, { onDelete: 'cascade' }).notNull(),
  },
  // unique name and shortname for each season
  (table) => [
    unique().on(table.name, table.season),
    unique().on(table.shortName, table.season)
  ]
);
export type Castaway = typeof castaways.$inferSelect;
export type CastawayInsert = Omit<typeof castaways.$inferInsert, 'castawayId'>;

export type TribeEp = {
  name: string;
  color: string;
  episode: number;
};

export type CastawayDetails = {
  id: number;
  name: string;
  photo: string;
  tribes: TribeEp[];
  startingTribe: TribeEp;
  more: {
    shortName: string;
    age: number;
    hometown: string;
    residence: string;
    job: string;
    season: string;
  };
};
