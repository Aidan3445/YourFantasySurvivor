'use client';

import { ClerkLoaded, ClerkLoading, SignedIn, UserButton } from '@clerk/nextjs';
import { SidebarMenuButton, SidebarMenuSub } from '~/components/ui/sidebar';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from '~/components/ui/sidebar';
import { ListPlus, LoaderCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { type NavLinkProps } from './navSelector';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { useYfsUser } from '~/hooks/useYfsUser';
import { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';
import { useParams } from 'next/navigation';
import { CreateLeagueModal } from '../leagues/createLeague';
import { Separator } from '../ui/separator';
import Image from 'next/image';

export default function SideNav() {
  return (
    <Sidebar className='hidden md:block' variant='sidebar' collapsible='none'>
      <SidebarContent className='h-svh overflow-y-auto sticky top-0'>
        <SidebarGroup>
          <SidebarMenu>
            <SideNavLink
              href='/' icon={
                <Image
                  src='/Icon.ico'
                  alt='Your Fantasy Survivor Logo'
                  width={24}
                  height={24}
                  className='brightness-0' />
              }
              label='Your Fantasy Survivor' />
            <SignedIn>
              <SideNavLeagues />
            </SignedIn>
            {/*<SideNavLink href='/seasons' icon={<BookUser />} label='Seasons' />
            <SideNavLink href='/playground' icon={<Flame />} label='Playground' />
            <SidebarSeparator />*/}
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
      <SidebarMenuButton
        className='hover:bg-transparent! active:bg-transparent!'
        asChild
        size='lg'>
        <Link href='https://www.buymeacoffee.com/aidanweinberg' target='_blank' rel='noreferrer'>
          <Image
            className='hover:scale-105 active:scale-[1.075] transition-all'
            src={'https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=aidanweinberg&button_colour=40DCA5&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00'}
            alt='Buy me a coffee'
            width={200}
            height={50} />
        </Link>
      </SidebarMenuButton>
      <ClerkLoading>
        <SidebarMenuButton className='' size='lg'>
          <LoaderCircle className='animate-spin' color='#7f633f' />
        </SidebarMenuButton>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedIn>
          <SidebarMenuButton className='' size='lg'>
            <UserButton showName />
          </SidebarMenuButton>
        </SignedIn>
      </ClerkLoaded>
    </SidebarMenu >
  );
}

function SideNavLink({ href, icon, label, className }: NavLinkProps) {
  return (
    <SidebarMenuButton className='' asChild size='lg'>
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

