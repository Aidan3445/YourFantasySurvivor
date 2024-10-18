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
    .where(eq(leagueMembers.league, 120));
  const { userId } = auth();

  if (!userId) return null;

  return (
    <AlertDialog defaultOpen={members.every((m) => m.userId !== userId)}>
      <AlertDialogContent className='w-44 bg-white p-4'>
        <AlertDialogHeader>
          <AlertDialogTitle>Who are you?</AlertDialogTitle>
        </AlertDialogHeader>
        <ul className='grid grid-cols-1 gap-4'>
          {members.filter((member) => member.userId.length == 2).map((member) => (
            <AlertDialogAction className='h-0' key={member.id} asChild>
              <AssignMember member={member} userId={userId} />
            </AlertDialogAction>
          ))}
        </ul>
      </AlertDialogContent>
    </AlertDialog >
  );
}


