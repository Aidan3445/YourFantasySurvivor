import { type NextRequest, NextResponse } from 'next/server';
import { insertLeague } from './insert';
import { type LeagueInsert } from '~/server/db/schema/leagues';

export async function POST(req: NextRequest) {
  const { newLeague, displayName } = await req.json() as { newLeague: LeagueInsert, displayName: string };

  try {
    const id = await insertLeague(newLeague, displayName);
    return NextResponse.json(id, { status: 201 });

  } catch (e) {
    let message = 'Unknown error occurred';
    let status = 500;

    if (typeof e === 'string') {
      message = e;
      status = 400;
    } else if (e instanceof Error) {
      message = e.message;
      if (e.message === 'User not authenticated') status = 401;
      else if (e.message.startsWith('duplicate')) status = 409;
    }

    return NextResponse.json({ message }, { status });
  }
}

