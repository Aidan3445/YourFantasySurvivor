import 'server-only';
import { db } from '~/server/db';
import { eq, and, isNotNull, ne } from 'drizzle-orm';
import { leagueMemberSchema, selectionUpdateSchema } from '~/server/db/schema/leagueMembers';
import { sendPushToUsers } from '~/services/notifications/push';
import { type ScheduledSelectionData } from '~/types/notifications';

/**
 * Validate the selection still matches, then notify other league members
 */
export async function sendSelectionChangeNotification(selection: ScheduledSelectionData) {
  // Validate current selection matches what was scheduled
  const current = await db
    .select({ castawayId: selectionUpdateSchema.castawayId })
    .from(selectionUpdateSchema)
    .where(and(
      eq(selectionUpdateSchema.memberId, selection.memberId),
      eq(selectionUpdateSchema.episodeId, selection.episodeId),
    ))
    .then((res) => res[0]);

  if (current?.castawayId !== selection.castawayId) {
    console.log(
      `Skipping selection notification - member ${selection.memberId} selection changed since scheduling`,
      { scheduled: selection.castawayId, current: current?.castawayId }
    );
    return;
  }

  // Get other admitted members
  const members = await db
    .selectDistinct({ userId: leagueMemberSchema.userId })
    .from(leagueMemberSchema)
    .where(and(
      eq(leagueMemberSchema.leagueId, selection.leagueId),
      isNotNull(leagueMemberSchema.draftOrder),
      ne(leagueMemberSchema.userId, selection.userId),
    ));

  if (members.length === 0) return;

  await sendPushToUsers(
    members.map((m) => m.userId),
    {
      title: 'Selection Update',
      body: `${selection.memberName} switched to ${selection.castawayName} in ${selection.leagueName}!`,
      data: { type: 'selection_changed', leagueHash: selection.leagueHash },
    },
    'leagueActivity',
  );
}
