'use server';

import { requireLeagueMemberAuth } from '~/lib/auth';
import createLeagueEventLogic from '~/services/leagues/mutation/createLeagueEvent';
import { type LeagueHash } from '~/types/deprecated/leagues';
import { type LeagueEventInsert } from '~/types/events';

/**
 * Create a new custom/league event for the season
 * @param leagueHash - hash of the league to create the event for
 * @param leagueEvent - event to create
 * @throws if the user is not a system admin
 * @throws if the event cannot be created
 */
export default async function createLeagueEvent(
  leagueHash: LeagueHash,
  leagueEvent: LeagueEventInsert
) {
  try {
    return await requireLeagueMemberAuth(createLeagueEventLogic)(leagueHash, leagueEvent);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not') || message.includes('Not a league member')) throw e;

    console.error('Failed to create league event', e);
    throw new Error('An error occurred while creating the league event. Please try again.');
  }
}