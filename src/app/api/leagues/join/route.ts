import { type NextRequest, NextResponse } from 'next/server';
import { joinLeague } from './query';

export async function POST(req: NextRequest) {
  const { name, password } = await req.json() as { name: string, password: string };
  const { id } = await joinLeague(name, password);

  return NextResponse.json(id, { status: 201 });
}

