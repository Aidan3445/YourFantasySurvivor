import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { SidebarMenuButton, SidebarSeparator } from '~/components/ui/sidebar';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from '~/components/ui/sidebar';
import { BookUser, Home, LineChart, Trophy, LoaderCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { type NavLinkProps } from './navSelector';

export default function SideNav() {
  return (
    <Sidebar variant='sidebar'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SideNavLink href='/' icon={<Home />} label='Home' />
            <SideNavLink href='/leagues' icon={<Trophy />} label='Leagues' />
            <SideNavLink href='/seasons' icon={<BookUser />} label='Seasons' />
            <SideNavLink href='/playground' icon={<LineChart />} label='Playground' />
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
        <SignedOut>
          <SidebarMenuButton asChild>
            <SignInButton>
              <span className='flex gap-1 items-center'>
                <LogIn />
                <p>Sign In</p>
              </span>
            </SignInButton>
          </SidebarMenuButton>
        </SignedOut>
        <SidebarMenuButton className='overflow-visible'>
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
    <SidebarMenuButton>
      <Link className='w-full flex gap-4 items-center' href={href}>
        {icon}
        {label}
      </Link>
    </SidebarMenuButton>
  );
}

