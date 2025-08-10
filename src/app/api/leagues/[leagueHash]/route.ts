import { type NextRequest, NextResponse } from 'next/server';
import { QUERIES } from '~/app/api/leagues/query';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';

export async function GET(_: NextRequest, { params }: LeaguePageProps) {
  const { leagueHash } = await params;
  try {
    const leaguePromise = QUERIES.getLeague(leagueHash);
    const leagueDataPromise = QUERIES.getLeagueLiveData(leagueHash);
    const episodesPromise = QUERIES.getEpisodes(leagueHash, 100)
      .then(episodes => episodes.some(episode => episode.airStatus === 'Airing'));

    const [league, leagueData, episodeAiring] = await Promise.all([
      leaguePromise, leagueDataPromise, episodesPromise
    ]);

    return NextResponse.json({ league, leagueData, episodeAiring }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

