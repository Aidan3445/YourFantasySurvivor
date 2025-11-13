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
import { getAirStatus } from '~/lib/episodes';

const formSchema = z.object({
  castawayId: z.coerce.number({ required_error: 'Please select a castaway' }),
});

export default function ChangeCastaway() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { actionDetails, keyEpisodes, leagueMembers, membersWithPicks } = useLeagueActionDetails();
  const { data: eliminations } = useEliminations(league?.seasonId ?? null);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [selected, setSelected] = useState('');

  const availableCastaways = useMemo(() => Object.values(actionDetails ?? {})
    .map(({ castaways }) => castaways
      .map(({ castaway, member }) => ({
        ...castaway,
        pickedBy: member ?? null
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
    } catch (error) {
      alert('Failed to choose castaway');
    }
  });

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

  /*
   * This will be put into effect next season in combination with a new waiver system
  if (leagueData.episodes.some(episode => episode.airStatus === 'Airing') ||
    availableCastaways.every((castaway) => castaway.pickedBy)) {
    return null;
  }
  */

  if (league?.status === 'Inactive') return null;

  if (availableCastaways.every(castaway => castaway.pickedBy)) {
    return (
      <div className='w-full text-center bg-card rounded-lg flex flex-col p-1 place-items-center'>
        <h1 className='text-xl text-muted-foreground font-semibold'>No Castaways Available</h1>
        <h3 className='text-md text-muted-foreground font-semibold'>
          All castaways are either selected or eliminated.
        </h3>
      </div>
    );
  }

  if (keyEpisodes?.previousEpisode && pickPriority.length > 0 && !dialogOpen
    && Date.now() - keyEpisodes.previousEpisode.airDate.getTime() < 1000 * 60 * 60 * 48) {
    return (
      <div className='w-full text-center bg-card rounded-lg flex flex-col p-1 place-items-center'>
        <h1 className='text-2xl font-semibold'>Wait to Swap your Survivor Pick</h1>
        <h3 className='text-lg font-semibold'>Recently Eliminated members have{' '}
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
      </div >
    );
  }

  // mark modal closed in local storage
  const markModalClosed = () => {
    setClosedDialog(true);
    localStorage.setItem('closedDialog', JSON.stringify(Date.now()));
  };

  return (
    <Form {...reactForm}>
      <form className='w-full text-center bg-card rounded-lg flex flex-col' action={() => handleSubmit()}>
        <h1 className='text-2xl font-semibold'>Swap your Survivor Pick</h1>
        <span className='w-full flex flex-col lg:flex-row justify-center gap-4 items-center p-2 mt-auto'>
          <FormField
            name='castawayId'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Select
                    defaultValue={selected}
                    value={selected}
                    onValueChange={(value) => { setSelected(value); field.onChange(value); }}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select castaway' />
                    </SelectTrigger>
                    <SelectContent className='z-50'>
                      <SelectGroup>
                        {availableCastaways.map((castaway) => {
                          return ((castaway.pickedBy ?? castaway.eliminatedEpisode) ?
                            <SelectLabel
                              key={castaway.castawayId}
                              className='cursor-not-allowed'
                              style={{ backgroundColor: castaway.pickedBy?.color ?? '#6b7280' }}>
                              <span
                                className='flex items-center gap-1'
                                style={{ color: getContrastingColor(castaway.pickedBy?.color ?? '#6b7280') }}>
                                {castaway.tribe &&
                                  <ColorRow
                                    className='w-20 px-0 justify-center leading-tight font-normal'
                                    color={castaway.tribe.color}>
                                    {castaway.tribe.name}
                                  </ColorRow>
                                }
                                {castaway.fullName} {castaway.pickedBy && `(${castaway.pickedBy.displayName})`}
                              </span>
                            </SelectLabel> :
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
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )} />
          <Button
            className='lg:w-26 w-full'
            disabled={
              !formSchema.safeParse(reactForm.watch())?.success
              || reactForm.formState.isSubmitting
              || (!!keyEpisodes?.previousEpisode
                && getAirStatus(
                  keyEpisodes.previousEpisode.airDate,
                  keyEpisodes.previousEpisode.runtime) === 'Airing')}
            type='submit'>
            {keyEpisodes?.previousEpisode && getAirStatus(keyEpisodes.previousEpisode.airDate, keyEpisodes.previousEpisode.runtime) === 'Airing' ? 'Episode Airing' : 'Submit'}
          </Button>
        </span>
      </form>
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
