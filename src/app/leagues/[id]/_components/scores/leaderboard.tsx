import { type Member } from '~/server/db/schema/members';
import Members from './membersScores';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';

interface MembersProps {
  leagueId: number;
  members: Member[];
  ownerLoggedIn: boolean;
  isFull: boolean;
}

export async function LeaderBoard({ leagueId, members, ownerLoggedIn, isFull }: MembersProps) {
  return (
    <Tabs defaultValue='members'>
      <TabsList>
        <TabsTrigger value='members'>Members</TabsTrigger>
        <TabsTrigger value='castaways'>Castaways</TabsTrigger>
      </TabsList>
      <TabsContent value='members'>
        <Members leagueId={leagueId} members={members} ownerLoggedIn={ownerLoggedIn} isFull={isFull} />
      </TabsContent>
      <TabsContent value='castaways'>
        <h2>Castaways scoreboard</h2>
        <p>Coming soon</p>
      </TabsContent>
    </Tabs>
  );
}

