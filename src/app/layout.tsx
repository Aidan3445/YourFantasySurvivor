import '~/styles/globals.css';

import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { type ReactNode, StrictMode } from 'react';
import { SidebarProvider } from '~/components/ui/sidebar';
import Nav, { BottomNavSpacer } from '~/components/nav/navSelector';
import UserProvider from '~/context/yfsUserContext';
import { QUERIES } from './api/leagues/query';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Your Fantasy Survivor',
  description: 'A fantasy league for the TV show Survivor',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

interface RootLayoutProps {
  children: ReactNode;
}


export default async function RootLayout({ children }: RootLayoutProps) {
  const leagues = await QUERIES.getLeagues();

  return (
    <StrictMode>
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: '#B09472',
            colorBackground: '#EED9BF',
          }
        }}>
        <UserProvider leagues={leagues}>
          <html lang='en'>
            <body className={`font-sans ${inter.variable} `}>
              <SidebarProvider defaultOpen>
                <Nav />
                <div className='w-full'>
                  {children}
                  <BottomNavSpacer />
                </div>
              </SidebarProvider>
            </body>
          </html>
        </UserProvider>
      </ClerkProvider>
    </StrictMode>
  );
}
