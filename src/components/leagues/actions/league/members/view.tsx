'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import CurrentMember from '~/components/leagues/actions/league/members/current';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';

export default function ManageMembers() {
  const { data: leagueMembers } = useLeagueMembers();

  const loggedInRole = leagueMembers?.loggedIn?.role;

  if (loggedInRole !== 'Owner' && loggedInRole !== 'Admin') {
    return null;
  }

  return (
    <div className='flex flex-col gap-4 bg-card p-2 justify-between rounded-xl flex-1 min-w-sm'>
      <h3 className='text-lg font-bold text-card-foreground text-center cursor-default'>
        Manage Members
      </h3>
      <Tabs defaultValue='current' className='h-full rounded-lg'>
        <TabsList className='grid grid-flow-col auto-cols-fr w-full px-2 z-50'>
          <TabsTrigger value='current'>Current</TabsTrigger>
          <TabsTrigger value='pending'>Pending</TabsTrigger>
        </TabsList>
        <TabsContent value='current'>
          <div className='flex flex-col w-full'>
            <p className='text-sm text-muted-foreground'>
              <b>The Admins</b> can
            </p>
            <ul className='list-disc list-inside ml-4 text-sm'>
              <li className='text-muted-foreground'>
                Help score custom events
              </li>
              <li className='text-muted-foreground'>
                Admit and remove members
              </li>
            </ul>
            <p className='text-sm text-muted-foreground'>
              <b>The Owner</b> can also
            </p>
            <ul className='list-disc list-inside ml-4 mb-2 text-sm'>
              <li className='text-muted-foreground'>
                Manage member roles
              </li>
              <li className='text-muted-foreground'>
                Edit league details and scoring settings
              </li>
              <li className='text-muted-foreground'>
                Delete the league
              </li>
            </ul>
            <ScrollArea className='flex flex-col max-h-72'>
              {leagueMembers?.members.map(member => (
                <CurrentMember key={member.memberId} member={member} loggedInMember={leagueMembers.loggedIn} />
              ))}
              <ScrollBar orientation='vertical' />
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent value='pending'>
          {/* Pending Invites Management Component Goes Here */}
          <p className='text-sm text-muted-foreground'>
            Manage pending invites here.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
