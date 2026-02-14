import { type Metadata } from 'next';
import { type ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Trial by Fire',
  description: 'A fantasy league for the TV show Survivor',
  openGraph: {
    title: 'Trial by Fire - A Fantasy League for Survivor',
    description: 'Play with scoring rules for Survivor seasons',
    images: ['/LogoFullOpaque.png'],
  }
};

interface PlaygroundLayoutProps {
  children: ReactNode;
}

export default function PlaygroundLayout({ children }: PlaygroundLayoutProps) {
  return children;
}
