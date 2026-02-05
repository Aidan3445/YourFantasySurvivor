import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueOwnerAuth } from '~/lib/apiMiddleware';
import { type SecondaryPickSettings, type LeagueSettingsUpdate } from '~/types/leagues';
import updateLeagueSettingsLogic from '~/services/leagues/mutation/updateLeagueSettings';

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueOwnerAuth(async (auth) => {
    console.log('Updating secondary pick settings for league');
    const body = await request.json() as SecondaryPickSettings;

    if (!body) {
      return NextResponse.json({ error: 'Missing league settings in request body' }, { status: 400 });
    }

    const settingsUpdate: Partial<LeagueSettingsUpdate> = {
      secondaryPickEnabled: body.enabled,
      secondaryPickCanPickOwn: body.canPickOwnSurvivor,
      secondaryPickLockoutPeriod: body.lockoutPeriod,
      secondaryPickPublicPicks: body.publicPicks,
      secondaryPickMultiplier: body.multiplier,
    };

    try {
      const success = await updateLeagueSettingsLogic(auth, settingsUpdate);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      let message: string;
      if (e instanceof Error) message = e.message;
      else message = String(e);

      if (message.includes('User not') || message.includes('Not a league member') || message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.error('Failed to update league settings', e);
      return NextResponse.json({ error: 'An error occurred while updating the league settings.' }, { status: 500 });
    }
  })(context);
}
