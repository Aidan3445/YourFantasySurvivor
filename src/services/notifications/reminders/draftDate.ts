import 'server-only';
import { db } from '~/server/db';
import { eq, and, isNotNull } from 'drizzle-orm';
import { leagueSettingsSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { sendPushToUsers } from '~/services/notifications/push';
import { type ScheduledDraftData } from '~/types/notifications';

/**
 * Validate that the draft date hasn't changed since scheduling,
 * then send notifications to league members
 */
export async function sendDraftDateNotification(draft: ScheduledDraftData) {
  // Validate current state matches what was scheduled
  const current = await db
    .select({ draftDate: leagueSettingsSchema.draftDate })
    .from(leagueSettingsSchema)
    .where(eq(leagueSettingsSchema.leagueId, draft.leagueId))
    .then((res) => res[0]);

  if (!current) {
    console.log(`Skipping draft notification - league ${draft.leagueId} not found`);
    return;
  }

  const currentDate = current.draftDate
    ? new Date(current.draftDate).toISOString()
    : null;
  const scheduledDate = draft.draftDate
    ? new Date(draft.draftDate).toISOString()
    : null;

  if (currentDate !== scheduledDate) {
    console.log(
      `Skipping draft notification - league ${draft.leagueId} draft date changed since scheduling`,
      { scheduled: scheduledDate, current: currentDate }
    );
    return;
  }

  // Get all admitted members
  const members = await db
    .selectDistinct({ userId: leagueMemberSchema.userId })
    .from(leagueMemberSchema)
    .where(and(
      eq(leagueMemberSchema.leagueId, draft.leagueId),
      isNotNull(leagueMemberSchema.draftOrder),
    ));

  if (members.length === 0) return;

  const body = draft.draftDate
    ? `The draft for ${draft.leagueName} has been scheduled for ${new Date(draft.draftDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}!`
    : `The draft for ${draft.leagueName} has been set to start manually by the league admin.`;

  await sendPushToUsers(
    members.map((m) => m.userId),
    {
      title: 'Draft Update',
      body,
      data: { type: 'draft_date_changed', leagueHash: draft.leagueHash },
    },
    'leagueActivity',
  );
}

/**
 * Validate draft date still matches, then send 1-hour reminder
 */
export async function sendDraftReminderNotification(draft: ScheduledDraftData) {
  if (!draft.draftDate) return;

  // Validate current state matches
  const current = await db
    .select({ draftDate: leagueSettingsSchema.draftDate })
    .from(leagueSettingsSchema)
    .where(eq(leagueSettingsSchema.leagueId, draft.leagueId))
    .then((res) => res[0]);

  if (!current?.draftDate) {
    console.log(`Skipping draft reminder - league ${draft.leagueId} draft date cleared`);
    return;
  }

  const currentDate = new Date(current.draftDate).toISOString();
  const scheduledDate = new Date(draft.draftDate).toISOString();

  if (currentDate !== scheduledDate) {
    console.log(
      `Skipping draft reminder - league ${draft.leagueId} draft date changed since scheduling`,
      { scheduled: scheduledDate, current: currentDate }
    );
    return;
  }

  const members = await db
    .selectDistinct({ userId: leagueMemberSchema.userId })
    .from(leagueMemberSchema)
    .where(and(
      eq(leagueMemberSchema.leagueId, draft.leagueId),
      isNotNull(leagueMemberSchema.draftOrder),
    ));

  if (members.length === 0) return;

  await sendPushToUsers(
    members.map((m) => m.userId),
    {
      title: 'Draft in 1 Hour!',
      body: `The draft for ${draft.leagueName} starts in 1 hour!`,
      data: { type: 'draft_reminder_1hr', leagueHash: draft.leagueHash },
    },
    'leagueActivity',
  );
}
