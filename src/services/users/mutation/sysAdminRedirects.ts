import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { systemSchema } from '~/server/db/schema/system';

/**
  * Toggle the system admin redirects for a user
  * @param userId - the user to toggle redirects for
  * @param noRedirects - whether to disable redirects
  * @returns success status
  * @returnObj { success }
  */
export async function toggleSysAdminRedirectsLogic(userId: string, noRedirects: boolean) {
  await db
    .update(systemSchema)
    .set({ noRedirects })
    .where(eq(systemSchema.userId, userId));

  return { success: true };
}
