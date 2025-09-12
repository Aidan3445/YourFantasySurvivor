'use server';

import { requireSystemAdminAuth } from '~/lib/auth';
import { createEpisodeLogic } from '~/services/seasons/mutation/createEpisode';
import { type EpisodeInsert } from '~/types/episodes';

/**
  * Create a new episode
  * @param seasonName The season to create the episode in
  * @param newEpisode The episode to create
  */
export default async function createEpisode(
  seasonName: string,
  newEpisode: EpisodeInsert
) {
  try {
    return await requireSystemAdminAuth(createEpisodeLogic)(seasonName, newEpisode);
  } catch (e) {
    let message: string;
    if (e instanceof Error) message = e.message;
    else message = String(e);

    if (message.includes('User not authenticated')) throw e;

    console.error('Failed to create episode', e);
    throw new Error('An error occurred while creating the episode.');
  }
}

