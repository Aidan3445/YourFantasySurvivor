import { type NextRequest, NextResponse } from 'next/server';
import { joinLeague } from './insert';

export async function POST(req: NextRequest) {
  const { name, password, displayName } = await req.json() as { name: string, password: string, displayName: string };

  try {
    const id = await joinLeague(name, password, displayName);
    return NextResponse.json(id, { status: 201 });
  } catch (e) {
    let message = 'Unknown error joining league';
    let status = 500;

    if (typeof e === 'string') {
      message = e;
      status = 400;
    } else if (e instanceof Error) {
      message = e.message;
      if (e.message === 'User not authenticated') status = 401;
      else if (e.message === 'Invalid league name or password') status = 403;
      else if (e.message.startsWith('duplicate')) status = 409;
    }

    return NextResponse.json({ message }, { status });
  }
}

