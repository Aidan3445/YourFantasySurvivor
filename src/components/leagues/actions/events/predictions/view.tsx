'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader } from '~/components/common/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/common/select';
import { Button } from '~/components/common/button';
import PredictionCards from '~/components/leagues/actions/events/predictions/cards';
import ColorRow from '~/components/shared/colorRow';
import makeSecondaryPick from '~/actions/makeSecondaryPick';
import { useLeagueActionDetails } from '~/hooks/leagues/enrich/useLeagueActionDetails';
import { MAX_SEASON_LENGTH } from '~/lib/leagues';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Prediction } from '~/types/events';
import { type LeagueRules } from '~/types/leagues';
import { type Tribe } from '~/types/tribes';

export interface MakePredictionsProps {
  rules?: LeagueRules;
  predictionRuleCount: number;
  predictionsMade: Prediction[];
  castaways: EnrichedCastaway[];
  tribes: Tribe[];
  wallet?: number;
  totalBet?: number;
  setBetTotal?: (_betTotal: number) => void;
  className?: string;
}

export default function MakePredictions(props: MakePredictionsProps) {
  const queryClient = useQueryClient();
  const {
    league,
    rules,
    actionDetails,
    keyEpisodes,
    leagueMembers,
    membersWithPicks,
    selectionTimeline,
  } = useLeagueActionDetails();

  const [secondarySelected, setSecondarySelected] = useState('');
  const [initialSecondaryPick, setInitialSecondaryPick] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const secondaryPickSettings = rules?.secondaryPick;

  const availableCastaways = useMemo(() =>
    Object.values(actionDetails ?? {})
      .flatMap(({ castaways }) =>
        castaways.map(({ castaway, member }) => ({
          ...castaway,
          pickedBy: member,
        }))
      ),
    [actionDetails]
  );

  // Calculate lockout status for each castaway
  const castawayLockoutStatus = useMemo(() => {
    if (
      !secondaryPickSettings?.enabled ||
      !leagueMembers?.loggedIn ||
      !selectionTimeline?.secondaryPicks ||
      !keyEpisodes?.previousEpisode
    ) {
      return new Map<number, { isLockedOut: boolean; episodePicked?: number; episodesRemaining?: number }>();
    }

    const memberId = leagueMembers.loggedIn.memberId;
    const lockoutPeriod = secondaryPickSettings.lockoutPeriod;
    const previousEpisode = keyEpisodes.previousEpisode.episodeNumber;
    const secondaryPicks = selectionTimeline.secondaryPicks[memberId] ?? [];

    const lockoutMap = new Map<number, { isLockedOut: boolean; episodePicked?: number; episodesRemaining?: number }>();

    secondaryPicks.forEach((castawayId, episodeIndex) => {
      if (castawayId !== null && castawayId !== undefined) {
        const episodeNumber = episodeIndex;
        const episodesSinceLastPick = previousEpisode - episodeNumber;

        if (
          (lockoutPeriod === 0 || episodesSinceLastPick < lockoutPeriod) &&
          episodeNumber <= previousEpisode
        ) {
          if (
            !lockoutMap.has(castawayId) ||
            (lockoutMap.get(castawayId)?.episodePicked ?? 0) < episodeNumber
          ) {
            lockoutMap.set(castawayId, {
              isLockedOut: true,
              episodePicked: episodeNumber,
              episodesRemaining:
                lockoutPeriod === MAX_SEASON_LENGTH
                  ? undefined
                  : Math.max(0, lockoutPeriod - episodesSinceLastPick),
            });
          }
        }
      }
    });

    return lockoutMap;
  }, [secondaryPickSettings, leagueMembers, selectionTimeline, keyEpisodes]);

  // Set initial secondary pick if found
  useEffect(() => {
    if (!secondaryPickSettings?.enabled || !leagueMembers?.loggedIn || !membersWithPicks.length) return;

    const memberId = leagueMembers.loggedIn.memberId;
    const currentPick = membersWithPicks.find((mwp) => mwp.member.memberId === memberId && !mwp.out);

    if (currentPick?.secondary) {
      const secondaryId = `${currentPick.secondary.castawayId}`;
      setSecondarySelected(secondaryId);
      setInitialSecondaryPick(secondaryId);
    } else {
      setSecondarySelected('');
      setInitialSecondaryPick('');
    }
  }, [secondaryPickSettings, membersWithPicks, leagueMembers]);

  const handleSecondarySubmit = async () => {
    if (!league || !keyEpisodes?.nextEpisode || !secondarySelected) return;

    setIsSubmitting(true);
    try {
      await makeSecondaryPick(league.hash, parseInt(secondarySelected));
      await queryClient.invalidateQueries({ queryKey: ['selectionTimeline', league.hash] });
      setInitialSecondaryPick(secondarySelected);
      alert('Secondary pick chosen successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to choose secondary pick';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSecondaryPick = secondaryPickSettings?.enabled && keyEpisodes?.nextEpisode;
  const showPredictions = props.rules && props.predictionRuleCount > 0;
  const isEpisodeAiring = keyEpisodes?.previousEpisode?.airStatus === 'Airing';

  if (!showSecondaryPick && !showPredictions) return null;

  return (
    <Card className='p-0 pt-4 border-2 border-primary/20 relative'>
      {/* Accent Elements */}
      <div className='absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl' />

      <CardHeader className='px-4 flex items-center gap-3'>
        <div className='h-6 w-1 bg-primary rounded-full' />
        <h2 className='text-2xl font-black uppercase tracking-wider text-card-foreground relative z-10'>
          While you wait...
        </h2>
      </CardHeader>

      <p className='font-medium text-muted-foreground relative z-10 px-4'>
        {showSecondaryPick && showPredictions
          ? 'Make your secondary pick and predictions to earn extra points!'
          : showSecondaryPick
            ? 'Make your secondary pick to earn extra points!'
            : `Make your prediction${props.predictionRuleCount > 1 ? 's! Earn points throughout the season for each correct prediction you make.' : ' and earn points if you are correct!'}`}
      </p>

      {/* Secondary Pick Section */}
      {showSecondaryPick && (
        <div className='px-4 pb-2'>
          <div className='flex items-center gap-3 h-8'>
            <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
            <h3 className='md:text-lg font-black uppercase tracking-tight leading-none text-nowrap'>
              Secondary Pick
            </h3>
          </div>
          <span className='w-full flex flex-col lg:flex-row justify-center gap-x-4 gap-y-1 items-center'>
            <Select
              key={secondarySelected || 'no-selection'}
              value={secondarySelected}
              onValueChange={setSecondarySelected}>
              <SelectTrigger className='py-0 [&>span]:line-clamp-none w-full'>
                <SelectValue placeholder='Select secondary pick' />
              </SelectTrigger>
              <SelectContent className='z-50'>
                <SelectGroup>
                  {availableCastaways
                    .filter((castaway) => !castaway.eliminatedEpisode)
                    .map((castaway) => {
                      const lockoutInfo = castawayLockoutStatus.get(castaway.castawayId);
                      const isLockedOut = lockoutInfo?.isLockedOut ?? false;
                      const isOwnSurvivor =
                        !secondaryPickSettings?.canPickOwnSurvivor &&
                        castaway.pickedBy?.memberId === leagueMembers?.loggedIn?.memberId;

                      if (isOwnSurvivor || isLockedOut) {
                        let disabledText = castaway.fullName;
                        if (isOwnSurvivor) {
                          disabledText += ' (Your Survivor)';
                        } else if (isLockedOut && lockoutInfo) {
                          const { episodePicked, episodesRemaining } = lockoutInfo;
                          if (episodesRemaining !== undefined && episodesRemaining > 0) {
                            disabledText += ` (Picked Ep ${episodePicked} - ${episodesRemaining} more)`;
                          } else {
                            disabledText += ` (Picked Ep ${episodePicked})`;
                          }
                        }

                        return (
                          <SelectLabel
                            key={castaway.castawayId}
                            className='cursor-not-allowed opacity-50'>
                            <span className='flex items-center gap-1 w-full text-nowrap'>
                              {castaway.tribe && (
                                <ColorRow
                                  className='w-20 justify-center leading-tight font-medium! tracking-normal! normal-case! text-sm'
                                  color={castaway.tribe.color}>
                                  {castaway.tribe.name}
                                </ColorRow>
                              )}
                              {disabledText}
                            </span>
                          </SelectLabel>
                        );
                      }

                      return (
                        <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                          <span className='flex items-center gap-1 w-full text-nowrap'>
                            {castaway.tribe && (
                              <ColorRow
                                className='w-20 justify-center leading-tight'
                                color={castaway.tribe.color}>
                                {castaway.tribe.name}
                              </ColorRow>
                            )}
                            {castaway.fullName}
                          </span>
                        </SelectItem>
                      );
                    })}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              className='lg:w-26 w-full font-bold uppercase text-xs tracking-wider'
              disabled={
                !secondarySelected ||
                secondarySelected === initialSecondaryPick ||
                isEpisodeAiring ||
                isSubmitting
              }
              type='button'
              onClick={handleSecondarySubmit}>
              {isEpisodeAiring ? 'Episode Airing' : isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </span>
        </div>
      )}

      {/* Predictions */}
      {showPredictions && <PredictionCards {...props} />}
    </Card>
  );
}
