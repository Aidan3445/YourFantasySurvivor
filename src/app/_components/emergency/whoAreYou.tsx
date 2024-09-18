import { auth } from '@clerk/nextjs/server';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '../commonUI/alert';
import { db } from '~/server/db';
import { leagueMembers } from '~/server/db/schema/members';
import { eq } from 'drizzle-orm';
import AssignMember from './assignMember';

export default async function WhoAreYou() {
  const members = await db
    .select()
    .from(leagueMembers)
    .where(eq(leagueMembers.league, 126));
  const { userId } = auth();

  if (!userId) return null;

  return (
    <AlertDialog defaultOpen={members.every((m) => m.userId !== userId)}>
      <AlertDialogContent className='w-40'>
        <AlertDialogHeader>
          <AlertDialogTitle>Who are you?</AlertDialogTitle>
        </AlertDialogHeader>
        <ul className='gap-1 grid grid-cols-1'>
          {members.filter((member) => member.userId.length == 2).map((member) => (
            <AlertDialogAction className='flex w-min -p-1 h-0' key={member.id}>
              <AssignMember member={member} userId={userId} />
            </AlertDialogAction>
          ))}
        </ul>
      </AlertDialogContent>
    </AlertDialog >
  );
}


