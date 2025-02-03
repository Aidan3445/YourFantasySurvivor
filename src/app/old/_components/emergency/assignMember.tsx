import { ColorRow } from '~/app/leagues/[id]/_components/scores/membersScores';
import { db } from '~/server/db';
import { type LeagueMember, leagueMembers } from '~/server/db/schema/members';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { AlertDialogAction } from '../commonUI/alert';

interface AssignMemberProps {
  member: LeagueMember;
  userId: string;
}

export default function AssignMember({ member, userId }: AssignMemberProps) {
  const resetMember = async () => {
    'use server';
    await db
      .update(leagueMembers)
      .set({ userId })
      .where(eq(leagueMembers.id, member.id));

    redirect('/leagues/');
  };

  return (
    <form action={resetMember}>
      <ColorRow
        className='flex justify-between w-full'
        {...member}
        loggedIn={false}>
        {member.displayName}
        <AlertDialogAction className='p-1 m-1 h-3 text-xs' type='submit'>That&apos;s Me</AlertDialogAction>
      </ColorRow>
    </form>
  );
}
