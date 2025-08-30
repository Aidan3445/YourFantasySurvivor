// middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { leaguesSchema } from '~/server/db/schema/leagues';
import { and, count, eq } from 'drizzle-orm';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';


/* Routing Logic
 
    {Home OR Leagues}                  {Leagues/:leagueHash/:route*}                      
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
    '/leagues/:leagueHash/:path*',
    '/api/leagues/:leagueHash/:path*',
  ],
};


export default clerkMiddleware(async (auth, req) => {
  // Authenticate the user
  const res = await auth();
  const userId = res.sessionClaims?.userId ?? res.userId;
  const sessionId = res.sessionId;

  // Check if the user is logged in
  if (!userId || !sessionId) {
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
    const hasLeagues = await db
      .select({ count: count() })
      .from(leaguesSchema)
      .innerJoin(leagueMembersSchema, eq(leagueMembersSchema.leagueId, leaguesSchema.leagueId))
      .where(eq(leagueMembersSchema.userId, userId))
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
const leagueRouteMatcher = createRouteMatcher(['/leagues/:leagueHash/:path*']);
async function leagueRoute(req: NextRequest, userId: string) {
  if (leagueRouteMatcher(req)) {
    const url = req.nextUrl;
    const pathname = url.pathname;
    const leagueHash = pathname.split('/')[2]!;
    const currentRoute = pathname.split('/')[3];

    const leagueStatus = await db
      .select({ leagueStatus: leaguesSchema.leagueStatus })
      .from(leaguesSchema)
      .innerJoin(leagueMembersSchema, eq(leagueMembersSchema.leagueId, leaguesSchema.leagueId))
      .where(and(
        eq(leaguesSchema.leagueHash, leagueHash),
        eq(leagueMembersSchema.userId, userId)))
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
      return NextResponse.redirect(new URL(`/leagues/${leagueHash}/${expectedRoute ?? ''}`, req.url));
    }

    return NextResponse.next();
  }

  return null;
}
