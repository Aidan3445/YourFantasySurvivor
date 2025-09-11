import { useMemo } from 'react';
import { useEnrichedTribeMembers } from '~/hooks/seasons/enrich/useEnrichedTribeMembers';
import { type ReferenceType } from '~/types/events';

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
  const combinedReferenceOptions = useMemo(() => [
    { label: 'Tribes', value: null },
    ...tribeOptions.map(tribe => ({
      label: tribe.label,
      value: `Tribe_${tribe.value}`,
      color: tribe.color,
    })),
    { label: 'Castaways', value: null },
    ...castawayOptions.map(castaway => ({
      label: castaway.label,
      value: `Castaway_${castaway.value}`,
    })),
  ], [tribeOptions, castawayOptions]);

  const handleCombinedReferenceSelection = (values: (string | number)[]) => {
    // strings are in the format TYPE_ID
    const selectedReferences = values.map(value => {
      const parts = String(value).split('_');
      return {
        type: parts[0]! as ReferenceType,
        id: Number(parts[1]),
      };
    });
    return selectedReferences;
  };

  const getDefaultStringValues = (references: { type: ReferenceType; id: number }[]) => {
    return references.map(ref => `${ref.type}_${ref.id}`);
  };

  return {
    tribeOptions,
    castawayOptions,
    combinedReferenceOptions,
    handleCombinedReferenceSelection,
    getDefaultStringValues
  };
}
