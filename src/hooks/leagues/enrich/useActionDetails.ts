import { useEnrichedTribeMembers } from '~/hooks/seasons/enrich/useEnrichedTribeMembers';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useKeyEpisodes } from '~/hooks/seasons/useKeyEpisodes';
import { useEffect, useMemo, useState } from 'react';
import { usePredictionTiming } from '~/hooks/leagues/usePredictionTiming';
import { useSelectionTimeline } from '~/hooks/leagues/useSelectionTimeline';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { type EnrichedCastaway } from '~/types/castaways';
import { type LeagueMember } from '~/types/leagueMembers';
import { useEliminations } from '~/hooks/seasons/useEliminations';
import { useRouter } from 'next/navigation';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import { type DraftDetails } from '~/types/leagues';
import { usePredictionsMade } from '~/hooks/leagues/enrich/usePredictionsMade';
import { type ScoringBaseEventName } from '~/types/events';

/**
  * Custom hook to get league action details
  * @param {string} overrideHash Optional hash to override the URL parameter.
  */
export function useLeagueActionDetails(overrideHash?: string) {
  const { data: league } = useLeague(overrideHash);
  const { data: rules } = useLeagueRules(overrideHash);
  const { data: settings } = useLeagueSettings(overrideHash);
  const { data: leagueMembers } = useLeagueMembers(overrideHash);
  const { data: selectionTimeline } = useSelectionTimeline(overrideHash);
  const { data: predictionTiming } = usePredictionTiming(overrideHash);
  const { customPredictionsMade, basePredictionsMade } = usePredictionsMade(overrideHash);

  const { data: keyEpisodes } = useKeyEpisodes(league?.seasonId ?? null);

  const nextEpisode = useMemo(() =>
    keyEpisodes?.nextEpisode?.episodeNumber ?? null,
    [keyEpisodes?.nextEpisode?.episodeNumber]
  );

  const tribeMembers = useEnrichedTribeMembers(league?.seasonId ?? null, nextEpisode);
  const { data: eliminations } = useEliminations(league?.seasonId ?? null);

  const eliminationLookup = useMemo(() => {
    if (!eliminations) return new Map<number, number>();

    const lookup = new Map<number, number>();
    eliminations.forEach((episodeElims, index) => {
      episodeElims.forEach(elim => {
        if (elim?.castawayId) {
          lookup.set(elim.castawayId, index + 1);
        }
      });
    });
    return lookup;
  }, [eliminations]);

  const membersWithPicks = useMemo(() => {
    if (!nextEpisode || !tribeMembers || !leagueMembers || !selectionTimeline) {
      return [];
    }

    const picks: { member: LeagueMember; castawayFullName: string }[] = [];

    Object.values(tribeMembers).forEach(({ castaways }) => {
      castaways.forEach(castaway => {
        const selection = selectionTimeline.castawayMembers[castaway.castawayId]?.[nextEpisode];
        if (selection) {
          const member = leagueMembers.members.find(m => m.memberId === selection);
          if (member) {
            picks.push({ member, castawayFullName: castaway.fullName });
          }
        }
      });
    });

    return picks;
  }, [nextEpisode, tribeMembers, leagueMembers, selectionTimeline]);

  const actionDetails = useMemo(() => {
    if (!league || !rules || !selectionTimeline || !nextEpisode ||
      !tribeMembers || !leagueMembers || !eliminationLookup) {
      return undefined;
    }

    const details: DraftDetails = {};

    console.log('selectionTimeline', selectionTimeline);

    Object.entries(tribeMembers).forEach(([tribeId, { tribe, castaways }]) => {
      const selections = castaways.map(castaway => {
        const castawaySelections = selectionTimeline.castawayMembers[castaway.castawayId] ?? [null];
        const latestSelection = Math.min(nextEpisode, castawaySelections.length - 1);
        const selection = selectionTimeline.castawayMembers[castaway.castawayId]?.[latestSelection];
        const eliminatedEpisode = eliminationLookup.get(castaway.castawayId) ?? null;

        const castawayWithTribe: EnrichedCastaway = {
          ...castaway,
          tribe: { name: tribe.tribeName, color: tribe.tribeColor },
          eliminatedEpisode
        };

        const member = selection ? leagueMembers.members.find(m => m.memberId === selection) ?? null : null;

        return {
          castaway: castawayWithTribe,
          member
        };
      });

      details[Number(tribeId)] = {
        tribe,
        castaways: selections,
      };
    });

    return details;
  }, [league, rules, selectionTimeline, nextEpisode, tribeMembers, leagueMembers, eliminationLookup]);

  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState<boolean>();

  const { onTheClock, onDeck, onTheClockIndex } = useMemo(() => {
    if (!leagueMembers?.members || !selectionTimeline?.memberCastaways || !nextEpisode) {
      return { onTheClock: null, onDeck: null, onTheClockIndex: -1 };
    }

    const onTheClockIndex = leagueMembers.members.findIndex(member =>
      selectionTimeline.memberCastaways[member.memberId]?.[nextEpisode] === undefined
    );

    const onTheClock = leagueMembers.members[onTheClockIndex];
    const onDeck = leagueMembers.members[onTheClockIndex + 1];
    const loggedInId = leagueMembers.loggedIn?.memberId;

    return {
      onTheClock: onTheClock ? {
        ...onTheClock,
        loggedIn: onTheClock.memberId === loggedInId,
      } : null,
      onDeck: onDeck ? {
        ...onDeck,
        loggedIn: onDeck.memberId === loggedInId,
      } : null,
      onTheClockIndex: onTheClockIndex >= 0 ? onTheClockIndex : -1
    };
  }, [
    leagueMembers?.members,
    leagueMembers?.loggedIn?.memberId,
    selectionTimeline?.memberCastaways,
    nextEpisode
  ]);

  useEffect(() => {
    if ((!!onTheClock?.loggedIn || !!onDeck?.loggedIn) && dialogOpen === undefined) {
      setDialogOpen(true);
    }
  }, [dialogOpen, onTheClock?.loggedIn, onDeck?.loggedIn]);

  useEffect(() => {
    setDialogOpen(undefined);
  }, [leagueMembers?.loggedIn?.draftOrder]);

  useEffect(() => {
    if (league && (onTheClockIndex === -1 || league.status !== 'Draft')) {
      router.push(`/leagues/${league.hash}`);
    }
  }, [onTheClockIndex, league?.status, league?.hash, router, league]);

  const predictionRuleCount = useMemo(() => {
    if (!rules) return 0;

    const enabledBasePredictions = rules.basePrediction
      ? Object.values(rules.basePrediction).reduce((count, event) => count + Number(event.enabled), 0)
      : 0;

    return enabledBasePredictions + (rules.custom?.length ?? 0);
  }, [rules]);

  const predictionsMade = useMemo(() => {
    if (!nextEpisode) return [];
    return [
      ...(basePredictionsMade?.[nextEpisode] ?? []),
      ...(customPredictionsMade?.[nextEpisode] ?? [])
    ];
  }, [nextEpisode, basePredictionsMade, customPredictionsMade]);

  const rulesBasedOnTiming = useMemo(() => {
    if (!rules || !predictionTiming) return rules;

    const timingSet = new Set(predictionTiming);

    const filteredCustom = rules.custom?.filter(rule =>
      rule.eventType === 'Direct' || rule.timing.some(t => timingSet.has(t))
    ) ?? [];

    if (rules.basePrediction) {
      const filteredBase = { ...rules.basePrediction };

      Object.entries(filteredBase).forEach(([eventName, rule]) => {
        if (rule.enabled && !rule.timing.some(t => timingSet.has(t))) {
          filteredBase[eventName as ScoringBaseEventName] = {
            ...rule,
            enabled: false
          };
        }
      });

      return {
        ...rules,
        custom: filteredCustom,
        basePrediction: filteredBase
      };
    }

    return {
      ...rules,
      custom: filteredCustom,
    };
  }, [rules, predictionTiming]);

  return {
    actionDetails,
    membersWithPicks,
    onTheClock,
    onDeck,
    leagueMembers,
    rules: rulesBasedOnTiming,
    predictionRuleCount,
    settings,
    predictionsMade,
    selectionTimeline,
    keyEpisodes,
    dialogOpen,
    setDialogOpen,
  };
}
