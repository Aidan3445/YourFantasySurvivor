import { pgTable, index, foreignKey, integer, varchar, json, serial, date, uniqueIndex, smallint, timestamp, boolean } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"



export const yfs_league_member = pgTable("yfs_league_member", {
	league_id: integer("league_id").primaryKey().notNull().references(() => yfs_league.league_id),
	user_id: varchar("user_id", { length: 64 }).notNull(),
	color: varchar("color", { length: 7 }).notNull(),
	display_name: varchar("display_name", { length: 64 }).notNull(),
	predictions: integer("predictions").default('RRAY[').array().notNull(),
	survivor_updates: json("survivor_updates"),
},
(table) => {
	return {
		league_member_user_idx: index("league_member_user_idx").on(table.user_id),
	}
});

export const yfs_league = pgTable("yfs_league", {
	league_id: serial("league_id").primaryKey().notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	password: varchar("password", { length: 64 }).notNull(),
	season_id: integer("season_id").notNull().references(() => yfs_season.season_id),
	owner_id: varchar("owner_id", { length: 64 }).notNull(),
	admin_ids: varchar("admin_ids", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	settings: json("settings").default({}).notNull(),
	rules: json("rules"),
	episodes: json("episodes"),
},
(table) => {
	return {
		league_owner_idx: index("league_owner_idx").on(table.owner_id),
	}
});

export const yfs_season = pgTable("yfs_season", {
	season_id: serial("season_id").primaryKey().notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	premier_date: date("premier_date").notNull(),
	finale_date: date("finale_date"),
});

export const yfs_tribe = pgTable("yfs_tribe", {
	tribe_id: serial("tribe_id").primaryKey().notNull(),
	name: varchar("name", { length: 16 }).notNull(),
	color: varchar("color", { length: 7 }).notNull(),
	season: integer("season").notNull().references(() => yfs_season.season_id),
},
(table) => {
	return {
		tribe_name_idx: uniqueIndex("tribe_name_idx").on(table.name),
		tribe_season_idx: index("tribe_season_idx").on(table.season),
	}
});

export const yfs_castaway = pgTable("yfs_castaway", {
	castaway_id: serial("castaway_id").primaryKey().notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	short_name: varchar("short_name", { length: 16 }).notNull(),
	age: smallint("age").notNull(),
	hometown: varchar("hometown", { length: 128 }).default('Unknown'::character varying).notNull(),
	residence: varchar("residence", { length: 128 }).default('Unknown'::character varying).notNull(),
	job: varchar("job", { length: 128 }).default('Unknown'::character varying).notNull(),
	photo: varchar("photo", { length: 512 }).default('https://media.istockphoto.com/id/1980276924/vector/no-photo-thumbnail-graphic-element-no-found-or-available-image-in-the-gallery-or-album-flat.jpg?s=612x612&w=0&k=20&c=ZBE3NqfzIeHGDPkyvulUw14SaWfDj2rZtyiKv3toItk='::character varying).notNull(),
	season: integer("season").notNull().references(() => yfs_season.season_id),
},
(table) => {
	return {
		castaway_season_idx: index("castaway_season_idx").on(table.season),
	}
});

export const yfs_episode = pgTable("yfs_episode", {
	episode_id: serial("episode_id").primaryKey().notNull(),
	number: smallint("number").notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	air_date: timestamp("air_date", { mode: 'string' }).notNull(),
	runtime: smallint("runtime").default(90),
	season: integer("season").notNull().references(() => yfs_season.season_id),
	e_advFound: json("e_advFound"),
	e_advPlay: json("e_advPlay"),
	e_badAdvPlay: json("e_badAdvPlay"),
	e_advElim: json("e_advElim"),
	e_spokeEpTitle: json("e_spokeEpTitle"),
	e_tribe1st: json("e_tribe1st"),
	e_tribe2nd: json("e_tribe2nd"),
	e_indivWin: json("e_indivWin"),
	e_indivReward: json("e_indivReward"),
	e_finalists: json("e_finalists"),
	e_fireWin: json("e_fireWin"),
	e_soleSurvivor: json("e_soleSurvivor"),
	e_elim: json("e_elim"),
	e_noVoteExit: json("e_noVoteExit"),
	e_tribeUpdate: json("e_tribeUpdate"),
	e_notes: json("e_notes"),
	merge: boolean("merge").default(false).notNull(),
});