-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "yfs_castaway" (
	"name" varchar(64) NOT NULL,
	"age" smallint NOT NULL,
	"hometown" varchar(128) DEFAULT 'Unknown'::character varying NOT NULL,
	"residence" varchar(128) DEFAULT 'Unknown'::character varying NOT NULL,
	"job" varchar(128) DEFAULT 'Unknown'::character varying NOT NULL,
	"photo" varchar(1024) DEFAULT 'https://media.istockphoto.com/id/1980276924/vector/no-photo-thumbnail-graphic-element-no-found-or-available-image-in-the-gallery-or-album-flat.jpg?s=612x612&w=0&k=20&c=ZBE3NqfzIeHGDPkyvulUw14SaWfDj2rZtyiKv3toItk='::character varying NOT NULL,
	"tribe" varchar(16) NOT NULL,
	"season" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yfs_season" (
	"name" varchar(64) NOT NULL,
	"premier_date" date NOT NULL,
	"finale_date" date,
	"merge_episode" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yfs_league" (
	"name" varchar(64) NOT NULL,
	"password" varchar(64) NOT NULL,
	"season_id" varchar NOT NULL,
	"owner_id" varchar(64) NOT NULL,
	"admin_ids" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"settings" json DEFAULT '{}'::json NOT NULL,
	"rules" json,
	"episodes" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yfs_league_member" (
	"league_id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"color" varchar(7) NOT NULL,
	"display_name" varchar(64) NOT NULL,
	"predictions" integer[] DEFAULT 'RRAY[' NOT NULL,
	"survivor_updates" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yfs_episode" (
	"number" smallint NOT NULL,
	"name" varchar(64) NOT NULL,
	"air_date" timestamp NOT NULL,
	"runtime" smallint DEFAULT 90,
	"season" varchar NOT NULL,
	"e_advFound" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_advPlay" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_badAdvPlay" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_advElim" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_spokeEpTitle" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_tribe1st" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_tribe2nd" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_indivWin" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_indivReward" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_final" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_fireWin" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_soleSurvivor" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_elim" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_notes" json,
	"e_noVoteExit" varchar(64)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
	"e_tribeUpdate" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "yfs_tribe" (
	"name" varchar(16) NOT NULL,
	"color" varchar(7) NOT NULL,
	"merge_tribe" boolean DEFAULT false NOT NULL,
	"season" varchar NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "castaway_season_idx" ON "yfs_castaway" ("season");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "league_owner_idx" ON "yfs_league" ("owner_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "league_member_user_idx" ON "yfs_league_member" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tribe_season_idx" ON "yfs_tribe" ("season");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tribe_name_idx" ON "yfs_tribe" ("name");
*/