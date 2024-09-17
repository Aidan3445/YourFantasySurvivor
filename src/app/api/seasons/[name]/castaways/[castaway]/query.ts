import 'server-only';
import { getCastaways } from '../query';
import { getCastawayEvents } from '../../events/query';

export async function getCastaway(seasonName: string, castawayName: string) {
  const detailsFetch = getCastaways(seasonName, castawayName);
  const eventsFetch = getCastawayEvents(seasonName, castawayName);

  const [[details], events] = await Promise.all([detailsFetch, eventsFetch]);

  if (!details) throw new Error('Castaway not found');

  return { details, events };
}
