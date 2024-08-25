import { relations } from "drizzle-orm/relations";
import { yfs_league, yfs_event_custom_rule, yfs_episode, yfs_event_custom, yfs_season, yfs_tribe, yfs_selection_update, yfs_castaway, yfs_league_member, yfs_event_base, yfs_event_base_rule, yfs_event_weekly, yfs_event_weekly_rule, yfs_league_settings, yfs_league_invite, yfs_event_custom_castaway, yfs_event_custom_member, yfs_event_custom_tribe, yfs_event_base_castaway, yfs_event_base_tribe, yfs_event_weekly_castaway, yfs_event_weekly_member, yfs_event_weekly_tribe } from "./schema";

export const yfs_event_custom_ruleRelations = relations(yfs_event_custom_rule, ({one, many}) => ({
	yfs_league: one(yfs_league, {
		fields: [yfs_event_custom_rule.league_id],
		references: [yfs_league.league_id]
	}),
	yfs_event_customs: many(yfs_event_custom),
}));

export const yfs_leagueRelations = relations(yfs_league, ({one, many}) => ({
	yfs_event_custom_rules: many(yfs_event_custom_rule),
	yfs_league_members: many(yfs_league_member),
	yfs_event_base_rules: many(yfs_event_base_rule),
	yfs_season: one(yfs_season, {
		fields: [yfs_league.season_id],
		references: [yfs_season.season_id]
	}),
	yfs_event_weekly_rules: many(yfs_event_weekly_rule),
	yfs_league_settings: many(yfs_league_settings),
	yfs_league_invites: many(yfs_league_invite),
}));

export const yfs_event_customRelations = relations(yfs_event_custom, ({one, many}) => ({
	yfs_episode: one(yfs_episode, {
		fields: [yfs_event_custom.episode_id],
		references: [yfs_episode.episode_id]
	}),
	yfs_event_custom_rule: one(yfs_event_custom_rule, {
		fields: [yfs_event_custom.rule_id],
		references: [yfs_event_custom_rule.custom_rule_id]
	}),
	yfs_event_custom_castaways: many(yfs_event_custom_castaway),
	yfs_event_custom_members: many(yfs_event_custom_member),
	yfs_event_custom_tribes: many(yfs_event_custom_tribe),
}));

export const yfs_episodeRelations = relations(yfs_episode, ({one, many}) => ({
	yfs_event_customs: many(yfs_event_custom),
	yfs_season: one(yfs_season, {
		fields: [yfs_episode.season],
		references: [yfs_season.season_id]
	}),
	yfs_selection_updates: many(yfs_selection_update),
	yfs_event_bases: many(yfs_event_base),
	yfs_event_weeklies: many(yfs_event_weekly),
}));

export const yfs_tribeRelations = relations(yfs_tribe, ({one, many}) => ({
	yfs_season: one(yfs_season, {
		fields: [yfs_tribe.season],
		references: [yfs_season.season_id]
	}),
	yfs_event_custom_tribes: many(yfs_event_custom_tribe),
	yfs_event_base_tribes: many(yfs_event_base_tribe),
	yfs_event_weekly_tribes: many(yfs_event_weekly_tribe),
}));

export const yfs_seasonRelations = relations(yfs_season, ({many}) => ({
	yfs_tribes: many(yfs_tribe),
	yfs_episodes: many(yfs_episode),
	yfs_leagues: many(yfs_league),
	yfs_castaways: many(yfs_castaway),
}));

export const yfs_selection_updateRelations = relations(yfs_selection_update, ({one}) => ({
	yfs_episode: one(yfs_episode, {
		fields: [yfs_selection_update.episode_id],
		references: [yfs_episode.episode_id]
	}),
	yfs_castaway: one(yfs_castaway, {
		fields: [yfs_selection_update.castaway_id],
		references: [yfs_castaway.castaway_id]
	}),
	yfs_league_member: one(yfs_league_member, {
		fields: [yfs_selection_update.member_id],
		references: [yfs_league_member.league_member_id]
	}),
}));

export const yfs_castawayRelations = relations(yfs_castaway, ({one, many}) => ({
	yfs_selection_updates: many(yfs_selection_update),
	yfs_season: one(yfs_season, {
		fields: [yfs_castaway.season],
		references: [yfs_season.season_id]
	}),
	yfs_event_custom_castaways: many(yfs_event_custom_castaway),
	yfs_event_base_castaways: many(yfs_event_base_castaway),
	yfs_event_weekly_castaways: many(yfs_event_weekly_castaway),
}));

export const yfs_league_memberRelations = relations(yfs_league_member, ({one, many}) => ({
	yfs_selection_updates: many(yfs_selection_update),
	yfs_league: one(yfs_league, {
		fields: [yfs_league_member.league_id],
		references: [yfs_league.league_id]
	}),
	yfs_event_weeklies: many(yfs_event_weekly),
	yfs_event_custom_members: many(yfs_event_custom_member),
	yfs_event_weekly_members: many(yfs_event_weekly_member),
}));

export const yfs_event_baseRelations = relations(yfs_event_base, ({one, many}) => ({
	yfs_episode: one(yfs_episode, {
		fields: [yfs_event_base.episode],
		references: [yfs_episode.episode_id]
	}),
	yfs_event_base_castaways: many(yfs_event_base_castaway),
	yfs_event_base_tribes: many(yfs_event_base_tribe),
}));

export const yfs_event_base_ruleRelations = relations(yfs_event_base_rule, ({one}) => ({
	yfs_league: one(yfs_league, {
		fields: [yfs_event_base_rule.league_id],
		references: [yfs_league.league_id]
	}),
}));

export const yfs_event_weeklyRelations = relations(yfs_event_weekly, ({one, many}) => ({
	yfs_episode: one(yfs_episode, {
		fields: [yfs_event_weekly.episode_id],
		references: [yfs_episode.episode_id]
	}),
	yfs_event_weekly_rule: one(yfs_event_weekly_rule, {
		fields: [yfs_event_weekly.rule_id],
		references: [yfs_event_weekly_rule.event_weekly_rule_id]
	}),
	yfs_league_member: one(yfs_league_member, {
		fields: [yfs_event_weekly.member_id],
		references: [yfs_league_member.league_member_id]
	}),
	yfs_event_weekly_castaways: many(yfs_event_weekly_castaway),
	yfs_event_weekly_members: many(yfs_event_weekly_member),
	yfs_event_weekly_tribes: many(yfs_event_weekly_tribe),
}));

export const yfs_event_weekly_ruleRelations = relations(yfs_event_weekly_rule, ({one, many}) => ({
	yfs_event_weeklies: many(yfs_event_weekly),
	yfs_league: one(yfs_league, {
		fields: [yfs_event_weekly_rule.league_id],
		references: [yfs_league.league_id]
	}),
}));

export const yfs_league_settingsRelations = relations(yfs_league_settings, ({one}) => ({
	yfs_league: one(yfs_league, {
		fields: [yfs_league_settings.league_id],
		references: [yfs_league.league_id]
	}),
}));

export const yfs_league_inviteRelations = relations(yfs_league_invite, ({one}) => ({
	yfs_league: one(yfs_league, {
		fields: [yfs_league_invite.league_id],
		references: [yfs_league.league_id]
	}),
}));

export const yfs_event_custom_castawayRelations = relations(yfs_event_custom_castaway, ({one}) => ({
	yfs_event_custom: one(yfs_event_custom, {
		fields: [yfs_event_custom_castaway.event_id],
		references: [yfs_event_custom.event_custom_id]
	}),
	yfs_castaway: one(yfs_castaway, {
		fields: [yfs_event_custom_castaway.castaway_id],
		references: [yfs_castaway.castaway_id]
	}),
}));

export const yfs_event_custom_memberRelations = relations(yfs_event_custom_member, ({one}) => ({
	yfs_event_custom: one(yfs_event_custom, {
		fields: [yfs_event_custom_member.event_id],
		references: [yfs_event_custom.event_custom_id]
	}),
	yfs_league_member: one(yfs_league_member, {
		fields: [yfs_event_custom_member.member_id],
		references: [yfs_league_member.league_member_id]
	}),
}));

export const yfs_event_custom_tribeRelations = relations(yfs_event_custom_tribe, ({one}) => ({
	yfs_tribe: one(yfs_tribe, {
		fields: [yfs_event_custom_tribe.tribe_id],
		references: [yfs_tribe.tribe_id]
	}),
	yfs_event_custom: one(yfs_event_custom, {
		fields: [yfs_event_custom_tribe.event_id],
		references: [yfs_event_custom.event_custom_id]
	}),
}));

export const yfs_event_base_castawayRelations = relations(yfs_event_base_castaway, ({one}) => ({
	yfs_castaway: one(yfs_castaway, {
		fields: [yfs_event_base_castaway.castaway_id],
		references: [yfs_castaway.castaway_id]
	}),
	yfs_event_base: one(yfs_event_base, {
		fields: [yfs_event_base_castaway.event_id],
		references: [yfs_event_base.event_base_id]
	}),
}));

export const yfs_event_base_tribeRelations = relations(yfs_event_base_tribe, ({one}) => ({
	yfs_event_base: one(yfs_event_base, {
		fields: [yfs_event_base_tribe.event_id],
		references: [yfs_event_base.event_base_id]
	}),
	yfs_tribe: one(yfs_tribe, {
		fields: [yfs_event_base_tribe.tribe_id],
		references: [yfs_tribe.tribe_id]
	}),
}));

export const yfs_event_weekly_castawayRelations = relations(yfs_event_weekly_castaway, ({one}) => ({
	yfs_event_weekly: one(yfs_event_weekly, {
		fields: [yfs_event_weekly_castaway.event_id],
		references: [yfs_event_weekly.event_weekly_id]
	}),
	yfs_castaway: one(yfs_castaway, {
		fields: [yfs_event_weekly_castaway.castaway_id],
		references: [yfs_castaway.castaway_id]
	}),
}));

export const yfs_event_weekly_memberRelations = relations(yfs_event_weekly_member, ({one}) => ({
	yfs_event_weekly: one(yfs_event_weekly, {
		fields: [yfs_event_weekly_member.event_id],
		references: [yfs_event_weekly.event_weekly_id]
	}),
	yfs_league_member: one(yfs_league_member, {
		fields: [yfs_event_weekly_member.member_id],
		references: [yfs_league_member.league_member_id]
	}),
}));

export const yfs_event_weekly_tribeRelations = relations(yfs_event_weekly_tribe, ({one}) => ({
	yfs_tribe: one(yfs_tribe, {
		fields: [yfs_event_weekly_tribe.tribe_id],
		references: [yfs_tribe.tribe_id]
	}),
	yfs_event_weekly: one(yfs_event_weekly, {
		fields: [yfs_event_weekly_tribe.event_id],
		references: [yfs_event_weekly.event_weekly_id]
	}),
}));