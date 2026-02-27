import '~/styles/globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { type ReactNode, StrictMode, Suspense } from 'react';
import { SidebarProvider } from '~/components/common/sidebar';
import Nav from '~/components/nav/navSelector';
import { type Metadata } from 'next';
import QueryClientContextProvider from '~/context/reactQueryContext';
import FloatingActionsWidget from '~/components/shared/floatingActions/widget';
import { RebrandNotice } from '~/components/sys/rebrand';
import { TestFlightInvite } from '~/components/sys/testflightInvite';
import { LateLeagueTip } from '~/components/sys/lateLeagueTip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:1234'),
  title: 'Trial by Fire - A Fantasy League for Survivor',
  description: 'A fantasy league for the TV show Survivor',
  icons: [{ rel: 'icon', url: '/LogoDisc.png' }],
  openGraph: {
    images: ['/LogoFullOpaque.png'],
  },
};

interface RootLayoutProps {
  children: ReactNode;
}



export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <StrictMode>
      <SpeedInsights />
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
              <SidebarProvider defaultOpen style={{ '--navbar-height': '2.5rem' } as React.CSSProperties}>
                <Nav />
                <main className='w-full md:w-[calc(100svw-var(--sidebar-width))] md:p-2 pb-0 md:h-svh h-[calc(100svh-(var(--navbar-height)))]'>
                  <div className='w-full md:shadow-lg md:bg-secondary md:rounded-3xl md:border overflow-hidden'>
                    {children}
                  </div>
                </main>
                <FloatingActionsWidget />
                <Suspense fallback={null}>
                  <TestFlightInvite />
                  <RebrandNotice />
                  <LateLeagueTip />
                </Suspense>
              </SidebarProvider>
            </body>
          </html>
        </ClerkProvider>
      </QueryClientContextProvider>
    </StrictMode>
  );
}
