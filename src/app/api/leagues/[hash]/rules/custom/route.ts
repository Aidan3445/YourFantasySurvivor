import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { requireLeagueMemberAuth } from '~/lib/auth';
import createCustomEventRuleLogic from '~/services/leagues/mutation/createCustomEventRule';
import updateCustomEventRuleLogic from '~/services/leagues/mutation/updateCustomEventRule';
import deleteCustomEventRuleLogic from '~/services/leagues/mutation/deleteCustomEventRule';
import { type CustomEventRuleInsert } from '~/types/leagues';

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  try {
    const { hash } = await context.params;
    const body = await request.json() as {
      rule: CustomEventRuleInsert;
    };

    await requireLeagueMemberAuth(createCustomEventRuleLogic)(
      hash,
      body.rule
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    let message: string;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    if (message.includes('User not') || message.includes('Not a league member')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to create custom event rule', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  try {
    const { hash } = await context.params;
    const body = await request.json() as {
      rule: CustomEventRuleInsert;
      ruleId: number;
    };

    await requireLeagueMemberAuth(updateCustomEventRuleLogic)(
      hash,
      body.rule,
      body.ruleId
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    let message: string;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    if (message.includes('User not') || message.includes('Not a league member')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update custom event rule', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: LeagueRouteParams) {
  try {
    const { hash } = await context.params;
    const { searchParams } = new URL(request.url);
    const ruleIdParam = searchParams.get('ruleId');

    if (!ruleIdParam) {
      return NextResponse.json({ error: 'ruleId is required' }, { status: 400 });
    }

    await requireLeagueMemberAuth(deleteCustomEventRuleLogic)(
      hash,
      parseInt(ruleIdParam, 10)
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    let message: string;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    if (message.includes('User not') || message.includes('Not a league member')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to delete custom event rule', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
