'use client';
import { SignedIn } from '@clerk/nextjs';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarMenu } from '~/components/common/sidebar';
import SideNavFooter from '~/components/nav/side/footer';
import SideNavLink from '~/components/nav/side/link';
import SideNavLeagues from '~/components/nav/side/leagues';
import SysAdminNav from '~/components/nav/side/sys';
import { PlaygroundIcon, SeasonsIcon, TorchIcon } from '~/components/icons/generated';
import { Separator } from '~/components/common/separator';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';

interface SideNavProps {
  userId: string | null;
  noRedirects?: boolean;
}

export default function SideNav({ userId, noRedirects }: SideNavProps) {
  return (
    <Sidebar className='hidden md:block' variant='sidebar' collapsible='none'>
      <SidebarContent className='flex flex-col h-full gap-0'>
        <ScrollArea className='h-[calc(100svh-5rem)]'>
          <SidebarGroup className='h-full min-h-0'>
            <SidebarMenu>
              <SideNavLink href='/' icon={TorchIcon} label='Trial by Fire' />
              <SideNavLink href='/seasons' icon={SeasonsIcon} label='Seasons' />
              <SideNavLink href='/playground' icon={PlaygroundIcon} label='Playground' />
              <SignedIn>
                <SideNavLeagues />
              </SignedIn>
            </SidebarMenu>
            <SideNavFooter />
            {process.env.NODE_ENV === 'development' && (
              <SysAdminNav userId={userId} noRedirects={noRedirects} />
            )}
          </SidebarGroup>
          <ScrollBar orientation='vertical' className='w-2' />
        </ScrollArea>
        <SidebarFooter className='pb-0 px-2 pt-1 shrink-0 h-20 bg-sidebar-accent/50'>
          <div className='w-full text-center text-xs text-muted-foreground'>
            <div>
              <span className='select-none'>
                Logo & icon design by{' '}
              </span>
              <a
                href='https://www.instagram.com/edensartstudio/'
                target='_blank'
                rel='noopener noreferrer'
                className='underline underline-offset-2 transition-colors hover:text-primary/80 text-secondary'>
                @edensartstudio
              </a>
            </div>
            <Separator className='my-1' />
            <div className='select-none'>
              &copy;{new Date().getFullYear()} Trial by Fire.
              <br />
              All rights reserved.
            </div>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
