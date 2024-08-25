import { pgTable, foreignKey, pgEnum, serial, integer, varchar, smallint, timestamp, boolean, date, unique, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const event_label = pgEnum("event_label", ['advFound', 'advPlay', 'badAdvPlay', 'advElim', 'spokeEpTitle', 'tribe1st', 'tribe2nd', 'indivWin', 'indivReward', 'finalists', 'fireWin', 'soleSurvivor', 'elim', 'noVoteExit', 'tribeUpdate', 'otherNotes'])
export const event_name = pgEnum("event_name", ['advFound', 'advPlay', 'badAdvPlay', 'advElim', 'spokeEpTitle', 'tribe1st', 'tribe2nd', 'indivWin', 'indivReward', 'finalists', 'fireWin', 'soleSurvivor', 'elim', 'noVoteExit', 'tribeUpdate', 'otherNotes'])
export const event_prediction_type = pgEnum("event_prediction_type", ['preseason', 'merge'])
export const event_season_type = pgEnum("event_season_type", ['preseason', 'merge', 'premiere', 'finale'])
export const event_weekly_type = pgEnum("event_weekly_type", ['vote', 'predict'])
export const prediction_type = pgEnum("prediction_type", ['preseason', 'merge'])
export const reference = pgEnum("reference", ['castaway', 'tribe', 'member'])
export const rule_type = pgEnum("rule_type", ['adminEvent', 'weeklyVote', 'weeklyPredict', 'preseasonPredict', 'mergePredict'])
export const weekly_event_type = pgEnum("weekly_event_type", ['vote', 'predict'])


export const yfs_event_custom_rule = pgTable("yfs_event_custom_rule", {
	custom_rule_id: serial("custom_rule_id").primaryKey().notNull(),
	league_id: integer("league_id").notNull().references(() => yfs_league.league_id, { onDelete: "cascade" } ),
	name: varchar("name", { length: 32 }).notNull(),
	description: varchar("description", { length: 256 }).notNull(),
	points: integer("points").notNull(),
	reference_type: reference("reference_type").notNull(),
});

export const yfs_event_custom = pgTable("yfs_event_custom", {
	event_custom_id: serial("event_custom_id").primaryKey().notNull(),
	rule_id: integer("rule_id").notNull().references(() => yfs_event_custom_rule.custom_rule_id, { onDelete: "cascade" } ),
	episode_id: integer("episode_id").notNull().references(() => yfs_episode.episode_id, { onDelete: "cascade" } ),
});

export const yfs_tribe = pgTable("yfs_tribe", {
	tribe_id: serial("tribe_id").primaryKey().notNull(),
	name: varchar("name", { length: 16 }).notNull(),
	color: varchar("color", { length: 7 }).notNull(),
	season: integer("season").notNull().references(() => yfs_season.season_id, { onDelete: "cascade" } ),
});

export const yfs_episode = pgTable("yfs_episode", {
	episode_id: serial("episode_id").primaryKey().notNull(),
	number: smallint("number").notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	air_date: timestamp("air_date", { mode: 'string' }).notNull(),
	runtime: smallint("runtime").default(90),
	season: integer("season").notNull().references(() => yfs_season.season_id, { onDelete: "cascade" } ),
	merge: boolean("merge").default(false).notNull(),
});

export const yfs_season = pgTable("yfs_season", {
	season_id: serial("season_id").primaryKey().notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	premier_date: date("premier_date").notNull(),
	finale_date: date("finale_date"),
});

export const yfs_selection_update = pgTable("yfs_selection_update", {
	selection_update_id: serial("selection_update_id").primaryKey().notNull(),
	member_id: integer("member_id").notNull().references(() => yfs_league_member.league_member_id, { onDelete: "cascade" } ),
	episode_id: integer("episode_id").notNull().references(() => yfs_episode.episode_id, { onDelete: "cascade" } ),
	castaway_id: integer("castaway_id").notNull().references(() => yfs_castaway.castaway_id, { onDelete: "cascade" } ),
});

export const yfs_event_base = pgTable("yfs_event_base", {
	event_base_id: serial("event_base_id").primaryKey().notNull(),
	episode: integer("episode").notNull().references(() => yfs_episode.episode_id, { onDelete: "cascade" } ),
	name: event_name("name").notNull(),
	keywords: varchar("keywords", { length: 32)[ }).array().notNull(),
	notes: varchar("notes", { length: 256)[ }).array().notNull(),
});

export const yfs_league_member = pgTable("yfs_league_member", {
	league_member_id: serial("league_member_id").primaryKey().notNull(),
	league_id: integer("league_id").notNull().references(() => yfs_league.league_id, { onDelete: "cascade" } ),
	user_id: varchar("user_id", { length: 64 }).notNull(),
	color: varchar("color", { length: 7 }).notNull(),
	display_name: varchar("display_name", { length: 16 }).notNull(),
	is_owner: boolean("is_owner").default(false).notNull(),
	is_admin: boolean("is_admin").default(false).notNull(),
},
(table) => {
	return {
		yfs_league_member_league_id_display_name_unique: unique("yfs_league_member_league_id_display_name_unique").on(table.league_id, table.display_name),
		yfs_league_member_league_id_color_unique: unique("yfs_league_member_league_id_color_unique").on(table.league_id, table.color),
		yfs_league_member_league_id_user_id_unique: unique("yfs_league_member_league_id_user_id_unique").on(table.league_id, table.user_id),
	}
});

export const yfs_event_base_rule = pgTable("yfs_event_base_rule", {
	base_rule_id: serial("base_rule_id").primaryKey().notNull(),
	league_id: integer("league_id").notNull().references(() => yfs_league.league_id, { onDelete: "cascade" } ),
	adv_found: integer("adv_found").notNull(),
	adv_play: integer("adv_play").notNull(),
	bad_adv_play: integer("bad_adv_play").notNull(),
	adv_elim: integer("adv_elim").notNull(),
	spoke_ep_title: integer("spoke_ep_title").notNull(),
	tribe_1st: integer("tribe_1st").notNull(),
	tribe_2nd: integer("tribe_2nd").notNull(),
	indiv_win: integer("indiv_win").notNull(),
	indiv_reward: integer("indiv_reward").notNull(),
	finalists: integer("finalists").notNull(),
	fire_win: integer("fire_win").notNull(),
	sole_survivor: integer("sole_survivor").notNull(),
});

export const yfs_league = pgTable("yfs_league", {
	league_id: serial("league_id").primaryKey().notNull(),
	name: varchar("name", { length: 64 }).notNull(),
	password: varchar("password", { length: 64 }).notNull(),
	season_id: integer("season_id").notNull().references(() => yfs_season.season_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_league_name_unique: unique("yfs_league_name_unique").on(table.name),
	}
});

export const yfs_event_weekly = pgTable("yfs_event_weekly", {
	event_weekly_id: serial("event_weekly_id").primaryKey().notNull(),
	rule_id: integer("rule_id").notNull().references(() => yfs_event_weekly_rule.event_weekly_rule_id, { onDelete: "cascade" } ),
	episode_id: integer("episode_id").notNull().references(() => yfs_episode.episode_id, { onDelete: "cascade" } ),
	member_id: integer("member_id").notNull().references(() => yfs_league_member.league_member_id, { onDelete: "cascade" } ),
});

export const yfs_event_weekly_rule = pgTable("yfs_event_weekly_rule", {
	event_weekly_rule_id: serial("event_weekly_rule_id").primaryKey().notNull(),
	league_id: integer("league_id").notNull().references(() => yfs_league.league_id),
	name: varchar("name", { length: 32 }).notNull(),
	description: varchar("description", { length: 256 }).notNull(),
	points: integer("points").notNull(),
	type: event_weekly_type("type").notNull(),
	reference_type: reference("reference_type").notNull(),
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
	season: integer("season").notNull().references(() => yfs_season.season_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_castaway_name_season_unique: unique("yfs_castaway_name_season_unique").on(table.name, table.season),
		yfs_castaway_short_name_season_unique: unique("yfs_castaway_short_name_season_unique").on(table.short_name, table.season),
	}
});

export const yfs_league_settings = pgTable("yfs_league_settings", {
	league_id: integer("league_id").primaryKey().notNull().references(() => yfs_league.league_id, { onDelete: "cascade" } ),
	unique_picks: boolean("unique_picks").default(true).notNull(),
	pick_count: integer("pick_count").default(1).notNull(),
	draft_date: timestamp("draft_date", { mode: 'string' }).notNull(),
	draft_order: integer("draft_order").array().notNull(),
	turn_limit_mins: integer("turn_limit_mins").default(10).notNull(),
	invite_only: boolean("invite_only").default(false).notNull(),
});

export const yfs_league_invite = pgTable("yfs_league_invite", {
	invite_id: varchar("invite_id", { length: 16 }).default('16maUVPNAfaTa7sZr8GIJ'::character varying).primaryKey().notNull(),
	league_id: integer("league_id").notNull().references(() => yfs_league.league_id, { onDelete: "cascade" } ),
	expiration: timestamp("expiration", { mode: 'string' }).notNull(),
});

export const yfs_event_custom_castaway = pgTable("yfs_event_custom_castaway", {
	event_id: integer("event_id").notNull().references(() => yfs_event_custom.event_custom_id, { onDelete: "cascade" } ),
	castaway_id: integer("castaway_id").notNull().references(() => yfs_castaway.castaway_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_event_custom_castaway_event_id_castaway_id_pk: primaryKey({ columns: [table.event_id, table.castaway_id], name: "yfs_event_custom_castaway_event_id_castaway_id_pk"}),
	}
});

export const yfs_event_custom_member = pgTable("yfs_event_custom_member", {
	event_id: integer("event_id").notNull().references(() => yfs_event_custom.event_custom_id, { onDelete: "cascade" } ),
	member_id: integer("member_id").notNull().references(() => yfs_league_member.league_member_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_event_custom_member_event_id_member_id_pk: primaryKey({ columns: [table.event_id, table.member_id], name: "yfs_event_custom_member_event_id_member_id_pk"}),
	}
});

export const yfs_event_custom_tribe = pgTable("yfs_event_custom_tribe", {
	event_id: integer("event_id").notNull().references(() => yfs_event_custom.event_custom_id, { onDelete: "cascade" } ),
	tribe_id: integer("tribe_id").notNull().references(() => yfs_tribe.tribe_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_event_custom_tribe_event_id_tribe_id_pk: primaryKey({ columns: [table.event_id, table.tribe_id], name: "yfs_event_custom_tribe_event_id_tribe_id_pk"}),
	}
});

export const yfs_event_base_castaway = pgTable("yfs_event_base_castaway", {
	event_id: integer("event_id").notNull().references(() => yfs_event_base.event_base_id, { onDelete: "cascade" } ),
	castaway_id: integer("castaway_id").notNull().references(() => yfs_castaway.castaway_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_event_base_castaway_event_id_castaway_id_pk: primaryKey({ columns: [table.event_id, table.castaway_id], name: "yfs_event_base_castaway_event_id_castaway_id_pk"}),
	}
});

export const yfs_event_base_tribe = pgTable("yfs_event_base_tribe", {
	event_id: integer("event_id").notNull().references(() => yfs_event_base.event_base_id, { onDelete: "cascade" } ),
	tribe_id: integer("tribe_id").notNull().references(() => yfs_tribe.tribe_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_event_base_tribe_event_id_tribe_id_pk: primaryKey({ columns: [table.event_id, table.tribe_id], name: "yfs_event_base_tribe_event_id_tribe_id_pk"}),
	}
});

export const yfs_event_weekly_castaway = pgTable("yfs_event_weekly_castaway", {
	event_id: integer("event_id").notNull().references(() => yfs_event_weekly.event_weekly_id, { onDelete: "cascade" } ),
	castaway_id: integer("castaway_id").notNull().references(() => yfs_castaway.castaway_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_event_weekly_castaway_event_id_castaway_id_pk: primaryKey({ columns: [table.event_id, table.castaway_id], name: "yfs_event_weekly_castaway_event_id_castaway_id_pk"}),
	}
});

export const yfs_event_weekly_member = pgTable("yfs_event_weekly_member", {
	event_id: integer("event_id").notNull().references(() => yfs_event_weekly.event_weekly_id, { onDelete: "cascade" } ),
	member_id: integer("member_id").notNull().references(() => yfs_league_member.league_member_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_event_weekly_member_event_id_member_id_pk: primaryKey({ columns: [table.event_id, table.member_id], name: "yfs_event_weekly_member_event_id_member_id_pk"}),
	}
});

export const yfs_event_weekly_tribe = pgTable("yfs_event_weekly_tribe", {
	event_id: integer("event_id").notNull().references(() => yfs_event_weekly.event_weekly_id, { onDelete: "cascade" } ),
	tribe_id: integer("tribe_id").notNull().references(() => yfs_tribe.tribe_id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		yfs_event_weekly_tribe_event_id_tribe_id_pk: primaryKey({ columns: [table.event_id, table.tribe_id], name: "yfs_event_weekly_tribe_event_id_tribe_id_pk"}),
	}
});