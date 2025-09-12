import { useEnrichedTribeMembers } from '~/hooks/seasons/enrich/useEnrichedTribeMembers';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useKeyEpisodes } from '~/hooks/seasons/useKeyEpisodes';
import { useEffect, useMemo, useState } from 'react';
import { usePredictionTiming } from '~/hooks/leagues/usePredictionTiming';
import { useSelectionTimeline } from '~/hooks/leagues/useSelectionTimeline';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { type Tribe } from '~/types/tribes';
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
  const nextEpisode = useMemo(() => keyEpisodes?.nextEpisode?.episodeNumber ?? null, [keyEpisodes]);
  const tribeMembers = useEnrichedTribeMembers(league?.seasonId ?? null, nextEpisode);
  const { data: eliminations } = useEliminations(league?.seasonId ?? null);

  const { actionDetails, membersWithPicks } = useMemo(() => {
    if (!league || !rules || !selectionTimeline ||
      !nextEpisode || !tribeMembers || !leagueMembers || !eliminations) return {};

    const membersWithPicks: { member: LeagueMember; castawayFullName: string }[] = [];

    const actionDetails: DraftDetails = Object.entries(tribeMembers).reduce((acc, [tribeId, { tribe, castaways }]) => {
      const selections = castaways.map(castaway => {
        const selection = selectionTimeline.castawayMembers[castaway.castawayId]?.[nextEpisode];

        const eliminatedEpisodeIndex = eliminations.findIndex(episodeElims =>
          episodeElims.some(elim => elim?.castawayId === castaway.castawayId)
        );

        const castawayWithTribe: EnrichedCastaway = {
          ...castaway,
          tribe: { name: tribe.tribeName, color: tribe.tribeColor },
          eliminatedEpisode: eliminatedEpisodeIndex >= 0 ? eliminatedEpisodeIndex + 1 : null
        };

        const member = selection ? leagueMembers.members.find(m => m.memberId === selection) ?? null : null;
        if (member) {
          membersWithPicks.push({ member, castawayFullName: castaway.fullName });
        }

        return {
          castaway: castawayWithTribe,
          member
        };
      });

      acc[Number(tribeId)] = {
        tribe,
        castaways: selections,
      };
      return acc;
    }, {} as Record<number, {
      tribe: Tribe,
      castaways: {
        castaway: EnrichedCastaway,
        member: LeagueMember | null
      }[]
    }>);

    return {
      actionDetails,
      membersWithPicks
    };
  }, [league, rules, selectionTimeline, nextEpisode, tribeMembers, leagueMembers, eliminations]);


  const router = useRouter();
  // undefined = not yet displayed, true = open, false = dismissed
  const [dialogOpen, setDialogOpen] = useState<boolean>();

  const { onTheClock, onDeck, onTheClockIndex } = useMemo(() => {
    const onTheClockIndex = leagueMembers?.members?.findIndex(member =>
      selectionTimeline?.memberCastaways?.[member.memberId]?.[nextEpisode ?? -1] === undefined
    ) ?? 0;

    const onTheClock = leagueMembers?.members?.[onTheClockIndex];
    const onDeck = leagueMembers?.members?.[onTheClockIndex + 1];

    return {
      onTheClock: {
        ...onTheClock,
        loggedIn: onTheClock?.memberId === leagueMembers?.loggedIn?.memberId,
      },
      onDeck: {
        ...onDeck,
        loggedIn: onDeck?.memberId === leagueMembers?.loggedIn?.memberId,
      },
      onTheClockIndex
    };
  }, [leagueMembers, selectionTimeline, nextEpisode]);

  useEffect(() => {
    if (onTheClock?.loggedIn && dialogOpen === undefined) {
      setDialogOpen(true);
    }
  }, [dialogOpen, onTheClock, setDialogOpen]);

  useEffect(() => {
    const func = async () => {
      if (!league) return;

      if (onTheClockIndex === -1 || league.status !== 'Draft') {
        router.push(`/leagues/${league.hash}`);
      }
    };
    void func();
  }, [onTheClockIndex, league, router]);

  const predictionRuleCount = useMemo(() => {
    if (!rules) return 0;
    const enabledBasePredictions = Object.values(rules.basePrediction ?? {})
      .reduce((count, event) => count + Number(event.enabled), 0);
    return enabledBasePredictions + rules.custom.length;
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

    const filteredCustom = rules.custom
      .filter(rule => rule.eventType === 'Direct' ||
        rule.timing.some(t => predictionTiming.includes(t)));

    if (rules.basePrediction) {
      const filteredBase = { ...rules.basePrediction };
      Object.entries(filteredBase).forEach(([eventName, rule]) => {
        if (rule.enabled && !rule.timing.some(t => predictionTiming.includes(t))) {
          filteredBase[eventName as ScoringBaseEventName].enabled = false;
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
