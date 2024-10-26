import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import {
  Sidebar, SidebarContent, SidebarMenu,
  SidebarMenuButton,
  SidebarTrigger,
} from './commonUI/sideBar';
import { LoaderCircle, Trophy, Home, BookUser, LineChart, LogIn } from 'lucide-react';

export default function SideNav() {
  return (
    <Sidebar collapsible='icon'>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuButton className='text-nowrap'>
            <SidebarTrigger />
            Your Fantasy Survivor
          </SidebarMenuButton>
          <SidebarMenuButton>
            <Home size={32} />
            Home
          </SidebarMenuButton>
          <SidebarMenuButton>
            <Trophy size={32} />
            Leagues
          </SidebarMenuButton>
          <SidebarMenuButton>
            <BookUser size={32} />
            Seasons
          </SidebarMenuButton>
          <SidebarMenuButton>
            <LineChart size={32} />
            Playground
          </SidebarMenuButton>
          <SidebarMenuButton>
            <ClerkLoading>
              <LoaderCircle className='self-center animate-spin' size={32} color='#7f633f' />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <SignInButton>
                  <LogIn size={32} />
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </ClerkLoaded>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar >
  );
}

