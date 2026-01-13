import { SignIn } from '@clerk/nextjs';
import { type ReactNode } from 'react';
import LeagueHeader from '~/components/leagues/layout/leagueHeader';
import { leagueMemberAuth } from '~/lib/auth';

export interface LeaguePageProps {
  params: Promise<{
    hash: string;
  }>;
}

export interface LeagueLayoutProps extends LeaguePageProps {
  children: ReactNode;
}

export default async function LeagueLayout({ children, params }: LeagueLayoutProps) {
  const { hash } = await params;
  const { memberId } = await leagueMemberAuth(hash);

  if (!memberId) {
    return (
      <div className='h-[calc(100svh-1rem)]'>
        <div className='sticky z-50 flex flex-col w-full justify-center bg-card shadow-lg shadow-primary/20 px-4 py-4 items-center border-b-2 border-primary/20'>
          <span className='flex items-center justify-center gap-3'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <h1 className='text-3xl md:text-4xl font-black uppercase tracking-tight text-center'>Sign In to View League</h1>
            <span className='h-6 w-1 bg-primary rounded-full' />
          </span>
        </div>
        <div className='flex flex-col items-center gap-4 my-2'>
          <SignIn routing='hash' forceRedirectUrl={`/leagues/${hash}`} />
        </div>
      </div>
    );
  }

  return (
    <>
      <LeagueHeader />
      {children}
    </>
  );
}
