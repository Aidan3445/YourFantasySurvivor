import { type Member } from '~/server/db/schema/members';
import Members from './membersScores';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import { getCastawayMemberEpisodeTable, getCustomEvents, getEvents } from '~/app/api/leagues/[id]/score/query';
import compileScores from '~/app/api/leagues/[id]/score/compile';
import Chart from '~/app/playground/_components/scoreChart';
import { getDraftDetails } from '~/app/api/leagues/[id]/draft/query';

interface MembersProps {
  leagueId: number;
  members: Member[];
  ownerLoggedIn: boolean;
  isFull: boolean;
}

export async function LeaderBoard({ leagueId, members, ownerLoggedIn, isFull }: MembersProps) {
  const [
    rules, events, customEvents, memberCastaways, details,
  ] = await Promise.all([
    getRules(leagueId), getEvents(leagueId), getCustomEvents(leagueId),
    getCastawayMemberEpisodeTable(members.map((m) => m.id)),
    getDraftDetails(leagueId),
  ]);

  const altEvents = [...customEvents]; // eventually add weekly and season events
  const baseScores = compileScores(events, altEvents, memberCastaways, rules);

  const membersWithScores = members.map((member) => {
    const points = baseScores[member.displayName] ?? [0, 0];
    return {
      ...member,
      points: points.reduce((a, b) => a + b, 0),
      episodeScores: points,
      name: member.displayName
    };
  }).sort((a, b) => b.points - a.points);

  return (
    <Tabs defaultValue='members'>
      <TabsList>
        <TabsTrigger value='members'>Members</TabsTrigger>
        <TabsTrigger value='castaways'>Castaways</TabsTrigger>
      </TabsList>
      <TabsContent value='members'>
        <span className='flex flex-wrap gap-4 w-full justify-center'>
          <Members
            leagueId={leagueId}
            members={membersWithScores}
            ownerLoggedIn={ownerLoggedIn}
            isFull={isFull}
            details={details} />
          {Object.keys(baseScores).length !== 0 && <Chart className='w-96' data={membersWithScores} label />}
        </span>
      </TabsContent>
      <TabsContent value='castaways'>
        <h2>Castaways scoreboard</h2>
        <p>Coming soon</p>
      </TabsContent>
    </Tabs>
  );
}

