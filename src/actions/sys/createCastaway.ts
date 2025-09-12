'use server';

import { requireSystemAdminAuth } from '~/lib/auth';
import { createCastawayLogic } from '~/services/seasons/mutation/createCastaway';
import { type CastawayInsert } from '~/types/castaways';

/**
  * Create a new castaway
  * @param seasonName The season to create the castaway in
  * @param newCastaway The castaway to create
  */
export default async function createCastaway(
  seasonName: string,
  newCastaway: CastawayInsert
) {
  try {
    return await requireSystemAdminAuth(createCastawayLogic)(seasonName, newCastaway);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated')) throw e;

    console.error('Failed to create castaway', e);
    throw new Error('An error occurred while creating the castaway.');
  }
}

