import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueOwnerAuth } from '~/lib/apiMiddleware';
import createCustomEventRuleLogic from '~/services/leagues/mutation/createCustomEventRule';
import updateCustomEventRuleLogic from '~/services/leagues/mutation/updateCustomEventRule';
import deleteCustomEventRuleLogic from '~/services/leagues/mutation/deleteCustomEventRule';
import { type CustomEventRuleInsert } from '~/types/leagues';

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueOwnerAuth(async (auth) => {
    const body = await request.json() as {
      rule: CustomEventRuleInsert;
    };

    if (!body.rule) {
      return NextResponse.json({ error: 'rule is required' }, { status: 400 });
    }

    try {
      const { newRuleId } = await createCustomEventRuleLogic(auth, body.rule);
      return NextResponse.json({ newRuleId }, { status: 201 });
    } catch (e) {
      console.error('Failed to create custom event rule', e);
      return NextResponse.json({ error: 'Failed to create custom event rule' }, { status: 500 });
    }
  })(context);
}

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueOwnerAuth(async (auth) => {
    const body = await request.json() as {
      rule: CustomEventRuleInsert;
      ruleId: number;
    };
    if (!body.rule || !body.ruleId) {
      return NextResponse.json({ error: 'rule and ruleId are required' }, { status: 400 });
    }

    try {
      const success = await updateCustomEventRuleLogic(auth, body.rule, body.ruleId);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to update custom event rule', e);
      return NextResponse.json({ error: 'Failed to update custom event rule' }, { status: 500 });
    }
  })(context);
}

export async function DELETE(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueOwnerAuth(async (auth) => {
    const { searchParams } = new URL(request.url);
    const ruleIdParam = searchParams.get('ruleId');

    if (!ruleIdParam) {
      return NextResponse.json({ error: 'ruleId is required' }, { status: 400 });
    }

    try {
      const success = await deleteCustomEventRuleLogic(auth, parseInt(ruleIdParam, 10));
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to delete custom event rule', e);
      return NextResponse.json({ error: 'Failed to delete custom event rule' }, { status: 500 });
    }
  })(context);
}
