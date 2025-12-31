'use client';

import { SidebarMenuButton, SidebarMenuSub } from '~/components/common/sidebar';
import { ListPlus, Trophy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { useEffect, useState } from 'react';
import CreateLeagueModal from '~/components/leagues/actions/league/create/modal';
import { Separator } from '~/components/common/separator';
import SideNavLink from '~/components/nav/side/link';
import { useLeagues } from '~/hooks/user/useLeagues';
import { usePathname } from 'next/navigation';
import { cn } from '~/lib/utils';

export default function SideNavLeagues() {
  const { data: leaguesData } = useLeagues();
  const pathname = usePathname();
  const [open, setOpen] = useState('');

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
    return (
      <SideNavLink href='/leagues' icon={<Trophy className='stroke-primary' />} label='Leagues' />
    );
  }

  return (
    <Accordion
      type='single'
      className='border-b-primary'
      collapsible
      value={open}
      onValueChange={() => toggleOpen()}>
      <AccordionItem value='leagues'>
        <SidebarMenuButton className='' asChild size='lg'>
          <AccordionTrigger className='mb-1 hover:no-underline font-normal data-[state=open]:mb-0 transition-all stroke-primary'>
            <span className={cn(
              'w-full flex gap-5 items-center text-primary transition-all',
              !open && (pathname.startsWith('/leagues') ? 'font-semibold' : '')
            )}>
              <Trophy className='stroke-primary' />
              Leagues
            </span>
          </AccordionTrigger>
        </SidebarMenuButton>
        <AccordionContent className='pb-1'>
          <SidebarMenuSub className='border-l-primary'>
            {leaguesData?.filter(({ league }) => league.status !== 'Inactive')
              .slice(0, 5)
              .map(({ league }) => (
                <SideNavLink
                  key={league.hash}
                  href={`/leagues/${league.hash}`}
                  label={league.name}
                  pathnameMatch={`/leagues/${league.hash}`} />
              ))}
            <Separator className='bg-primary' />
            {(leaguesData && (leaguesData.length > 5 || leaguesData.some(({ league }) => league.status === 'Inactive'))) && (
              <SideNavLink className='text-nowrap text-primary' href='/leagues' label='View All Leagues' />
            )}
            <CreateLeagueModal>
              <SidebarMenuButton asChild size='lg'>
                <span className='w-full flex gap-5  items-center transition-all text-nowrap text-primary'>
                  Create League
                  <ListPlus className='stroke-primary' />
                </span>
              </SidebarMenuButton>
            </CreateLeagueModal>
          </SidebarMenuSub>
        </AccordionContent>
      </AccordionItem>
    </Accordion >
  );
}

