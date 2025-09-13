import { useMemo } from 'react';
import { useCastaways } from '~/hooks/seasons/useCastaways';
import { useTribes } from '~/hooks/seasons/useTribes';
import { type EnrichedEvent, type EventWithReferences } from '~/types/events';
import { useTribesTimeline } from '~/hooks/seasons/useTribesTimeline';
import { useSelectionTimeline } from '~/hooks/leagues/useSelectionTimeline';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { defaultBaseRules } from '~/lib/leagues';
import { type Tribe } from '~/types/tribes';
import { type EnrichedCastaway } from '~/types/castaways';
import { useEliminations } from '~/hooks/seasons/useEliminations';
import { findTribeCastaways } from '~/lib/utils';

/**
  * Custom hook to get enriched data for a list of events.
  * Combines events with their respective rules and references.
  * @param {number} seasonId The season ID to get events for.
  * @param {EventWithReferences[]} events The list of events to enrich.
  */
export function useEnrichEvents(
  seasonId: number | null,
  events: EventWithReferences[] | null
) {
  const { data: selectionTimeline } = useSelectionTimeline();
  const { data: rules } = useLeagueRules();
  const { data: tribesTimeline } = useTribesTimeline(seasonId);
  const { data: tribes } = useTribes(seasonId);
  const { data: castaways } = useCastaways(seasonId);
  const { data: leagueMembers } = useLeagueMembers();
  const { data: eliminations } = useEliminations(seasonId);

  const lookupMaps = useMemo(() => {
    if (!tribes || !castaways || !leagueMembers || !eliminations) {
      return null;
    }

    const tribesById = new Map(tribes.map(tribe => [tribe.tribeId, tribe]));
    const castawaysById = new Map(castaways.map(castaway => [castaway.castawayId, castaway]));
    const membersById = new Map(leagueMembers.members.map(member => [member.memberId, member]));
    const eliminationEpisodes = new Map<number, number>();
    eliminations.forEach((episodeElims, index) => {
      episodeElims.forEach(elim => {
        if (elim?.castawayId) {
          eliminationEpisodes.set(elim.castawayId, index + 1);
        }
      });
    });

    return {
      tribesById,
      castawaysById,
      membersById,
      eliminationEpisodes
    };
  }, [tribes, castaways, leagueMembers, eliminations]);

  const pointsLookup = useMemo(() => {
    if (!rules) return new Map<string, number | null>();

    const lookup = new Map<string, number | null>();

    const baseRules = rules.base ?? defaultBaseRules;
    Object.entries(baseRules).forEach(([eventName, points]) => {
      lookup.set(`base-${eventName}`, points);
    });

    rules.custom?.forEach(customRule => {
      lookup.set(`custom-${customRule.eventName}`, customRule.points);
    });

    return lookup;
  }, [rules]);

  const createTribeFinder = useMemo(() => {
    if (!tribesTimeline || !lookupMaps) return null;

    return (castawayId: number, episodeNumber: number) => {
      const relevantTimeline = Object.entries(tribesTimeline)
        .filter(([epNumStr]) => parseInt(epNumStr) <= episodeNumber)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

      for (const [, tribesInEpisode] of relevantTimeline) {
        for (const [tribeIdStr, tribeMembers] of Object.entries(tribesInEpisode)) {
          if (tribeMembers.includes(castawayId)) {
            const tribe = lookupMaps.tribesById.get(parseInt(tribeIdStr));
            return tribe ? {
              name: tribe.tribeName,
              color: tribe.tribeColor
            } : null;
          }
        }
      }
      return null;
    };
  }, [tribesTimeline, lookupMaps]);

  return useMemo(() => {
    if (!events || !tribesTimeline || !selectionTimeline || !lookupMaps || !createTribeFinder) {
      return [];
    }

    const createCastawayMemberPairs = (castawayIds: number[], tribe: Tribe | null, episodeNumber: number) => {
      return castawayIds
        .map(castawayId => {
          const castaway = lookupMaps.castawaysById.get(castawayId);
          if (!castaway) {
            return null;
          }

          const castawaySelections = selectionTimeline.castawayMembers[castawayId];
          const selectionLength = castawaySelections?.length ?? 0;
          const memberId = castawaySelections?.[Math.min(selectionLength - 1, episodeNumber)] ?? null;

          const member = memberId ? lookupMaps.membersById.get(memberId) ?? null : null;

          const eliminatedEpisode = lookupMaps.eliminationEpisodes.get(castawayId) ?? null;

          const castawayWithTribe: EnrichedCastaway = {
            ...castaway,
            tribe: tribe ? { name: tribe.tribeName, color: tribe.tribeColor } : createTribeFinder(castawayId, episodeNumber),
            eliminatedEpisode
          };

          return { castaway: castawayWithTribe, member };
        })
        .filter((pair): pair is NonNullable<typeof pair> => pair !== null);
    };

    return events
      .map((event) => {
        const pointsKey = event.eventSource === 'Base'
          ? `base-${event.eventName}`
          : `custom-${event.eventName}`;
        const points = pointsLookup.get(pointsKey) ?? null;

        const { eventTribes, eventCastaways } = event.references.reduce(
          (acc, ref) => {
            if (ref.type === 'Tribe') acc.eventTribes.push(ref.id);
            if (ref.type === 'Castaway') acc.eventCastaways.push(ref.id);
            return acc;
          },
          { eventTribes: [] as number[], eventCastaways: [] as number[] }
        );

        const referenceMap = eventTribes.map(tribeId => {
          const tribe = lookupMaps.tribesById.get(tribeId);
          if (!tribe) return null;

          const tribeMembers = findTribeCastaways(tribesTimeline, eliminations ?? [], tribeId, event.episodeNumber);
          const pairs = createCastawayMemberPairs(tribeMembers, tribe, event.episodeNumber);

          return { tribe, pairs } as EnrichedEvent['referenceMap'][number];
        }).filter((ref): ref is NonNullable<typeof ref> => ref !== null);

        const referencedCastawayIds = new Set(
          referenceMap.flatMap(tm => tm.pairs.map(p => p.castaway.castawayId))
        );

        const looseCastaways = eventCastaways.filter(castawayId =>
          !referencedCastawayIds.has(castawayId)
        );

        if (looseCastaways.length > 0) {
          const pairs = createCastawayMemberPairs(looseCastaways, null, event.episodeNumber);
          if (pairs.length > 0) {
            referenceMap.push({ tribe: null, pairs });
          }
        }

        return {
          ...event,
          points,
          referenceMap,
        } as EnrichedEvent;
      })
      .filter((event): event is EnrichedEvent => event !== null);
  }, [events, tribesTimeline, selectionTimeline, lookupMaps, createTribeFinder, pointsLookup, eliminations]);
}
