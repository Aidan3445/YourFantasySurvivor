import '~/styles/globals.css';

import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import TopNav from './_components/topNav';
import { type ReactNode, StrictMode } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Your Fantasy Survivor',
  description: 'The best place to play fantasy survivor',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: {
    children: ReactNode
}) {
  return (
    <StrictMode>
      <ClerkProvider
        appearance={{
          variables: { colorPrimary: '#684528', colorBackground: '#EED9BF' },
        }}>
        <html lang='en'>
          <body className={`font-sans ${inter.variable}`}>
            <div className='page'>
              <TopNav />
              {children}
            </div>
          </body>
        </html>
      </ClerkProvider>
    </StrictMode>
  );
}
