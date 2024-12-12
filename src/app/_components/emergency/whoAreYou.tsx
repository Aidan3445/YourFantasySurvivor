import { auth } from '@clerk/nextjs/server';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '../commonUI/alert';
import { db } from '~/server/db';
import { leagueMembers } from '~/server/db/schema/members';
import { eq } from 'drizzle-orm';
import AssignMember from './assignMember';

export default async function WhoAreYou() {
  const members = await db
    .select()
    .from(leagueMembers)
    .where(eq(leagueMembers.league, 120));
  const { userId } = await auth();

  if (!userId) return null;

  return (
    <AlertDialog defaultOpen={members.every((m) => m.userId !== userId)}>
      <AlertDialogContent className='p-4 w-44 bg-white'>
        <AlertDialogHeader>
          <AlertDialogTitle>Who are you?</AlertDialogTitle>
        </AlertDialogHeader>
        <ul className='grid grid-cols-1 gap-4'>
          {members.filter((member) => member.userId.length == 2).map((member) => (
            <AssignMember member={member} userId={userId} key={member.id} />
          ))}
        </ul>
      </AlertDialogContent>
    </AlertDialog >
  );
}


