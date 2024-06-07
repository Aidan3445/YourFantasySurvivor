import { relations } from "drizzle-orm/relations";
import { yfs_league, yfs_league_member, yfs_season, yfs_tribe, yfs_castaway, yfs_episode } from "./schema";

export const yfs_league_memberRelations = relations(yfs_league_member, ({one}) => ({
	yfs_league: one(yfs_league, {
		fields: [yfs_league_member.league_id],
		references: [yfs_league.league_id]
	}),
}));

export const yfs_leagueRelations = relations(yfs_league, ({one, many}) => ({
	yfs_league_members: many(yfs_league_member),
	yfs_season: one(yfs_season, {
		fields: [yfs_league.season_id],
		references: [yfs_season.season_id]
	}),
}));

export const yfs_seasonRelations = relations(yfs_season, ({many}) => ({
	yfs_leagues: many(yfs_league),
	yfs_tribes: many(yfs_tribe),
	yfs_castaways: many(yfs_castaway),
	yfs_episodes: many(yfs_episode),
}));

export const yfs_tribeRelations = relations(yfs_tribe, ({one}) => ({
	yfs_season: one(yfs_season, {
		fields: [yfs_tribe.season],
		references: [yfs_season.season_id]
	}),
}));

export const yfs_castawayRelations = relations(yfs_castaway, ({one}) => ({
	yfs_season: one(yfs_season, {
		fields: [yfs_castaway.season],
		references: [yfs_season.season_id]
	}),
}));

export const yfs_episodeRelations = relations(yfs_episode, ({one}) => ({
	yfs_season: one(yfs_season, {
		fields: [yfs_episode.season],
		references: [yfs_season.season_id]
	}),
}));