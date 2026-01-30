import { SignIn } from '@clerk/nextjs';
import { type ReactNode } from 'react';
import LeagueHeader from '~/components/leagues/layout/leagueHeader';
import { leagueMemberAuth } from '~/lib/auth';
import getPublicLeague from '~/services/leagues/query/public';
import type { Metadata } from 'next';
import { metadata as baseMetadata } from '~/app/layout';
import Link from 'next/link';

export interface LeaguePageProps {
  params: Promise<{
    hash: string;
  }>;
}

export async function generateMetadata(
  { params }: LeaguePageProps,
): Promise<Metadata> {
  const { hash } = await params;
  const league = await getPublicLeague(hash);

  if (!league) {
    return {
      ...baseMetadata,
      title: 'League Not Found | YFS',
    };
  }

  const getStatusMessage = () => {
    switch (league.status) {
      case 'Draft':
        return 'DRAFT IS LIVE';
      case 'Inactive':
        return 'SEASON ENDED';
      case 'Predraft':
      case 'Active':
        return '';
      default:
        return league.status;
    }
  };

  return {
    ...baseMetadata,
    title: `${league.name} | YFS`,
    openGraph: {
      title: `${league.name} - ${getStatusMessage()}`,
      description: `${league.season} | Join the competition on Your Fantasy Survivor!`,
      images: ['https://i.imgur.com/xS6JQdr.png'],
    }
  };
}

export interface LeagueLayoutProps extends LeaguePageProps {
  children: ReactNode;
}

export default async function LeagueLayout({ children, params }: LeagueLayoutProps) {
  const { hash } = await params;
  const { memberId, userId } = await leagueMemberAuth(hash);
  const league = await getPublicLeague(hash, userId);

  if (!userId) {
    return (
      <div className='h-[calc(100svh-1rem)]'>
        <div className='sticky z-50 flex flex-col w-full justify-center bg-card shadow-lg shadow-primary/20 px-4 py-4 items-center border-b-2 border-primary/20'>
          <span className='flex items-center justify-center gap-3'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <h1 className='text-3xl md:text-4xl font-black uppercase tracking-tight text-center'>
              Sign In to View League
            </h1>
            <span className='h-6 w-1 bg-primary rounded-full' />
          </span>
        </div>
        <div className='flex flex-col items-center gap-4 my-2'>
          <SignIn routing='hash' forceRedirectUrl={`/leagues/${hash}`} />
        </div>
      </div>
    );
  }

  if (!memberId) {
    return (
      <div className='h-[calc(100svh-1rem)]'>
        <LeagueHeader league={league} mode={{ ...league }} />
        <div className='flex items-center gap-2 justify-center p-2 bg-card rounded-lg shadow-md shadow-primary/10 border-2 border-primary/20 mt-44 mx-4'>
          <span className='h-5 w-0.5 bg-primary rounded-full' />
          <Link href='/leagues'>
            <h2 className='text-2xl font-black uppercase tracking-tight text-center hover:text-primary transition-colors'>
              Back to Leagues
            </h2>
          </Link>
          <span className='h-5 w-0.5 bg-primary rounded-full' />
        </div>
      </div>
    );
  }

  return (
    <>
      <LeagueHeader league={league} />
      {children}
    </>
  );
}
