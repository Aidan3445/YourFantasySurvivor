'use client';
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import {
  Sidebar, SidebarContent, SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from './commonUI/sideBar';
import { LoaderCircle, Trophy, Home, BookUser, LineChart, LogIn, PanelLeftOpen, PanelLeftClose, Menu } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useRouter } from 'next/navigation';

export default function SideNav() {
  const sideBar = useSidebar();
  const user = useUser();
  const router = useRouter();

  const handleMenuClick = (route: string) => {
    router.push(route);
    sideBar.toggleSidebar();
  };

  return (
    <Sidebar collapsible='icon' variant='floating'>
      <SidebarContent>
        <SidebarMenu className='h-full'>
          <SidebarMenuButton className='text-nowrap' onClick={sideBar.toggleSidebar}>
            {sideBar.open ? <PanelLeftClose /> : <PanelLeftOpen />}
            {sideBar.isMobile ? 'Menu' : 'Your Fantasy Survivor'}
          </SidebarMenuButton>
          <SidebarMenuButton onClick={() => handleMenuClick('/')}>
            <Home />
            Home
          </SidebarMenuButton>
          <SidebarMenuButton onClick={() => handleMenuClick('/leagues')}>
            <Trophy />
            Leagues
          </SidebarMenuButton>
          <SidebarMenuButton onClick={() => handleMenuClick('/seasons')}>
            <BookUser />
            Seasons
          </SidebarMenuButton>
          <SidebarMenuButton onClick={() => handleMenuClick('/playground')}>
            <LineChart />
            Playground
          </SidebarMenuButton>
          <SidebarMenuButton className='mt-auto'>
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
                <div className='-ml-1.5 pt-1'>
                  <UserButton />
                </div>
                {(sideBar.open || sideBar.openMobile) && <span>{user.user?.fullName}</span>}
              </SignedIn>
            </ClerkLoaded>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar >
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

