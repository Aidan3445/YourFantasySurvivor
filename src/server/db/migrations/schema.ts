import { pgTable, index, varchar, smallint, date, integer, json, timestamp, uniqueIndex, boolean } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"



export const yfs_castaway = pgTable("yfs_castaway", {
	name: varchar("name", { length: 64 }).notNull(),
	age: smallint("age").notNull(),
	hometown: varchar("hometown", { length: 128 }).default('Unknown'::character varying).notNull(),
	residence: varchar("residence", { length: 128 }).default('Unknown'::character varying).notNull(),
	job: varchar("job", { length: 128 }).default('Unknown'::character varying).notNull(),
	photo: varchar("photo", { length: 1024 }).default('https://media.istockphoto.com/id/1980276924/vector/no-photo-thumbnail-graphic-element-no-found-or-available-image-in-the-gallery-or-album-flat.jpg?s=612x612&w=0&k=20&c=ZBE3NqfzIeHGDPkyvulUw14SaWfDj2rZtyiKv3toItk='::character varying).notNull(),
	tribe: varchar("tribe", { length: 16 }).notNull(),
	season: varchar("season").notNull(),
},
(table) => {
	return {
		castaway_season_idx: index("castaway_season_idx").on(table.season),
	}
});

export const yfs_season = pgTable("yfs_season", {
	name: varchar("name", { length: 64 }).notNull(),
	premier_date: date("premier_date").notNull(),
	finale_date: date("finale_date"),
	merge_episode: integer("merge_episode"),
});

export const yfs_league = pgTable("yfs_league", {
	name: varchar("name", { length: 64 }).notNull(),
	password: varchar("password", { length: 64 }).notNull(),
	season_id: varchar("season_id").notNull(),
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

export const yfs_league_member = pgTable("yfs_league_member", {
	league_id: varchar("league_id").primaryKey().notNull(),
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

export const yfs_episode = pgTable("yfs_episode", {
	number: smallint("number").notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	air_date: timestamp("air_date", { mode: 'string' }).notNull(),
	runtime: smallint("runtime").default(90),
	season: varchar("season").notNull(),
	e_advFound: varchar("e_advFound", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_advPlay: varchar("e_advPlay", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_badAdvPlay: varchar("e_badAdvPlay", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_advElim: varchar("e_advElim", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_spokeEpTitle: varchar("e_spokeEpTitle", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_tribe1st: varchar("e_tribe1st", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_tribe2nd: varchar("e_tribe2nd", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_indivWin: varchar("e_indivWin", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_indivReward: varchar("e_indivReward", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_final: varchar("e_final", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_fireWin: varchar("e_fireWin", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_soleSurvivor: varchar("e_soleSurvivor", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_elim: varchar("e_elim", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_notes: json("e_notes"),
	e_noVoteExit: varchar("e_noVoteExit", { length: 64)[ }).default(ARRAY[]::character varying[]).array().notNull(),
	e_tribeUpdate: json("e_tribeUpdate"),
});

export const yfs_tribe = pgTable("yfs_tribe", {
	name: varchar("name", { length: 16 }).notNull(),
	color: varchar("color", { length: 7 }).notNull(),
	merge_tribe: boolean("merge_tribe").default(false).notNull(),
	season: varchar("season").notNull(),
},
(table) => {
	return {
		tribe_season_idx: index("tribe_season_idx").on(table.season),
		tribe_name_idx: uniqueIndex("tribe_name_idx").on(table.name),
	}
});