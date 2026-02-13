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

  const leaguePath = pathname.startsWith('/leagues');

  if (leaguesData?.length === 0) {
    return (
      <SideNavLink href='/leagues' icon={Trophy} label='Leagues' />
    );
  }

  const notInactiveLeagues = leaguesData?.filter(({ league }) => league.status !== 'Inactive') ?? [];

  return (
    <Accordion
      type='single'
      className='border-b-primary'
      collapsible
      value={open}
      onValueChange={() => toggleOpen()}>
      <AccordionItem value='leagues'>
        <SidebarMenuButton className='h-10!' asChild size='lg'>
          <AccordionTrigger className='hover:no-underline font-normal mb-1 data-[state=open]:mb-0 transition-all stroke-primary'>
            <span className={cn(
              'w-full flex gap-5 items-center text-primary transition-all',
              !open && leaguePath && 'font-semibold'
            )}>
              <Trophy size={26} className='stroke-primary' />
              Leagues
            </span>
          </AccordionTrigger>
        </SidebarMenuButton>
        <AccordionContent className='pb-1'>
          <SidebarMenuSub className='border-l-primary'>
            {notInactiveLeagues
              .slice(0, 5)
              .map(({ league }) => (
                <SideNavLink
                  key={league.hash}
                  href={`/leagues/${league.hash}`}
                  label={league.name}
                  pathnameMatch={`/leagues/${league.hash}`} />
              ))}
            {notInactiveLeagues.length > 5 && (
              <SideNavLink
                className='text-nowrap text-primary font-normal'
                href='/leagues'
                label={`+${notInactiveLeagues.length - 5} more active`} />
            )}
            <Separator className='bg-primary' />
            {(leaguesData && (leaguesData.length > 5 || leaguesData.some(({ league }) => league.status === 'Inactive'))) && (
              <SideNavLink className='text-nowrap text-primary' href='/leagues' label='View All Leagues' />
            )}
            <CreateLeagueModal>
              <SidebarMenuButton asChild size='lg'>
                <span className='w-full flex gap-5  items-center transition-all text-nowrap text-primary h-10!'>
                  Create League
                  <ListPlus className='stroke-primary' size={24} />
                </span>
              </SidebarMenuButton>
            </CreateLeagueModal>
          </SidebarMenuSub>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

