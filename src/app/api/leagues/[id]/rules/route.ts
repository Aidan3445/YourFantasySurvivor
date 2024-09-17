import 'server-only';
import { NextResponse } from 'next/server';
import { getRules } from './query';

export async function GET({ params }: { params: { leagueId: number } }) {
  const rules = await getRules(params.leagueId);

  return NextResponse.json(rules);
}
