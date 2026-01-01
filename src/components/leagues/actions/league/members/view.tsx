'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import CurrentMember from '~/components/leagues/actions/league/members/current';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { usePendingMembers } from '~/hooks/leagues/usePendingMembers';
import PendingMember from '~/components/leagues/actions/league/members/pending';
import { Circle } from 'lucide-react';

export default function ManageMembers() {
  const { data: leagueMembers } = useLeagueMembers();
  const { data: pendingMembers } = usePendingMembers();
  const { data: leagueSettings } = useLeagueSettings();

  const loggedInRole = leagueMembers?.loggedIn?.role;

  if (loggedInRole !== 'Owner' && loggedInRole !== 'Admin') {
    return null;
  }

  return (
    <div className='flex flex-col gap-4 bg-card p-2 justify-between rounded-xl flex-1 min-w-sm max-h-134 min-h-0 overflow-hidden mb-2 md:mb-0'>
      <h3 className='text-lg font-bold text-card-foreground text-center cursor-default'>
        Manage Members
      </h3>
      <Tabs defaultValue='current' className='h-full rounded-lg flex flex-col'>
        <TabsList className='grid grid-flow-col auto-cols-fr w-full px-2 z-50'>
          <TabsTrigger value='current'>Current</TabsTrigger>
          <TabsTrigger value='pending' disabled={!leagueSettings?.isProtected}>
            Pending
            {leagueSettings?.isProtected && (pendingMembers?.members?.length ?? 0) > 0 && (
              <Circle className='animate-pulse mb-2 stroke-primary fill-primary' size={8} />
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value='current' className='flex-1 min-h-0'>
          <div className='flex flex-col w-full h-full'>
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
            <ScrollArea className='flex-1 min-h-0 pr-3 mb-9'>
              {leagueMembers?.members.map(member => (
                <CurrentMember
                  key={member.memberId}
                  member={member}
                  loggedInMember={leagueMembers.loggedIn} />
              ))}
              <ScrollBar orientation='vertical' />
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent value='pending' className='flex-1 min-h-0'>
          {leagueSettings?.isProtected ? (
            <div className='flex flex-col w-full h-full'>
              <p className='text-sm text-muted-foreground'>
                Since this league is protected, new members must be admitted by an admin.
              </p>
              <p className='text-xs text-muted-foreground mb-2'>
                Pending members will be removed after 7 days if not admitted.
              </p>
              <ScrollArea className='flex-1 min-h-0 pr-3 mb-9'>
                {pendingMembers?.members.map((member, index) => (
                  <PendingMember
                    key={index}
                    member={member}
                    loggedInMember={leagueMembers?.loggedIn} />
                ))}
                <ScrollBar orientation='vertical' />
              </ScrollArea>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              This league is not protected; new members can join freely.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
