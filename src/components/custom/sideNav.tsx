'use client';
import { useRouter } from 'next/navigation';
import { type ReactNode } from 'react';
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { SidebarMenuButton, useSidebar, SidebarSeparator } from '~/components/ui/sidebar';
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from '~/components/ui/sidebar';
import { BookUser, Home, LineChart, Trophy, LoaderCircle, LogIn } from 'lucide-react';

export default function SideNav() {
  const { setOpen } = useSidebar();

  return (
    <Sidebar
      collapsible='icon'
      variant='sidebar'
      onMouseOver={() => setOpen(true)}
      onMouseOut={() => setOpen(false)}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SideNavLink
              href='/'
              icon={<Home />}
              label='Home' />
            <SideNavLink
              href='/leagues'
              icon={<Trophy />}
              label='Leagues' />
            <SideNavLink
              href='/seasons'
              icon={<BookUser />}
              label='Seasons'>
            </SideNavLink>
            <SideNavLink
              href='/playground'
              icon={<LineChart />}
              label='Playground'>
            </SideNavLink>
            <SidebarSeparator />
          </SidebarMenu>
          <SideNavFooter />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar >
  );
}

export function SideNavFooter() {
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

interface SideNavLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
}

export function SideNavLink({ href, icon, label }: SideNavLinkProps) {
  const sidebar = useSidebar();
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
    if (sidebar.openMobile) sidebar.toggleSidebar();
  };

  return (
    <SidebarMenuButton onClick={handleClick}>
      {icon}
      {label}
    </SidebarMenuButton>
  );
}

