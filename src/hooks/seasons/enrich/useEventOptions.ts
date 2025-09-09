import { useMemo } from 'react';
import { useEnrichedTribeMembers } from '~/hooks/seasons/enrich/useEnrichedTribeMembers';

/**
  * Custom hook to get event options for tribes and castaways.
  * @param {number} seasonId The season ID to get options for.
  * @param {number} selectedEpisode The episode number to get options for.
  */
export function useEventOptions(seasonId: number | null, selectedEpisode: number | null) {
  const tribeMembers = useEnrichedTribeMembers(seasonId, selectedEpisode);
  const tribeOptions = useMemo(() =>
    Object.values(tribeMembers ?? {}).map(({ tribe }) => ({
      value: tribe.tribeId,
      label: tribe.tribeName,
      color: tribe.tribeColor,
    })),
    [tribeMembers]
  );
  const castawayOptions = useMemo(() =>
    Object.values(tribeMembers ?? {}).flatMap(({ castaways: members }) =>
      members.map(member => ({
        value: member.castawayId,
        label: member.fullName,
      }))),
    [tribeMembers]
  );

  return { tribeOptions, castawayOptions };
}

