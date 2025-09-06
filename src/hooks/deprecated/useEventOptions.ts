import { type EpisodeNumber } from '~/types/episodes';
import { useLeague } from '~/hooks/deprecated/useLeague';
import { useMemo } from 'react';
import { type TribeId, type TribeName } from '~/types/deprecated/tribes';

export function useEventOptions(selectedEpisode: EpisodeNumber) {
  const { leagueData } = useLeague();

  const castawayOptions = useMemo(() => leagueData.castaways
    .filter(castaway => !castaway.eliminatedEpisode || castaway.eliminatedEpisode >= (selectedEpisode ?? 0))
    .map(castaway => ({ value: castaway.castawayId, label: castaway.fullName })),
    [leagueData.castaways, selectedEpisode]);

  const tribeOptions = useMemo(() => leagueData.castaways
    .filter(castaway => castawayOptions
      .some(castawayOption => castawayOption.value === castaway.castawayId))
    .reduce((acc, castawayDetails) => {
      const currentTribe = castawayDetails.tribes
        .toReversed().find(tribe => tribe.episode <= (selectedEpisode ?? 0));
      let tribeIndex = acc.findIndex(tribe => tribe.value === currentTribe?.tribeId);
      if (currentTribe && tribeIndex === -1) {
        acc.push({ value: currentTribe.tribeId, label: currentTribe.tribeName, castaways: [] });
        tribeIndex = acc.length - 1;
      }

      if (currentTribe) {
        acc[tribeIndex]?.castaways.push(castawayDetails.fullName);
      }
      return acc;
    }, [] as { value: TribeId, label: TribeName, castaways: string[] }[]),
    [leagueData.castaways, castawayOptions, selectedEpisode]);


  return {
    castawayOptions,
    tribeOptions
  };
}
