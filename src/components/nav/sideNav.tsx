import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { SidebarMenuButton, SidebarSeparator } from '~/components/ui/sidebar';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from '~/components/ui/sidebar';
import { BookUser, Home, Flame, Trophy, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { type NavLinkProps } from './navSelector';

export default function SideNav() {
  return (
    <Sidebar variant='sidebar' collapsible='icon'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SideNavLink href='/' icon={<Home />} label='Home' />
            <SideNavLink href='/leagues' icon={<Trophy />} label='Leagues' />
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
        <LoaderCircle size={32} className='animate-spin mt-0.5' color='#7f633f' />
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

function SideNavLink({ href, icon, label }: NavLinkProps) {
  return (
    <SidebarMenuButton asChild size='lg'>
      <Link className='w-full flex gap-5 items-center' href={href}>
        {icon}
        {label}
      </Link>
    </SidebarMenuButton>
  );
}

