// middleware.ts
/*
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
*/

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { type LeagueStatus } from './server/db/defs/leagues';

const isLeagueRoute = createRouteMatcher(['/leagues/:leagueHash/:path*']);

export default clerkMiddleware(async (auth, req) => {
  if (!isLeagueRoute(req)) {
    return NextResponse.next();
  }

  await auth();

  const url = req.nextUrl;
  const pathname = url.pathname;
  const leagueHash = pathname.split('/')[2]; // Extract leagueHash
  const currentRoute = pathname.split('/')[3];

  // Fetch league status (replace with actual logic)
  const { leagueStatus } = await fetch(new URL(`/api/leagues/${leagueHash}/status`, req.url))
    .then((res) => res.json())
    .catch(() => {
      return NextResponse.redirect(new URL('/leagues', req.url));
    }) as { leagueStatus: LeagueStatus };

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
  ],
};
