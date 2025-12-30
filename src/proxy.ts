// middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { leagueSchema } from '~/server/db/schema/leagues';
import { and, count, eq } from 'drizzle-orm';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { systemSchema } from '~/server/db/schema/system';


/* Routing Logic
 
    {Home OR Leagues}                  {Leagues/:hash/:route*}                      
           |                                        |
      Logged in?                               Logged in?
       /     \                                   /     \                               
    <No>     <Yes>                            <No>    <Yes>
    /           \                             /          \
[Login] ~~~~> Has leagues? <-------+     [Login] ~~~> In League?                        
                /     \            |                     /    \
             <No>     <Yes>        |                  <Yes>  <No>
             /           \         |                   /       \
        [Home]         [Leagues]   |     [League/:route*]    Route?                  
                                   |                         /    \
                                   +---------------- </:other>   </join>                       
                                                                      |
                                                                    [Join]
*/

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/leagues/:hash/:path*',
    '/api/leagues/:hash/:path*',
  ],
};


export default clerkMiddleware(async (auth, req) => {
  // Only handle GET requests
  if (req.method !== 'GET') {
    return NextResponse.next();
  }


  // Authenticate the user
  const res = await auth();
  const userId = res.sessionClaims?.userId ?? res.userId;
  const sessionId = res.sessionId;

  // Check if the user is logged in
  if (!userId || !sessionId) {
    return NextResponse.next();
  }

  // Sys auth can get no redirects
  const isSys = await db.select()
    .from(systemSchema)
    .where(and(
      eq(systemSchema.userId, userId),
      eq(systemSchema.noRedirects, true)))
    .then((r) => r.length > 0);
  if (isSys) {
    return NextResponse.next();
  }

  // Check if the request is for home or leagues
  const leaguesRedirect = await leaguesRoute(req, userId);
  if (leaguesRedirect) {
    // If the user has leagues, redirect to leagues page
    console.log('Redirecting to home or leagues', req.nextUrl.pathname);
    return leaguesRedirect;
  }

  // Check if the request is for a league Route
  const leagueRedirect = await leagueRoute(req, userId);
  if (leagueRedirect) {
    console.log('Redirecting to league route', req.nextUrl.pathname);
    // If the user is in a league, continue to the league route
    return leagueRedirect;
  }

  return NextResponse.next();
});

// Home or Leagues Route Matcher
const leaguesMatcher = createRouteMatcher(['/leagues']);
async function leaguesRoute(req: NextRequest, userId: string) {
  if (leaguesMatcher(req)) {
    console.log('Checking leagues for user', userId, req.method);
    const hasLeagues = await db
      .select({ count: count() })
      .from(leagueSchema)
      .innerJoin(leagueMemberSchema, eq(leagueMemberSchema.leagueId, leagueSchema.leagueId))
      .where(eq(leagueMemberSchema.userId, userId))
      .then((result) => (result[0]?.count ?? 0) > 0);

    const expectedRoute = hasLeagues ? '/leagues' : '/';

    if (req.nextUrl.pathname !== expectedRoute) {
      // Redirect to leagues if user has leagues, otherwise to home
      return NextResponse.redirect(new URL(expectedRoute, req.url));
    } else {
      return NextResponse.next();
    }
  }

  return null;
}

// League Route matcher
const leagueRouteMatcher = createRouteMatcher(['/leagues/:hash/:path*']);
async function leagueRoute(req: NextRequest, userId: string) {
  if (leagueRouteMatcher(req)) {
    const url = req.nextUrl;
    const pathname = url.pathname;
    const hash = pathname.split('/')[2]!;
    const currentRoute = pathname.split('/')[3];

    const leagueStatus = await db
      .select({ leagueStatus: leagueSchema.status })
      .from(leagueSchema)
      .innerJoin(leagueMemberSchema, eq(leagueMemberSchema.leagueId, leagueSchema.leagueId))
      .where(and(
        eq(leagueSchema.hash, hash),
        eq(leagueMemberSchema.userId, userId)))
      .then((leagues) => leagues[0]?.leagueStatus);
    if (!leagueStatus) {
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
      return NextResponse.redirect(new URL(`/leagues/${hash}/${expectedRoute ?? ''}`, req.url));
    }

    return NextResponse.next();
  }

  return null;
}
