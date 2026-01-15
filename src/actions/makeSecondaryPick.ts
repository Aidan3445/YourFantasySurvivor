'use server';

import { leagueMemberAuth } from '~/lib/auth';
import makeSecondaryPickService from '~/services/leagues/mutation/makeSecondaryPick';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

export default async function makeSecondaryPick(
  leagueHash: string,
  castawayId: number,
  episodeId: number
) {
  const auth = await leagueMemberAuth(leagueHash);

  if (!auth.memberId) {
    throw new Error('Unauthorized');
  }

  return await makeSecondaryPickService(auth as VerifiedLeagueMemberAuth, castawayId, episodeId);
}
