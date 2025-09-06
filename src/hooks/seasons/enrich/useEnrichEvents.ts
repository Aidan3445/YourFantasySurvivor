import { useMemo } from 'react';
import { useCastaways } from '~/hooks/seasons/useCastaways';
import { useTribes } from '~/hooks/seasons/useTribes';
import { type ScoringBaseEventName, type EnrichedEvent, type EventWithReferences } from '~/types/events';
import { useTribesTimeline } from '~/hooks/seasons/useTribesTimeline';
import { useSelectionTimeline } from '~/hooks/leagues/useSelectionTimeline';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { defaultBaseRules } from '~/lib/leagues';
import { type Tribe } from '~/types/tribes';
import { type CastawayWithTribe } from '~/types/castaways';

/**
  * Custom hook to get enriched data for a list of events.
  * Combines events with their respective rules and references.
  * @param {number} leagueId The league ID to get events for.
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

  return useMemo(() => {
    if (
      !events || !tribesTimeline || !selectionTimeline ||
      !tribes || !castaways || !leagueMembers || !rules) {
      return [];
    }

    return events.map((event) => {
      let points: number | null = null;
      if (event.eventSource === 'Base') {
        const baseRules = rules.base ?? defaultBaseRules;
        points = baseRules[event.eventName as ScoringBaseEventName] ?? null;
      } else {
        points = rules.custom?.find(r => r.eventName === event.eventName)?.points ?? null;
      }

      const findTribe = (castawayId: number) => {
        let tribe: { name: string; color: string } | null = null;
        const sortedTimeline = Object.entries(tribesTimeline)
          .filter(([epNumStr]) => parseInt(epNumStr) <= event.episodeNumber)
          .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

        // find the most recent tribe update for the castaway
        for (const [, tribesInEpisode] of sortedTimeline) {
          for (const [tribeIdStr, tribeMembers] of Object.entries(tribesInEpisode)) {
            if (tribeMembers.includes(castawayId)) {
              const foundTribe = tribes.find(t => t.tribeId === parseInt(tribeIdStr));
              if (foundTribe) {
                tribe = {
                  name: foundTribe.tribeName,
                  color: foundTribe.tribeColor
                };
                break;
              }
            }
          }
          if (tribe) break; // stop if tribe is found
        }
        return tribe;
      };

      const createCastawayMemberPairs = (castawayIds: number[], tribe: Tribe | null) => {
        return castawayIds.map(castawayId => {
          const memberId = selectionTimeline
            .castawayMembers[castawayId]?.[event.episodeNumber] ?? null;

          const castaway = castaways.find(c => c.castawayId === castawayId);
          if (!castaway) {
            console.warn(`Castaway with ID ${castawayId} not found for event ID ${event.eventId}`);
            return null;
          }

          const castawayWithTribe: CastawayWithTribe = {
            ...castaway,
            tribe: tribe
              ? { name: tribe.tribeName, color: tribe.tribeColor }
              : null
          };

          if (tribe === null) {
            castawayWithTribe.tribe = findTribe(castawayId);
          }

          const member = memberId
            ? leagueMembers.find(m => m.memberId === memberId) ?? null
            : null;
          return { castaway: castawayWithTribe, member };
        });
      };

      const { eventTribes, eventCastaways } = event.references.reduce((acc, ref) => {
        if (ref.type === 'Tribe') acc.eventTribes.push(ref.id);
        if (ref.type === 'Castaway') acc.eventCastaways.push(ref.id);
        return acc;
      }, { eventTribes: [] as number[], eventCastaways: [] as number[] });


      if (eventTribes.length === 0) {
        const pairs = createCastawayMemberPairs(eventCastaways, null).filter(Boolean);
        const referenceMap = { tribe: null, pairs };

        return {
          ...event,
          points: null,
          referenceMap: [referenceMap],
        } as EnrichedEvent;
      }

      const referenceMap = eventTribes.map(tribeId => {
        const tribe = tribes.find(t => t.tribeId === tribeId)!;

        const castawaySet = new Set<number>();
        eventCastaways.forEach(castawayId => castawaySet.add(castawayId));

        // Add all tribe members from the episode to the set
        const tribeMembers = tribesTimeline[event.episodeNumber]?.[tribeId] ?? [];
        tribeMembers.forEach(castawayId => castawaySet.add(castawayId));

        const pairs = createCastawayMemberPairs(Array.from(castawaySet), tribe).filter(Boolean);

        return { tribe, pairs };
      });

      return {
        ...event,
        points: points,
        referenceMap,
      } as EnrichedEvent;
    });
  }, [castaways, events, leagueMembers, rules, selectionTimeline, tribes, tribesTimeline]);
}
