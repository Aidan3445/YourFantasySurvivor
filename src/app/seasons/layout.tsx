import { type Metadata } from 'next';
import Image from 'next/image';
import { Suspense, type ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Trial by Fire - A Fantasy League for Survivor',
  description: 'Explore past and current seasons of Survivor',

};

interface SeasonsLayoutProps {
  children: ReactNode;
}

export default function SeasonsLayout({ children }: SeasonsLayoutProps) {
  return <Suspense fallback={
    <Image
      src='/LogoDisc.png'
      alt='Loading'
      width={100}
      height={100}
      className='animate-loading-spin w-auto h-auto' />
  }>
    {children}
  </Suspense>;
}
