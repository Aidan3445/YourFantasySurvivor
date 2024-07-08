import 'server-only';
import { db } from '~/server/db';
import { and, eq } from 'drizzle-orm';
import { leagues } from '~/server/db/schema/leagues';

export async function joinLeague(name: string, password: string): Promise<{ id: number }> {
  return db
    .select({ id: leagues.id })
    .from(leagues)
    .where(and(eq(leagues.name, name), eq(leagues.password, password)))
    .then((leagues) => leagues[0] ?? { id: 0 });
}
