'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import CurrentMember from '~/components/leagues/actions/league/members/current';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { usePendingMembers } from '~/hooks/leagues/usePendingMembers';
import PendingMember from '~/components/leagues/actions/league/members/pending';
import { Circle } from 'lucide-react';
import { type Ref, useEffect, useState } from 'react';
import { Separator } from '~/components/common/separator';

interface ManageMembersProps {
  ref?: Ref<HTMLDivElement>;
}

export default function ManageMembers({ ref }: ManageMembersProps) {
  const { data: leagueMembers } = useLeagueMembers();
  const { data: pendingMembers } = usePendingMembers();
  const { data: leagueSettings } = useLeagueSettings();
  const [tab, setTab] = useState<'current' | 'pending'>('current');

  useEffect(() => {
    if (!leagueSettings?.isProtected && tab === 'pending') {
      setTab('current');
    }
  }, [leagueSettings, tab]);

  const loggedInRole = leagueMembers?.loggedIn?.role;
  if (loggedInRole !== 'Owner' && loggedInRole !== 'Admin') {
    return null;
  }

  return (
    <div
      id='manage-members'
      ref={ref}
      className='flex flex-col gap-4 bg-card justify-between rounded-lg border-2 border-primary/20 shadow-lg shadow-primary/10 flex-1 sm:min-w-sm min-h-0 overflow-hidden'>
      <div className='flex items-center gap-3 h-8 px-4 mt-4'>
        <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
        <h2 className='md:text-xl font-black uppercase tracking-tight leading-none text-nowrap'>
          Manage Members
        </h2>
      </div>
      <Tabs
        className='h-full rounded-lg flex flex-col'
        value={tab}
        onValueChange={setTab as (_value: string) => void}>
        <TabsList className='grid grid-flow-col auto-cols-fr px-2 mx-4 z-50 bg-accent border-none'>
          <TabsTrigger value='current'>Current</TabsTrigger>
          <TabsTrigger value='pending' disabled={!leagueSettings?.isProtected}>
            Pending
            {leagueSettings?.isProtected && (pendingMembers?.members?.length ?? 0) > 0 && (
              <Circle className='animate-pulse mb-2 stroke-primary fill-primary shrink-0' size={8} />
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value='current' className='flex-1 min-h-0 pb-0! mb-0!'>
          <div className='flex flex-col w-full'>
            <div className='px-4'>
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
            </div>
            <ScrollArea className='flex-1 min-h-0 max-h-74'>
              <div className='px-4'>
                <Separator className='bg-primary/20' />
                <div className='py-2 flex flex-col gap-1'>
                  {leagueMembers?.members
                    .map(member => (
                      member.loggedIn
                        ? null
                        : (
                          <CurrentMember
                            key={member.memberId}
                            member={member}
                            loggedInMember={leagueMembers.loggedIn} />
                        )))}
                </div>
                <ScrollBar orientation='vertical' />
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
        <TabsContent value='pending' className='flex-1 min-h-0 pb-0! mb-0!'>
          {leagueSettings?.isProtected ? (
            <div className='flex flex-col w-full'>
              <div className='px-4'>
                <p className='text-sm text-muted-foreground'>
                  Since this league is protected, new members must be admitted by an admin.
                </p>
                <p className='text-xs text-muted-foreground mb-2'>
                  Pending members will be removed after 7 days if not admitted.
                </p>
              </div>
              <ScrollArea className='flex-1 min-h-0 max-h-74'>
                <div className='p-4 pb-0'>
                  {pendingMembers?.members.map((member, index) => (
                    <PendingMember
                      key={index}
                      member={member}
                      loggedInMember={leagueMembers?.loggedIn} />
                  ))}
                </div>
                <ScrollBar orientation='vertical' />
              </ScrollArea>
            </div>
          ) : (
            <div className='px-4'>
              <p className='text-sm text-muted-foreground'>
                This league is not protected; new members can join freely.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div >
  );
}
