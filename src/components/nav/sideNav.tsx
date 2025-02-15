'use client';

import { ClerkLoaded, ClerkLoading, SignedIn, UserButton } from '@clerk/nextjs';
import { SidebarMenuButton, SidebarMenuSub, SidebarSeparator } from '~/components/ui/sidebar';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from '~/components/ui/sidebar';
import { BookUser, Home, Flame, Trophy, LoaderCircle, ListPlus } from 'lucide-react';
import Link from 'next/link';
import { type NavLinkProps } from './navSelector';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useYfsUser } from '~/hooks/useYfsUser';
import { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';
import { useParams, usePathname } from 'next/navigation';

export default function SideNav() {
  return (
    <Sidebar variant='sidebar' collapsible='none'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SideNavLink href='/' icon={<Home />} label='Home' />
            <SideNavLeagues />
            <SideNavLink href='/seasons' icon={<BookUser />} label='Seasons' />
            <SideNavLink href='/playground' icon={<Flame />} label='Playground' />
            <SidebarSeparator />
          </SidebarMenu>
          <SideNavFooter />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar >
  );
}

function SideNavFooter() {
  return (
    <SidebarMenu className='mt-2'>
      <ClerkLoading>
        <SidebarMenuButton size='lg'>
          <LoaderCircle className='animate-spin' color='#7f633f' />
        </SidebarMenuButton>
      </ClerkLoading>
      <ClerkLoaded>
        <SidebarMenuButton size='lg'>
          <SignedIn>
            <UserButton showName />
          </SignedIn>
        </SidebarMenuButton>
      </ClerkLoaded>
    </SidebarMenu>
  );
}

function SideNavLink({ href, icon, label, className }: NavLinkProps) {
  return (
    <SidebarMenuButton asChild size='lg'>
      <Link className={cn('w-full flex gap-5 items-center transition-all', className)} href={href}>
        {icon}
        {label}
      </Link>
    </SidebarMenuButton>
  );
}

function SideNavLeagues() {
  const { leagues } = useYfsUser();
  const [open, setOpen] = useState('');
  const { leagueHash } = useParams();
  const path = usePathname();

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
        <SidebarMenuButton asChild size='lg'>
          <AccordionTrigger className='mb-1 hover:no-underline font-normal data-[state=open]:mb-0 transition-all'>
            <span className='w-full flex gap-5 items-center'>
              <Trophy />
              Leagues
            </span>
          </AccordionTrigger>
        </SidebarMenuButton>
        <AccordionContent className='pb-1'>
          <SidebarMenuSub>
            {leagues.map(league => (
              <SideNavLink
                className={league.leagueHash === leagueHash ? 'font-semibold' : ''}
                key={league.leagueHash}
                href={`/leagues/${league.leagueHash}`}
                label={league.leagueName} />
            ))}
            <SideNavLink
              href='/leagues/new'
              icon={<ListPlus />}
              label='Create League'
              className={cn('text-nowrap italic flex-row-reverse justify-between',
                path === '/leagues/new' && 'font-semibold')} />
          </SidebarMenuSub>
        </AccordionContent>
      </AccordionItem>
    </Accordion >
  );


}

