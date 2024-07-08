import { type NextRequest, NextResponse } from 'next/server';
import { insertLeague } from './insert';
import { type LeagueInsert } from '~/server/db/schema/leagues';

export async function POST(req: NextRequest) {
  const newLeague = await req.json() as LeagueInsert;
  const id = await insertLeague(newLeague);
  return NextResponse.json(id, { status: 201 });
}

