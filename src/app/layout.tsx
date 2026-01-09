import '~/styles/globals.css';

import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { type ReactNode, StrictMode } from 'react';
import { SidebarProvider } from '~/components/common/sidebar';
import Nav from '~/components/nav/navSelector';
import { type Metadata } from 'next';
import QueryClientContextProvider from '~/context/reactQueryContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Your Fantasy Survivor',
  description: 'A fantasy league for the TV show Survivor',
  icons: [{ rel: 'icon', url: '/Icon.ico' }],
};

interface RootLayoutProps {
  children: ReactNode;
}



export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <StrictMode>
      <QueryClientContextProvider>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#B09472',
              colorBackground: '#EED9BF',
            }
          }}>
          <html lang='en'>
            <body className={`font-sans ${inter.variable}`}>
              <SidebarProvider defaultOpen>
                <Nav />
                <main className='w-full md:w-[calc(100svw-var(--sidebar-width))] md:p-2 pb-0 md:h-svh h-[calc(100svh-(var(--navbar-height)))]'>
                  <div className='w-full md:shadow-lg md:bg-secondary md:rounded-3xl md:border overflow-hidden'>
                    {children}
                  </div>
                </main>
              </SidebarProvider>
            </body>
          </html>
        </ClerkProvider>
      </QueryClientContextProvider>
    </StrictMode>
  );
}
