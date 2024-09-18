import 'server-only';
import { eq, inArray } from 'drizzle-orm';
import { db } from '~/server/db';
import { getCastawayEvents, getTribeEvents, getTribeUpdates } from '~/app/api/seasons/[name]/events/query';
import { leagues } from '~/server/db/schema/leagues';
import { seasons } from '~/server/db/schema/seasons';
import { episodes } from '~/server/db/schema/episodes';
import { leagueMembers, selectionUpdates } from '~/server/db/schema/members';
import { castaways } from '~/server/db/schema/castaways';

export async function getEvents(leagueId: number) {
  const seasonName = await db
    .select({ seasonName: seasons.name })
    .from(seasons)
    .innerJoin(leagues, eq(leagues.season, seasons.id))
    .where(eq(leagues.id, leagueId))
    .then((res) => res[0]?.seasonName);

  if (!seasonName) throw new Error('League not found');

  const [castawayEvents, tribeEvents, tribeUpdates] = await Promise.all([
    getCastawayEvents(seasonName, null), getTribeEvents(seasonName, null), getTribeUpdates(seasonName),
  ]);

  return { castawayEvents, tribeEvents, tribeUpdates };
}

export async function getCastawayMemberEpisodeTable(memberIds: number[]) {
  const updates = await db
    .select({ episode: episodes.number, member: leagueMembers.displayName, castaway: castaways.shortName })
    .from(selectionUpdates)
    .innerJoin(leagueMembers, eq(leagueMembers.id, selectionUpdates.member))
    .innerJoin(castaways, eq(castaways.id, selectionUpdates.castaway))
    .leftJoin(episodes, eq(episodes.id, selectionUpdates.episode))
    .where(inArray(leagueMembers.id, memberIds));

  return updates.reduce((lookup, update) => {
    update.episode ??= 0;
    lookup[update.episode] ??= {};

    // initial castaway selection has null episode, replace with 0
    lookup[update.episode]![update.castaway] = update.member;
    return lookup;
  }, {} as Record<number, Record<string, string>>);
}
