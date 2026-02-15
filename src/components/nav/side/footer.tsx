'use client';

import '~/styles/globals.css';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { SidebarMenuButton, SidebarMenu } from '~/components/common/sidebar';
import { LoaderCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { type MouseEvent, useRef } from 'react';

export default function SideNavFooter() {
  const userButtonRef = useRef<HTMLDivElement>(null);

  const handleMenuButtonClick = (e: MouseEvent) => {
    e.preventDefault();
    const userButtonTrigger = userButtonRef.current?.querySelector('button');
    if (userButtonTrigger && !userButtonTrigger.contains(e.target as Node)) {
      userButtonTrigger.click();
    }
  };

  return (
    <SidebarMenu className='mt-2'>
      <SidebarMenuButton
        className='hover:bg-transparent! active:bg-transparent!'
        asChild
        size='lg'>
        <Link href='https://www.buymeacoffee.com/aidanweinberg' target='_blank' rel='noreferrer'>
          <img
            className='hover:scale-105 active:scale-[1.075] transition-all'
            src={'https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=aidanweinberg&button_colour=40DCA5&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00'}
            alt='Buy me a coffee'
            width={200}
            height={50} />
        </Link>
      </SidebarMenuButton>
      <SignedIn>
        <SidebarMenuButton className='h-10!' size='lg' onClick={handleMenuButtonClick}>
          <div className='pointer-events-none flex' ref={userButtonRef}>
            <UserButton showName fallback={
              <div>
                <LoaderCircle className='animate-spin stroke-primary' size={24} />
              </div>
            } />
          </div>
        </SidebarMenuButton>
      </SignedIn>
      <SignedOut>
        <SidebarMenuButton className='h-10!' size='lg'>
          <SignInButton mode='modal'>
            <div>
              <div className='w-full flex gap-3 items-center cursor-pointer'>
                <LogIn size={32} className='stroke-primary' />
                <p className='text-primary'> Sign In</p>
              </div>
            </div>
          </SignInButton>
        </SidebarMenuButton>
      </SignedOut>
    </SidebarMenu>
  );
}
