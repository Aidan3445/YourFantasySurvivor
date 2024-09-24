import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { system } from '~/server/db/schema/system';

export async function sysAuth() {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  const sys = await db.select().from(system).where(eq(system.userId, userId));
  return sys.length > 0;
}
