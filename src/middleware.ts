// middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from './server/db';
import { leaguesSchema } from './server/db/schema/leagues';
import { and, eq } from 'drizzle-orm';
import { leagueMembersSchema } from './server/db/schema/leagueMembers';

const isLeagueRoute = createRouteMatcher(['/leagues/:leagueHash/:path*']);

export default clerkMiddleware(async (auth, req) => {
  if (!isLeagueRoute(req)) {
    return NextResponse.next();
  }

  const res = await auth();
  const userId = res.sessionClaims?.userId ?? res.userId;
  const sessionId = res.sessionId;

  if (!userId || !sessionId) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const url = req.nextUrl;
  const pathname = url.pathname;
  const leagueHash = pathname.split('/')[2];
  const currentRoute = pathname.split('/')[3];

  const leagueStatus = await db
    .select({ leagueStatus: leaguesSchema.leagueStatus })
    .from(leaguesSchema)
    .innerJoin(leagueMembersSchema, eq(leagueMembersSchema.leagueId, leaguesSchema.leagueId))
    .where(and(
      eq(leaguesSchema.leagueHash, leagueHash!),
      eq(leagueMembersSchema.userId, userId)))
    .then((leagues) => leagues[0]?.leagueStatus);
  if (!leagueStatus) {
    console.log('League not found', leagueHash, userId, leagueStatus, pathname);
    return NextResponse.redirect(new URL('/leagues', req.url));
  }

  let expectedRoute: string | undefined;
  if (leagueStatus === 'Predraft') {
    expectedRoute = 'predraft';
  } else if (leagueStatus === 'Draft') {
    expectedRoute = 'draft';
  } else {
    expectedRoute = undefined;
  }

  // Redirect if on the wrong route
  if (currentRoute !== expectedRoute) {
    return NextResponse.redirect(new URL(`/leagues/${leagueHash}/${expectedRoute ?? ''}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/leagues/:leagueHash/:path*',
    '/api/leagues/:leagueHash/:path*',
  ],
};
