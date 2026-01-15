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
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueActionDetails } from '~/hooks/leagues/enrich/useActionDetails';
import chooseCastaway from '~/actions/chooseCastaway';
import { type LeagueMember } from '~/types/leagueMembers';
import { useEliminations } from '~/hooks/seasons/useEliminations';
import { Card } from '~/components/common/card';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import makeSecondaryPick from '~/actions/makeSecondaryPick';
import { Separator } from '~/components/common/separator';

const formSchema = z.object({
  castawayId: z.coerce.number({ required_error: 'Please select a castaway' }),
  secondaryCastawayId: z.coerce.number().optional(),
});

export default function ChangeCastaway() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: rules } = useLeagueRules();
  const { actionDetails, keyEpisodes, leagueMembers, membersWithPicks } = useLeagueActionDetails();
  const { data: eliminations } = useEliminations(league?.seasonId ?? null);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [selected, setSelected] = useState('');
  const [secondarySelected, setSecondarySelected] = useState('');
  const [initialSecondaryPick, setInitialSecondaryPick] = useState<string>('');

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
      await makeSecondaryPick(league.hash, parseInt(secondarySelected), keyEpisodes.nextEpisode.episodeId);
      await queryClient.invalidateQueries({ queryKey: ['selectionTimeline', league.hash] });
      // Update initial pick to the new selection
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
    // check if dialog was closed within the last 10 minutes
    setClosedDialog(localStorage.getItem('closedDialog') ?
      Date.now() - JSON.parse(localStorage.getItem('closedDialog')!) < 1000 * 60 * 10 : false);
  }, [elim, leagueMembers]);


  // Set initial secondary pick if found
  useEffect(() => {
    if (!secondaryPickSettings?.enabled || !leagueMembers?.loggedIn || !membersWithPicks.length) return;

    const memberId = leagueMembers.loggedIn.memberId;
    // Filter for non-out picks to get the current pick
    const currentPick = membersWithPicks
      .find(mwp => mwp.member.memberId === memberId && !mwp.out);

    if (currentPick?.secondary) {
      console.log('Setting initial secondary pick to', currentPick.secondary);
      const secondaryId = `${currentPick.secondary.castawayId}`;
      setSecondarySelected(secondaryId);
      setInitialSecondaryPick(secondaryId);
      reactForm.setValue('secondaryCastawayId', currentPick.secondary.castawayId);
    } else {
      // Clear if no secondary pick
      setSecondarySelected('');
      setInitialSecondaryPick('');
      reactForm.setValue('secondaryCastawayId', undefined);
    }
  }, [secondaryPickSettings, membersWithPicks, leagueMembers, reactForm]);

  // On change of either field, clear the other selection if they are the same
  const handleSelectionChange = (field: 'survivor' | 'secondary', value: string) => {
    if (field === 'survivor') {
      setSelected(value);
      reactForm.setValue('castawayId', parseInt(value));
      if (value === secondarySelected) {
        setSecondarySelected('');
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

  if (league?.status === 'Inactive') return null;

  if (availableCastaways.every(castaway => castaway.pickedBy)) {
    return (
      <div className='w-full text-center bg-card rounded-lg border-2 border-primary/20 shadow-lg shadow-primary/10 flex flex-col p-4 place-items-center'>
        <h1 className='text-xl font-bold uppercase tracking-wider text-muted-foreground'>No Castaways Available</h1>
        <h3 className='text-sm text-muted-foreground'>
          All castaways are either selected or eliminated.
        </h3>
      </div>
    );
  }

  if (keyEpisodes?.previousEpisode && pickPriority.length > 0 && !dialogOpen
    && Date.now() - keyEpisodes.previousEpisode.airDate.getTime() < 1000 * 60 * 60 * 48) {
    return (
      <Card className='w-[calc(100svw-2rem)] md:w-[calc(100svw-3.25rem-var(--sidebar-width))] p-0 pb-0 bg-card rounded-lg border-2 border-primary/20'>
        <h1 className='text-xl font-bold uppercase tracking-wider'>Wait to Swap your Survivor Pick</h1>
        <h3 className='text-sm text-muted-foreground'>Recently Eliminated members have{' '}
          {Math.floor((1000 * 60 * 60 * 48 - (Date.now() - keyEpisodes.previousEpisode.airDate.getTime())) / 1000 / 60 / 60)}
          {' hours left to pick first:'}
        </h3>
        {
          pickPriority.map((member) => (
            <span key={member.memberId} className='flex items-center gap-2'>
              <ColorRow
                className='justify-center leading-tight font-normal'
                color={member.color}>
                {member.displayName}
              </ColorRow>
            </span>
          ))
        }
      </Card>
    );
  }

  // mark modal closed in local storage
  const markModalClosed = () => {
    setClosedDialog(true);
    localStorage.setItem('closedDialog', JSON.stringify(Date.now()));
  };

  return (
    <Form {...reactForm}>
      <Card className='w-full bg-card rounded-lg border-2 border-primary/20  flex flex-col p-3 gap-2'>
        <form action={() => handleSubmit()}>
          {/* Secondary Pick Section */}
          {secondaryPickSettings?.enabled && keyEpisodes?.nextEpisode && (
            <>
              <div className='flex items-center gap-2 w-full justify-start'>
                <span className='h-4 w-0.5 bg-primary rounded-full' />
                <h1 className='text-base font-bold uppercase tracking-wider'>Secondary Pick</h1>
              </div>
              <span className='w-full flex flex-col lg:flex-row justify-center gap-4 items-center mt-auto'>
                <FormField
                  name='secondaryCastawayId'
                  render={() => (
                    <FormItem className='w-full'>
                      <FormControl>
                        <Select
                          key={secondarySelected || 'no-selection'}
                          value={secondarySelected}
                          onValueChange={handleSelectionChange.bind(null, 'secondary')}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select secondary pick' />
                          </SelectTrigger>
                          <SelectContent className='z-50'>
                            <SelectGroup>
                              {availableCastaways
                                .filter((castaway) => !castaway.eliminatedEpisode)
                                .map((castaway) => {
                                  // Disable if it's the user's own survivor and canPickOwnSurvivor is false
                                  const isOwnSurvivor = !secondaryPickSettings.canPickOwnSurvivor &&
                                    castaway.pickedBy?.memberId === leagueMembers?.loggedIn?.memberId;

                                  if (isOwnSurvivor || castaway.eliminatedEpisode) {
                                    return (
                                      <SelectLabel
                                        key={castaway.castawayId}
                                        className='cursor-not-allowed opacity-50'>
                                        <span className='flex items-center gap-1'>
                                          {castaway.tribe &&
                                            <ColorRow
                                              className='w-20 px-0 justify-center leading-tight font-medium! tracking-normal! normal-case! text-sm'
                                              color={castaway.tribe.color}>
                                              {castaway.tribe.name}
                                            </ColorRow>
                                          }
                                          {castaway.fullName} {isOwnSurvivor && '(Your Survivor)'}
                                        </span>
                                      </SelectLabel>
                                    );
                                  }

                                  return (
                                    <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                                      <span className='flex items-center gap-1'>
                                        {castaway.tribe &&
                                          <ColorRow
                                            className='w-20 px-0 justify-center leading-tight'
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
            </>
          )}

          <Separator className='my-4 w-11/12 mx-auto' />
          {/* Main Survivor Section */}
          <div className='flex items-center gap-2 w-full justify-start'>
            <span className='h-4 w-0.5 bg-primary rounded-full' />
            <h1 className='text-base font-bold uppercase tracking-wider'>
              Swap your Survivor Pick
            </h1>
          </div>
          <span className='w-full flex flex-col lg:flex-row justify-center gap-4 items-center mt-auto'>
            <FormField
              name='castawayId'
              render={() => (
                <FormItem className='w-full'>
                  <FormControl>
                    <Select
                      defaultValue={selected}
                      value={selected}
                      onValueChange={handleSelectionChange.bind(null, 'survivor')}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select new survivor' />
                      </SelectTrigger>
                      <SelectContent className='z-50'>
                        <SelectGroup>
                          {availableCastaways.map((castaway) => {
                            return ((castaway.pickedBy ?? castaway.eliminatedEpisode)
                              ? (
                                <SelectLabel
                                  key={castaway.castawayId}
                                  className='cursor-not-allowed'
                                  style={{ backgroundColor: castaway.pickedBy?.color ?? '#6b7280' }}>
                                  <span
                                    className='flex items-center gap-1'
                                    style={{ color: getContrastingColor(castaway.pickedBy?.color ?? '#6b7280') }}>
                                    {castaway.tribe &&
                                      <ColorRow
                                        className='w-20 px-0 justify-center leading-tight font-medium! tracking-normal! normal-case! text-sm'
                                        color={castaway.tribe.color}>
                                        {castaway.tribe.name}
                                      </ColorRow>
                                    }
                                    {castaway.fullName} {castaway.pickedBy && `(${castaway.pickedBy.displayName})`}
                                  </span>
                                </SelectLabel>
                              ) : (
                                <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                                  <span className='flex items-center gap-1'>
                                    {castaway.tribe &&
                                      <ColorRow
                                        className='w-20 px-0 justify-center leading-tight'
                                        color={castaway.tribe.color}>
                                        {castaway.tribe.name}
                                        {castaway.pickedBy}
                                      </ColorRow>}
                                    {castaway.fullName}
                                  </span>
                                </SelectItem>
                              ));
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
                !formSchema.safeParse(reactForm.watch())?.success
                || reactForm.formState.isSubmitting
                || keyEpisodes?.previousEpisode?.airStatus === 'Airing'}
              type='submit'>
              {keyEpisodes?.previousEpisode?.airStatus === 'Airing' ? 'Episode Airing' : 'Submit'}
            </Button>
          </span>
        </form>
      </Card>
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
