import { type NextRequest, NextResponse } from 'next/server';
import { QUERIES } from '~/app/api/leagues/query';

const fetchPredictions = async (leagueHash: string) => {
  try {
    const fetchedPredictions = await QUERIES.getThisWeeksPredictions(leagueHash);
    if (!fetchedPredictions) throw new Error('Predictions not found');
    return fetchedPredictions;
  } catch (error) {
    console.error('Error fetching predictions:', error);
  }
};

const fetchHistory = async (leagueHash: string) => {
  try {
    const fetchedHistory = await QUERIES.getMyPredictions(leagueHash);
    if (!fetchedHistory) throw new Error('History not found');
    return fetchedHistory;
  } catch (error) {
    console.error('Error fetching history:', error);
  }
};

const fetchBetRules = async (leagueHash: string) => {
  try {
    const fetchedBetRules = await QUERIES.getShauhinModeSettings(leagueHash);
    if (!fetchedBetRules) throw new Error('Bet rules not found');
    return fetchedBetRules;
  } catch (error) {
    console.error('Error fetching bet rules:', error);
  }
};

const fetchAllData = async (leagueHash: string) => {
  return await Promise.all([
    fetchPredictions(leagueHash),
    fetchHistory(leagueHash),
    fetchBetRules(leagueHash)
  ]);
};

export async function GET(request: NextRequest, { params }: { params: { leagueHash: string } }) {
  const { leagueHash } = params;
  try {
    const [predictions, history, betRules] = await fetchAllData(leagueHash);
    return NextResponse.json({ predictions, history, betRules }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/leagues/predictions:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
