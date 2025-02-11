import '~/styles/globals.css';

import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { type ReactNode, StrictMode } from 'react';
import { SidebarProvider } from '~/components/ui/sidebar';
import Nav from '~/components/nav/navSelector';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Your Fantasy Survivor',
  description: 'A fantasy league for the TV show Survivor',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: { children: ReactNode }) {


  return (
    <StrictMode>
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
              {children}
            </SidebarProvider>
          </body>
        </html>
      </ClerkProvider>
    </StrictMode>
  );
}
