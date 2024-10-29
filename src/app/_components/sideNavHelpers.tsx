'use client';

import { useRouter } from 'next/navigation';
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { SidebarMenuButton, useSidebar } from './commonUI/sideBar';
import { useRef, type ReactNode } from 'react';
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

  const userButtonRef = useRef<HTMLButtonElement>(null);
  const handleButtonClick = () => {
    if (userButtonRef.current) {
      userButtonRef.current.click();
    }
  };

  return (
    <SidebarMenuButton className='mt-auto' onClick={handleButtonClick}>
      <ClerkLoading>
        <LoaderCircle className='self-center animate-spin' color='#7f633f' />
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <SignInButton>
            <LogIn />
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className='-ml-1.5 pt-1 z-50'>
            <UserButton />
          </div>
          {(sidebar.open || sidebar.openMobile) && <span>{user.user?.fullName}</span>}
        </SignedIn>
      </ClerkLoaded>
    </SidebarMenuButton>
  );
}

export function CustomSidebarTrigger() {
  const sidebar = useSidebar();

  if (!sidebar.isMobile) return null;

  return (
    <span className='flex items-center w-full my-2'>
      <Menu
        onClick={sidebar.toggleSidebar}
        className={cn('ml-1 h-6 p-0 z-[1000] transition-all',
          sidebar.openMobile ? 'opacity-0' : 'opacity-100')} />
      <h1 className='text-2xl font-bold absolute left-1/2 transform -translate-x-1/2 text-nowrap'>Your Fantasy Survivor</h1>
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

