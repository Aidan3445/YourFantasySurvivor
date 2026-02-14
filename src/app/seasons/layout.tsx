import { type Metadata } from 'next';
import { type ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Trial by Fire',
  description: 'A fantasy league for the TV show Survivor',
  openGraph: {
    title: 'Trial by Fire - A Fantasy League for Survivor',
    description: 'Explore past and current seasons of Survivor',
    images: ['/LogoFullOpaque.png'],
  }
};

interface SeasonsLayoutProps {
  children: ReactNode;
}

export default function SeasonsLayout({ children }: SeasonsLayoutProps) {
  return children;
}
