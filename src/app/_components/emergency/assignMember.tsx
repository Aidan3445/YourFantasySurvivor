import { ColorRow } from '~/app/leagues/[id]/_components/scores/membersScores';
import { db } from '~/server/db';
import { type LeagueMember, leagueMembers } from '~/server/db/schema/members';
import { eq } from 'drizzle-orm';
import { Button } from '../commonUI/button';
import { redirect } from 'next/navigation';

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

    redirect('/leagues/draft');
  };

  return (
    <form action={resetMember}>
      <ColorRow
        className='flex justify-between'
        {...member}
        loggedIn={false}>
        {member.displayName}
        <Button className='p-1 text-xs h-3 m-1' type='submit'>That&apos;s Me</Button>
      </ColorRow>
    </form>
  );
}
