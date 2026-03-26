'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/common/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '~/components/common/alertDialog';
import { getContrastingColor } from '@uiw/color-convert';
import { useEffect, useMemo, useState } from 'react';
import ColorRow from '~/components/shared/colorRow';
import { useQueryClient } from '@tanstack/react-query';
import { useLeagueActionDetails } from '~/hooks/leagues/enrich/useLeagueActionDetails';
import chooseCastaway from '~/actions/chooseCastaway';
import { type LeagueMember } from '~/types/leagueMembers';
import { useEliminations } from '~/hooks/seasons/useEliminations';
import { Card, CardContent } from '~/components/common/card';
import makeSecondaryPick from '~/actions/makeSecondaryPick';
import { MAX_SEASON_LENGTH } from '~/lib/leagues';
import ShotInTheDark from '~/components/leagues/hub/picks/shotInTheDark/view';

const formSchema = z.object({
  castawayId: z.coerce.number({ required_error: 'Please select a castaway' }),
  secondaryCastawayId: z.coerce.number().optional(),
});

export default function ChangeCastaway() {
  const queryClient = useQueryClient();
  const {
    league,
    rules,
    actionDetails,
    keyEpisodes,
    leagueMembers,
    membersWithPicks,
    selectionTimeline
  } = useLeagueActionDetails();
  const { data: eliminations } = useEliminations(league?.seasonId ?? null);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [selected, setSelected] = useState('');
  const [secondarySelected, setSecondarySelected] = useState<string | undefined>(undefined);
  const [initialSecondaryPick, setInitialSecondaryPick] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (leagueMembers?.loggedIn) {
      const memberId = leagueMembers.loggedIn.memberId;
      const currentPick = membersWithPicks.find(mwp => mwp.member.memberId === memberId && !mwp.out);
      if (currentPick) {
        setSelected(`${currentPick.castawayId}`);
        reactForm.setValue('castawayId', currentPick.castawayId);
      }
    }
  }, [leagueMembers, membersWithPicks, reactForm]);

  const secondaryPickSettings = rules?.secondaryPick;

  const availableCastaways = useMemo(() => Object.values(actionDetails ?? {})
    .map(({ castaways }) => castaways
      .map(({ castaway, member }) => ({
        ...castaway,
        pickedBy: member
      })))
    .flat(),
    [actionDetails]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;

    try {
      await chooseCastaway(league.hash, data.castawayId);
      await queryClient.invalidateQueries({ queryKey: ['selectionTimeline', league.hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', league.hash] });
      reactForm.reset();
      setSelected('');
      alert('Castaway chosen successfully');
    } catch {
      alert('Failed to choose castaway');
    }
  });

  const handleSecondarySubmit = async () => {
    if (!league || !keyEpisodes?.nextEpisode || !secondarySelected) return;

    try {
      await makeSecondaryPick(league.hash, parseInt(secondarySelected));
      await queryClient.invalidateQueries({ queryKey: ['selectionTimeline', league.hash] });
      setInitialSecondaryPick(secondarySelected);
      alert('Secondary pick chosen successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to choose secondary pick';
      alert(errorMessage);
    }
  };

  const { pickPriority, elim } = useMemo(() => {
    return membersWithPicks.reduce(({ pickPriority, elim }, memberWPick) => {
      const pickId = memberWPick.castawayId;
      const eliminatedEpisode = eliminations?.findIndex(elims =>
        elims.some(elim => elim.castawayId === pickId)) ?? -1;

      if (eliminatedEpisode === -1) return { pickPriority, elim };

      if (keyEpisodes?.previousEpisode?.episodeNumber === eliminatedEpisode) {
        pickPriority.push(memberWPick.member);
      }
      elim.push(memberWPick.member);
      return { pickPriority, elim };
    }, { pickPriority: [], elim: [] } as { pickPriority: LeagueMember[], elim: LeagueMember[] });
  }, [eliminations, keyEpisodes, membersWithPicks]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [closedDialog, setClosedDialog] = useState(false);

  useEffect(() => {
    if (leagueMembers?.loggedIn && elim.some(member => member.memberId === leagueMembers.loggedIn?.memberId)) {
      setDialogOpen(true);
    }
    setClosedDialog(localStorage.getItem('closedDialog') ?
      Date.now() - JSON.parse(localStorage.getItem('closedDialog')!) < 1000 * 60 * 10 : false);
  }, [elim, leagueMembers]);

  const castawayLockoutStatus = useMemo(() => {
    if (!secondaryPickSettings?.enabled || !leagueMembers?.loggedIn || !selectionTimeline?.secondaryPicks || !keyEpisodes?.previousEpisode) {
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

        if ((lockoutPeriod === 0 || episodesSinceLastPick < lockoutPeriod) && episodeNumber <= previousEpisode) {
          if (!lockoutMap.has(castawayId) || (lockoutMap.get(castawayId)?.episodePicked ?? 0) < episodeNumber) {
            lockoutMap.set(castawayId, {
              isLockedOut: true,
              episodePicked: episodeNumber,
              episodesRemaining: lockoutPeriod === MAX_SEASON_LENGTH
                ? undefined
                : Math.max(0, lockoutPeriod - episodesSinceLastPick)
            });
          }
        }
      }
    });

    return lockoutMap;
  }, [secondaryPickSettings, leagueMembers, selectionTimeline, keyEpisodes]);

  // Secondary init — search all picks regardless of out status
  useEffect(() => {
    if (!secondaryPickSettings?.enabled || !leagueMembers?.loggedIn || !membersWithPicks.length) return;

    const memberId = leagueMembers.loggedIn.memberId;
    const memberPick = membersWithPicks.find(mwp => mwp.member.memberId === memberId);

    if (memberPick?.secondary) {
      const secondaryId = `${memberPick.secondary.castawayId}`;
      setSecondarySelected(secondaryId);
      setInitialSecondaryPick(secondaryId);
      reactForm.setValue('secondaryCastawayId', memberPick.secondary.castawayId);
    } else if (memberPick) {
      // Only reset if we found the member but they have no secondary pick.
      // Avoids clearing state during transient data gaps (e.g. refetch on tab switch).
      setSecondarySelected(undefined);
      setInitialSecondaryPick(undefined);
      reactForm.setValue('secondaryCastawayId', undefined);
    }
  }, [secondaryPickSettings, membersWithPicks, leagueMembers, reactForm]);

  const handleSelectionChange = (field: 'survivor' | 'secondary', value: string) => {
    if (field === 'survivor') {
      setSelected(value);
      reactForm.setValue('castawayId', parseInt(value));
      if (value === secondarySelected) {
        setSecondarySelected(undefined);
        reactForm.setValue('secondaryCastawayId', undefined);
      }
    } else {
      setSecondarySelected(value);
      reactForm.setValue('secondaryCastawayId', parseInt(value));
      if (value === selected) {
        setSelected('');
        reactForm.resetField('castawayId');
      }
    }
  };

  const currentSurvivorPick = useMemo(() => {
    if (!leagueMembers?.loggedIn) return null;
    const memberId = leagueMembers.loggedIn.memberId;
    return membersWithPicks.find(mwp => mwp.member.memberId === memberId && !mwp.out) ?? null;
  }, [membersWithPicks, leagueMembers]);

  const currentSecondaryPick = useMemo(() => {
    if (!leagueMembers?.loggedIn) return null;
    const memberId = leagueMembers.loggedIn.memberId;
    return membersWithPicks.find(mwp => mwp.member.memberId === memberId)?.secondary ?? null;
  }, [membersWithPicks, leagueMembers]);

  // Fall back to data-derived picks when useEffect hasn't synced state yet
  const selectedCastaway = availableCastaways.find(c => `${c.castawayId}` === selected)
    ?? availableCastaways.find(c => c.castawayId === currentSurvivorPick?.castawayId)
    ?? null;
  const selectedSecondaryCastaway = availableCastaways.find(c => `${c.castawayId}` === secondarySelected)
    ?? availableCastaways.find(c => c.castawayId === currentSecondaryPick?.castawayId)
    ?? null;

  const markModalClosed = () => {
    setClosedDialog(true);
    localStorage.setItem('closedDialog', JSON.stringify(Date.now()));
  };

  if (league?.status === 'Inactive') return null;

  const allCastawaysTaken = availableCastaways.every(castaway => castaway.pickedBy);
  const loggedInMemberId = leagueMembers?.loggedIn?.memberId;

  const priorityTimeLeft = keyEpisodes?.previousEpisode
    ? Math.floor(((1000 * 60 * 60 * 48 - (Date.now() - keyEpisodes.previousEpisode.airDate.getTime())) / 1000 / 60 / 60) + (keyEpisodes.previousEpisode.runtime / 60))
    : -1;

  const showPickPriorityNotice = !dialogOpen
    && keyEpisodes?.previousEpisode
    && pickPriority.length > 0
    && !pickPriority.some(m => m.memberId === loggedInMemberId)
    && priorityTimeLeft > 0;

  return (
    <Form {...reactForm}>
      <div className='flex flex-col gap-4 w-full'>
        <Card className='w-full bg-card rounded-lg border-2 border-primary/20 p-4'>
          <form action={() => handleSubmit()}>
            <CardContent className='p-0 flex flex-col gap-4'>

              {/* Primary pick section */}
              {allCastawaysTaken ? (
                <div className='w-full text-center flex flex-col place-items-center'>
                  <h1 className='text-xl font-bold uppercase tracking-wider text-muted-foreground'>No Castaways Available</h1>
                  <h3 className='text-sm text-muted-foreground'>
                    All castaways are either selected or eliminated.
                  </h3>
                </div>
              ) : showPickPriorityNotice ? (
                <div>
                  <h1 className='text-xl font-bold uppercase tracking-wider'>Wait to Swap your Survivor Pick</h1>
                  <h3 className='text-sm text-muted-foreground'>
                    {'Recently Eliminated members have '}
                    {priorityTimeLeft > 0 && (
                      priorityTimeLeft > 1
                        ? `${priorityTimeLeft} hours`
                        : 'less than 1 hour'
                    )}
                    {' left to pick first:'}
                  </h3>
                  {pickPriority.map((member) => (
                    <span key={member.memberId} className='flex justify-center items-center gap-2'>
                      <ColorRow
                        className='justify-center leading-tight font-normal w-1/3 min-w-fit'
                        color={member.color}>
                        {member.displayName}
                      </ColorRow>
                    </span>
                  ))}
                </div>
              ) : (
                <div>
                  <div className='flex items-center gap-3 h-8'>
                    <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
                    <h2 className='md:text-xl font-black uppercase tracking-tight leading-none text-nowrap'>
                      Swap your Survivor Pick
                    </h2>
                  </div>
                  <span className='w-full flex flex-col lg:flex-row justify-center gap-x-4 gap-y-1 items-center mt-auto'>
                    <FormField
                      name='castawayId'
                      render={() => (
                        <FormItem className='w-full'>
                          <FormControl>
                            <Select
                              value={selected}
                              onValueChange={handleSelectionChange.bind(null, 'survivor')}>
                              <SelectTrigger className='py-0 [&>span]:line-clamp-none'>
                                {selectedCastaway ? (
                                  <span className='flex items-center justify-start gap-1 text-nowrap'>
                                    {selectedCastaway.tribe &&
                                      <ColorRow
                                        className='w-20 justify-center leading-tight mr-1'
                                        color={selectedCastaway.tribe.color}>
                                        {selectedCastaway.tribe.name}
                                      </ColorRow>
                                    }
                                    {selectedCastaway.fullName}
                                  </span>
                                ) : (
                                  <SelectValue placeholder='Select new survivor' />
                                )}
                              </SelectTrigger>
                              <SelectContent className='z-50'>
                                <SelectGroup>
                                  {availableCastaways.map((castaway) =>
                                    currentSurvivorPick?.castawayId !== castaway.castawayId &&
                                      (castaway.pickedBy ??
                                        (castaway.eliminatedEpisode && !castaway.redemption?.some((r) =>
                                          r.secondEliminationEpisode === null)))
                                      ? (
                                        <SelectLabel
                                          key={castaway.castawayId}
                                          className='cursor-not-allowed'
                                          style={{ backgroundColor: castaway.pickedBy?.color ?? '#6b7280' }}>
                                          <span
                                            className='flex items-center gap-1 w-full text-nowrap'
                                            style={{ color: getContrastingColor(castaway.pickedBy?.color ?? '#6b7280') }}>
                                            {castaway.tribe &&
                                              <ColorRow
                                                className='w-20 justify-center leading-tight font-medium! tracking-normal! normal-case! text-sm'
                                                color={castaway.tribe.color}>
                                                {castaway.tribe.name}
                                              </ColorRow>
                                            }
                                            {castaway.fullName} {castaway.pickedBy && `(${castaway.pickedBy.displayName})`}
                                          </span>
                                        </SelectLabel>
                                      ) : (
                                        <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                                          <span className='flex items-center gap-1 w-full text-nowrap'>
                                            {castaway.tribe &&
                                              <ColorRow
                                                className='w-20 justify-center leading-tight'
                                                color={castaway.tribe.color}>
                                                {castaway.tribe.name}
                                              </ColorRow>
                                            }
                                            {castaway.fullName}
                                          </span>
                                        </SelectItem>
                                      ))
                                  }
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )} />
                    <Button
                      className='lg:w-26 w-full font-bold uppercase text-xs tracking-wider'
                      disabled={
                        !formSchema.safeParse(reactForm.watch())?.success
                        || reactForm.formState.isSubmitting
                        || keyEpisodes?.previousEpisode?.airStatus === 'Airing'}
                      type='submit'>
                      {keyEpisodes?.previousEpisode?.airStatus === 'Airing' ? 'Episode Airing' : 'Submit'}
                    </Button>
                  </span>
                </div>
              )}

              {/* Secondary Pick Section */}
              {secondaryPickSettings?.enabled && keyEpisodes?.nextEpisode && (
                <div>
                  <div className='flex items-center gap-3 h-8'>
                    <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
                    <h2 className='md:text-xl font-black uppercase tracking-tight leading-none text-nowrap'>
                      Secondary Pick
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                      (Choose weekly)
                    </p>
                  </div>
                  <span className='w-full flex flex-col lg:flex-row justify-center gap-x-4 gap-y-1 items-center mt-auto'>
                    <FormField
                      name='secondaryCastawayId'
                      render={() => (
                        <FormItem className='w-full'>
                          <FormControl>
                            <Select
                              value={secondarySelected ?? ''}
                              onValueChange={handleSelectionChange.bind(null, 'secondary')}>
                              <SelectTrigger className='py-0 [&>span]:line-clamp-none'>
                                {selectedSecondaryCastaway ? (
                                  <span className='flex items-center justify-start gap-1 text-nowrap'>
                                    {selectedSecondaryCastaway.tribe &&
                                      <ColorRow
                                        className='w-20 justify-center leading-tight mr-1'
                                        color={selectedSecondaryCastaway.tribe.color}>
                                        {selectedSecondaryCastaway.tribe.name}
                                      </ColorRow>
                                    }
                                    {selectedSecondaryCastaway.fullName}
                                  </span>
                                ) : (
                                  <SelectValue placeholder='Select secondary pick' />
                                )}
                              </SelectTrigger>
                              <SelectContent className='z-50'>
                                <SelectGroup>
                                  {availableCastaways
                                    .filter((castaway) => !castaway.eliminatedEpisode
                                      || castaway.redemption?.some((r) =>
                                        r.secondEliminationEpisode === null))
                                    .map((castaway) => {
                                      const lockoutInfo = castawayLockoutStatus.get(castaway.castawayId);
                                      const isLockedOut = lockoutInfo?.isLockedOut ?? false;

                                      const isOwnSurvivor = !secondaryPickSettings.canPickOwnSurvivor &&
                                        castaway.pickedBy?.memberId === leagueMembers?.loggedIn?.memberId;

                                      if (isOwnSurvivor
                                        || (castaway.eliminatedEpisode
                                          && !castaway.redemption?.some((r) => r.secondEliminationEpisode === null))
                                        || isLockedOut) {
                                        let disabledText = castaway.fullName;
                                        if (isOwnSurvivor) {
                                          disabledText += ' (Your Survivor)';
                                        } else if (isLockedOut && lockoutInfo) {
                                          const episodePicked = lockoutInfo.episodePicked;
                                          const episodesRemaining = lockoutInfo.episodesRemaining;

                                          if (episodesRemaining !== undefined && episodesRemaining > 0) {
                                            disabledText += ` (unavailable for ${episodesRemaining} more ${episodesRemaining === 1 ? 'episode' : 'episodes'})`;
                                          } else {
                                            disabledText += ` (Picked Ep ${episodePicked})`;
                                          }
                                        }

                                        return (
                                          <SelectLabel
                                            key={castaway.castawayId}
                                            className='cursor-not-allowed opacity-50'>
                                            <span className='flex items-center gap-1 w-full text-nowrap'>
                                              {castaway.tribe &&
                                                <ColorRow
                                                  className='w-20 justify-center leading-tight font-medium! tracking-normal! normal-case! text-sm'
                                                  color={castaway.tribe.color}>
                                                  {castaway.tribe.name}
                                                </ColorRow>
                                              }
                                              {disabledText}
                                            </span>
                                          </SelectLabel>
                                        );
                                      }

                                      return (
                                        <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                                          <span className='flex items-center gap-1 w-full text-nowrap'>
                                            {castaway.tribe &&
                                              <ColorRow
                                                className='w-20 justify-center leading-tight'
                                                color={castaway.tribe.color}>
                                                {castaway.tribe.name}
                                              </ColorRow>}
                                            {castaway.fullName}
                                          </span>
                                        </SelectItem>
                                      );
                                    })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )} />
                    <Button
                      className='lg:w-26 w-full font-bold uppercase text-xs tracking-wider'
                      disabled={
                        !secondarySelected
                        || secondarySelected === initialSecondaryPick
                        || keyEpisodes?.previousEpisode?.airStatus === 'Airing'}
                      type='button'
                      onClick={handleSecondarySubmit}>
                      {keyEpisodes?.previousEpisode?.airStatus === 'Airing' ? 'Episode Airing' : 'Submit'}
                    </Button>
                  </span>
                </div>
              )}

              <ShotInTheDark />
            </CardContent>
          </form>
        </Card>
      </div>

      <AlertDialog open={dialogOpen && !closedDialog} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-center'>
              Oh no!
            </AlertDialogTitle>
            <AlertDialogDescription className='text-left'>
              Your survivor was eliminated, but you get another chance.
              <br />
              Choose from the reaming castaways to continue earning points.
              <br />
              {'You\'re still in it, good luck!'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className='w-full' onClick={markModalClosed}>
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
