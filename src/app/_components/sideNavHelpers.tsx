'use client';

import { useRouter } from 'next/navigation';
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { SidebarMenuButton, useSidebar } from './commonUI/sideBar';
import { type ReactNode } from 'react';
import { cn } from '~/lib/utils';
import { LoaderCircle, LogIn, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function SideNavHeader() {
  const sideBar = useSidebar();
  return (
    <SidebarMenuButton className='text-nowrap' onClick={sideBar.toggleSidebar}>
      {sideBar.open ? <PanelLeftClose /> : <PanelLeftOpen />}
      {sideBar.isMobile ? 'Menu' : 'Your Fantasy Survivor'}
    </SidebarMenuButton>
  );
}

export function SideNavFooter() {
  const sidebar = useSidebar();
  const user = useUser();

  return (
    <>
      <ClerkLoading>
        <SidebarMenuButton>
          <LoaderCircle className='self-center animate-spin' color='#7f633f' />
        </SidebarMenuButton>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignInButton>
            <SidebarMenuButton>
              <LogIn />
              Sign In
            </SidebarMenuButton>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <SidebarMenuButton>
            <div className='z-50 pt-1 -ml-1.5'>
              <UserButton />
            </div>
            {(sidebar.open || sidebar.openMobile) && <span>{user.user?.fullName}</span>}
          </SidebarMenuButton>
        </SignedIn>
      </ClerkLoaded>
    </>
  );
}

export function CustomSidebarTrigger() {
  const sidebar = useSidebar();

  if (!sidebar.isMobile) return null;

  return (
    <span className='flex items-center my-2 w-full'>
      <Menu
        onClick={sidebar.toggleSidebar}
        className={cn('ml-1 h-6 p-0 z-[1000] transition-all',
          sidebar.openMobile ? 'opacity-0' : 'opacity-100')} />
      <h1 className='absolute left-1/2 text-2xl font-bold transform -translate-x-1/2 text-nowrap'>Your Fantasy Survivor</h1>
    </span>
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

