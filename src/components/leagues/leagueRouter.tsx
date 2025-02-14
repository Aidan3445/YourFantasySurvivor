'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLeague } from '~/hooks/useLeague';

export type LeagueRoutes = 'predraft' | 'draft' | 'main';

export interface LeagueRouterProps {
  currentRoute: LeagueRoutes;
}

export default function LeagueRouter({ currentRoute }: LeagueRouterProps) {
  const {
    league: {
      leagueHash,
      leagueStatus,
    }
  } = useLeague();
  const router = useRouter();

  useEffect(() => {
    if (leagueStatus === 'Predraft' && currentRoute !== 'predraft') {
      router.push(`/leagues/${leagueHash}/predraft`);
    } else if (leagueStatus === 'Draft' && currentRoute !== 'draft') {
      router.push(`/leagues/${leagueHash}/draft`);
    } else if ((leagueStatus === 'Active' || leagueStatus === 'Inactive') && currentRoute !== 'main') {
      router.push(`/leagues/${leagueHash}`);
    }
  }, [leagueStatus, currentRoute, leagueHash, router]);

  return null;
}


