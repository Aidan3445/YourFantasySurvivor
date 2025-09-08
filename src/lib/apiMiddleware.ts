import 'server-only';

import { NextResponse } from 'next/server';
import { auth, leagueMemberAuth, systemAdminAuth } from '~/lib/auth';
import type { LeagueRouteParams, VerifiedLeagueMemberAuth } from '~/types/api';
import { type LeagueMemberRole } from '~/types/leagueMembers';

export function withAuth(handler: (userId: string) => Promise<NextResponse>) {
  return async () => {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(userId);
  };
}

function withLeagueAuth(minimumPermissions: LeagueMemberRole) {
  return function(handler: (auth: VerifiedLeagueMemberAuth) => Promise<NextResponse>) {
    return async (context: LeagueRouteParams) => {
      const { hash } = await context.params;

      const auth = await leagueMemberAuth(hash);

      if (!auth.userId) {
        console.log('Not authenticated');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!auth.memberId) {
        console.log('Not a league member', { userId: auth.userId, leagueHash: hash });
        return NextResponse.json({ error: 'Not a league member' }, { status: 403 });
      }

      switch (minimumPermissions) {
        case 'Owner':
          if (auth.role !== 'Owner') {
            console.log('Not the league owner', { userId: auth.userId, leagueHash: hash, role: auth.role });
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }
          break;
        case 'Admin':
          if (auth.role === 'Member') {
            console.log('Not a league admin', { userId: auth.userId, leagueHash: hash, role: auth.role });
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }
          break;
        default:
          // No additional checks for 'Member' role
          break;
      }

      const verifiedAuth = auth as VerifiedLeagueMemberAuth;

      return handler(verifiedAuth);
    };
  };
}

export const withLeagueMemberAuth = withLeagueAuth('Member');
export const withLeagueAdminAuth = withLeagueAuth('Admin');
export const withLeagueOwnerAuth = withLeagueAuth('Owner');

export function withSystemAdminAuth(handler: (userId: string) => Promise<NextResponse>) {
  return async () => {
    const { userId } = await systemAdminAuth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(userId);
  };
}




