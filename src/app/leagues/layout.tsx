import { type Metadata } from 'next';
import { type ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Trial by Fire',
  description: 'A fantasy league for the TV show Survivor',
  openGraph: {
    title: 'Trial by Fire - Your Leagues on TBF',
    description: 'View your leagues',
    images: ['/LogoFullOpaque.png'],
  }
};

interface LeaguesLayoutProps {
  children: ReactNode;
}

export default function LeaguesLayout({ children }: LeaguesLayoutProps) {
  return children;
}
