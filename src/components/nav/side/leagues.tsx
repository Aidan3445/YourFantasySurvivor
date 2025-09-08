'use client';

import { SidebarMenuButton, SidebarMenuSub } from '~/components/common/sidebar';
import { ListPlus, Trophy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import { Separator } from '~/components/common/separator';
import SideNavLink from '~/components/nav/side/link';
import { useLeagues } from '~/hooks/user/useLeagues';

export default function SideNavLeagues() {
  const { data: leaguesData } = useLeagues();
  const [open, setOpen] = useState('');
  const { leagueHash } = useParams();

  useEffect(() => {
    if (leaguesData && leaguesData.length > 0) {
      setOpen('leagues');
    }
  }, [leaguesData, setOpen]);

  const toggleOpen = () => {
    if (open === 'leagues') {
      setOpen('');
    } else {
      setOpen('leagues');
    }
  };

  if (leaguesData?.length === 0) {
    return <SideNavLink href='/leagues' icon={<Trophy />} label='Leagues' />;
  }

  return (
    <Accordion
      type='single'
      collapsible
      value={open}
      onValueChange={() => toggleOpen()}>
      <AccordionItem value='leagues'>
        <SidebarMenuButton className='' asChild size='lg'>
          <AccordionTrigger className='mb-1 hover:no-underline font-normal data-[state=open]:mb-0 transition-all'>
            <span className='w-full flex gap-5 items-center'>
              <Trophy />
              Leagues
            </span>
          </AccordionTrigger>
        </SidebarMenuButton>
        <AccordionContent className='pb-1'>
          <SidebarMenuSub>
            {leaguesData?.filter(({ league }) => league.status !== 'Inactive')
              .slice(0, 5)
              .map(({ league }) => (
                <SideNavLink
                  className={league.hash === leagueHash ? 'font-semibold' : ''}
                  key={league.hash}
                  href={`/leagues/${league.hash}`}
                  label={league.hash} />
              ))}
            <Separator />
            {(leaguesData && (leaguesData.length > 5 || leaguesData.some(({ league }) => league.status === 'Inactive'))) && (
              <SideNavLink
                className='text-nowrap'
                href='/leagues'
                label='View All Leagues' />
            )}
            <CreateLeagueModal>
              <SidebarMenuButton asChild size='lg'>
                <span className='w-full flex gap-5  items-center transition-all text-nowrap'>
                  Create League
                  <ListPlus />
                </span>
              </SidebarMenuButton>
            </CreateLeagueModal>
          </SidebarMenuSub>
        </AccordionContent>
      </AccordionItem>
    </Accordion >
  );
}

