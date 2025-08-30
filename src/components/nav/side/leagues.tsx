'use client';

import { SidebarMenuButton, SidebarMenuSub } from '~/components/common/sidebar';
import { ListPlus, Trophy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { useYfsUser } from '~/hooks/useYfsUser';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CreateLeagueModal } from '~/components/leagues/actions/league/create/view';
import { Separator } from '~/components/common/separator';
import SideNavLink from '~/components/nav/side/link';

export default function SideNavLeagues() {
  const { leagues } = useYfsUser();
  const [open, setOpen] = useState('');
  const { leagueHash } = useParams();

  useEffect(() => {
    if (leagues.length > 0) {
      setOpen('leagues');
    }
  }, [leagues, setOpen]);

  const toggleOpen = () => {
    if (open === 'leagues') {
      setOpen('');
    } else {
      setOpen('leagues');
    }
  };

  if (leagues.length === 0) {
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
            {leagues
              .filter(league => league.leagueStatus !== 'Inactive')
              .slice(0, 5)
              .map(league => (
                <SideNavLink
                  className={league.leagueHash === leagueHash ? 'font-semibold' : ''}
                  key={league.leagueHash}
                  href={`/leagues/${league.leagueHash}`}
                  label={league.leagueName} />
              ))}
            <Separator />
            {(leagues.length > 5 || leagues.some(league => league.leagueStatus === 'Inactive')) && (
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

