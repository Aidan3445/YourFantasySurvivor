import '~/styles/globals.css';

import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import TopNav from './_components/topNav';
import { type ReactNode, StrictMode } from 'react';
import { Toaster } from './_components/commonUI/toaster';
import SideNav from './_components/sideNav';
import { SidebarProvider } from './_components/commonUI/sideBar';
import { CustomSidebarTrigger } from './_components/sideNavHelpers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Your Fantasy Survivor',
  description: 'The best place to play fantasy survivor',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const oldNav = false;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <ClerkProvider
        appearance={{ variables: { colorPrimary: '#684528', colorBackground: '#EED9BF' } }}>
        <html lang='en'>
          <body className={`font-sans ${inter.variable}`}>
            <SidebarProvider className='page flex flex-col' defaultOpen={false}>
              {!oldNav && <CustomSidebarTrigger />}
              {oldNav ? <TopNav /> : <SideNav />}
              {children}
              <Toaster />
            </SidebarProvider>
          </body>
        </html>
      </ClerkProvider>
    </StrictMode>
  );
}

