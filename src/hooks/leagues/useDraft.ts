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
import { useBasePredictions } from '~/hooks/leagues/useBasePredictions';
import { useCustomEvents } from '~/hooks/leagues/useCustomEvents';

/**
  * Custom hook to get league draft details.
  * @param {string} overrideHash Optional hash to override the URL parameter.
  * @returnObj `LeagueRule[]`
  */
export function useLeagueDraft(overrideHash?: string) {
  const { data: league } = useLeague(overrideHash);
  const { data: rules } = useLeagueRules(overrideHash);
  const { data: settings } = useLeagueSettings(overrideHash);
  const { data: leagueMembers } = useLeagueMembers(overrideHash);
  const { data: selectionTimeline } = useSelectionTimeline(overrideHash);
  const { data: predictionTiming } = usePredictionTiming(overrideHash);
  const { data: basePredictions } = useBasePredictions(overrideHash);
  const { data: customEvents } = useCustomEvents(overrideHash);

  const { data: keyEpisodes } = useKeyEpisodes(league?.seasonId ?? null);
  const nextEpisode = useMemo(() => keyEpisodes?.nextEpisode?.episodeNumber ?? null, [keyEpisodes]);
  const tribeMembers = useEnrichedTribeMembers(league?.seasonId ?? null, nextEpisode);
  const { data: eliminations } = useEliminations(league?.seasonId ?? null);

  const { draftDetails, membersWithPicks } = useMemo(() => {
    if (!league || !rules || !predictionTiming || !selectionTimeline ||
      !nextEpisode || !tribeMembers || !leagueMembers || !eliminations) return {};

    const membersWithPicks: { member: LeagueMember; castawayFullName: string }[] = [];

    const draftDetails: DraftDetails = Object.entries(tribeMembers).reduce((acc, [tribeId, { tribe, castaways }]) => {
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
      draftDetails,
      membersWithPicks
    };
  }, [league, rules, predictionTiming, selectionTimeline, nextEpisode, tribeMembers, leagueMembers, eliminations]);


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

  return {
    draftDetails,
    membersWithPicks,
    onTheClock,
    onDeck,
    leagueMembers,
    rules,
    predictionRuleCount,
    settings,
    basePredictions: Object.values(basePredictions?.[nextEpisode ?? -1] ?? {}).flat(),
    customPredictions: Object.values(customEvents?.predictions?.[nextEpisode ?? -1] ?? {}).flat(),
    dialogOpen,
    setDialogOpen,
  };
}
