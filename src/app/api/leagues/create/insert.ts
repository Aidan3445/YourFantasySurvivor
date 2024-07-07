'server-only';
import { db } from '~/server/db';
import { leagues, type LeagueInsert } from '~/server/db/schema/leagues';

export async function insertLeague(league: LeagueInsert): Promise<{ id: number }> {
  return db
    .insert(leagues)
    .values(league)
    .returning({ id: leagues.id })
    .then((result) => result[0] ?? { id: 0 });
}
