'use client';

import CustomEvents from '~/components/leagues/customization/events/custom/view';
import LeagueSettings from '~/components/leagues/customization/settings/league/view';
import MemberEditForm from '~/components/leagues/customization/member/view';
import { DraftCountdown } from '~/components/leagues/predraft/countdown/view';
import DraftOrder from '~/components/leagues/predraft/order/view';
import InviteLink from '~/components/leagues/predraft/inviteLink/view';
import LeagueScoring from '~/components/leagues/customization/events/base/view';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import ShauhinMode from '~/components/leagues/customization/settings/shauhin/view';
import DeleteLeague from '~/components/leagues/actions/league/delete/view';
import ManageMembers from '~/components/leagues/actions/league/members/view';
import SurvivalSettings from '~/components/leagues/customization/settings/survival/view';
import SecondaryPickSettings from '~/components/leagues/customization/settings/secondaryPick/view';
import Spacer from '~/components/shared/floatingActions/spacer';
import { useEffect, useRef, useState } from 'react';

export default function PredraftPage() {
  const [tab, setTab] = useState('league');
  const scrollRef = useRef<HTMLDivElement>(null);
  const manageMembersRef = useRef<HTMLDivElement>(null);

  const scrollToManageMembers = () => {
    if (!scrollRef.current || !manageMembersRef.current) return;

    const viewport = scrollRef.current;
    const target = manageMembersRef.current;

    viewport.scrollTo({
      top: target.offsetTop - viewport.offsetTop,
      behavior: 'smooth',
    });
  };

  const goToManageMembers = () => {
    setTab('settings');
    requestAnimationFrame(scrollToManageMembers);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.location.hash === '#manage-members') {
      setTab('settings');

      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToManageMembers();

            history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search
            );
          });
        });
      }, 3000);
    }
  }, []);

  return (
    <Tabs className='w-full overflow-hidden' value={tab} onValueChange={setTab}>
      <TabsList className='sticky flex w-full px-10 rounded-none z-50 bg-accent'>
        <TabsTrigger className='flex-1' value='league'>League</TabsTrigger>
        <TabsTrigger className='flex-none w-fit' value='settings'>Settings</TabsTrigger>
      </TabsList>
      <ScrollArea
        viewportRef={scrollRef}
        className='px-4 md:h-[calc(100svh-10.5rem)] h-[calc(100svh-9rem-var(--navbar-height))]'>
        <div className='pb-4'>
          <TabsContent value='league' className='space-y-4'>
            <InviteLink />
            <DraftCountdown className='p-4 pt-2' />
            <DraftOrder goToSettings={goToManageMembers} />
            <div className='w-full flex items-center gap-2 justify-center p-2 bg-card rounded-lg shadow-md shadow-primary/10 border-2 border-primary/20'>
              <span className='h-5 w-0.5 bg-primary rounded-full' />
              <h2 className='text-2xl font-black uppercase tracking-tight text-center'>
                League Scoring
              </h2>
              <span className='h-5 w-0.5 bg-primary rounded-full' />
            </div>
            <SurvivalSettings />
            <SecondaryPickSettings />
            <LeagueScoring />
            <ShauhinMode />
            <CustomEvents />
          </TabsContent>
          <TabsContent value='settings' className='space-y-4'>
            <MemberEditForm />
            <div className='w-full flex flex-wrap gap-4 justify-center'>
              <div className='flex flex-col gap-4 w-full'>
                <LeagueSettings />
                <DeleteLeague />
              </div>
              <ManageMembers ref={manageMembersRef} />
            </div>
          </TabsContent>
        </div>
        <Spacer />
        <ScrollBar className='pb-4 pt-2' />
      </ScrollArea>
    </Tabs>
  );
}
