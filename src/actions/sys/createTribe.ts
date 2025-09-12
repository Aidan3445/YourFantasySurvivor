'use server';

import { requireSystemAdminAuth } from '~/lib/auth';
import { createTribeLogic } from '~/services/seasons/mutation/createTribe';
import { type TribeInsert } from '~/types/tribes';

/**
  * Create a new tribe
  * @param seasonName The season to create the tribe in
  * @param newTribe The tribe to create
  */
export default async function createTribe(
  seasonName: string,
  newTribe: TribeInsert
) {
  try {
    return await requireSystemAdminAuth(createTribeLogic)(seasonName, newTribe);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated')) throw e;

    console.error('Failed to create tribe', e);
    throw new Error('An error occurred while creating the tribe.');
  }
}

