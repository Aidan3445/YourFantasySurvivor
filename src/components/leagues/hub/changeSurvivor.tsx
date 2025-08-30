'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { useLeague } from '~/hooks/useLeague';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/common/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '~/components/common/alertDialog';
import { chooseCastaway } from '~/services/leagues/settings/leagueSettingActions';
import { getContrastingColor } from '@uiw/color-convert';
import { useEffect, useMemo, useState } from 'react';
import ColorRow from '~/components/common/colorRow';
import { type LeagueMemberDisplayName } from '~/types/leagueMembers';

const formSchema = z.object({
  castawayId: z.coerce.number({ required_error: 'Please select a castaway' }),
});

export default function ChangeSurvivor() {
  const { league, leagueData, refresh } = useLeague();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [selected, setSelected] = useState('');

  const availableCastaways = leagueData.castaways
    .filter(castaway => !castaway.eliminatedEpisode && castaway.startingTribe.tribeId > 0)
    .map(castaway => ({
      ...castaway,
      pickedBy: leagueData.selectionTimeline.castawayMembers[castaway.fullName]?.slice(-1)[0]
    }));

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await chooseCastaway(league.leagueHash, data.castawayId, false);
      await refresh();
      reactForm.reset();
      setSelected('');

      alert('Castaway chosen successfully');
    } catch (error) {
      alert('Failed to choose castaway');
    }
  });

  const lastEpisode = useMemo(() => leagueData.episodes.findLast(episode => episode.airStatus === 'Aired'), [leagueData]);

  const { pickPriority, elim } = useMemo(() => {
    return Object.entries(leagueData.selectionTimeline.memberCastaways)
      .reduce((acc, [member, castaways]) => {
        const eliminatedEpisode = leagueData.castaways.find(castaway => castaway.fullName === castaways.slice(-1)[0])?.eliminatedEpisode;
        if (eliminatedEpisode) {
          acc.elim.push(member);
          if (eliminatedEpisode === lastEpisode?.episodeNumber) acc.pickPriority.push(member);
        }
        return acc;
      }, { pickPriority: [], elim: [] } as { pickPriority: LeagueMemberDisplayName[], elim: LeagueMemberDisplayName[] });
  }, [leagueData, lastEpisode]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [closedDialog, setClosedDialog] = useState(false);

  useEffect(() => {
    if (elim.includes(league.members.loggedIn?.displayName ?? '')) {
      setDialogOpen(true);
    }
    // check if dialog was closed within the last 10 minutes
    setClosedDialog(localStorage.getItem('closedDialog') ?
      Date.now() - JSON.parse(localStorage.getItem('closedDialog')!) < 1000 * 60 * 10 : false);
  }, [elim, league.members.loggedIn]);

  /*
   * This will be put into effect next season in combination with a new waiver system
  if (leagueData.episodes.some(episode => episode.airStatus === 'Airing') ||
    availableCastaways.every((castaway) => castaway.pickedBy)) {
    return null;
  }
  */

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

  if (lastEpisode && pickPriority.length > 0 && !dialogOpen) {
    return (
      <div className='w-full text-center bg-card rounded-lg flex flex-col p-1 place-items-center'>
        <h1 className='text-2xl font-semibold'>Wait to Swap your Survivor Pick</h1>
        <h3 className='text-lg font-semibold'>Eliminated members have{' '}
          {Math.floor((1000 * 60 * 60 * 48 - (Date.now() - lastEpisode.episodeAirDate.getTime())) / 1000 / 60 / 60)}
          {' hours left to pick first:'}
        </h3>
        {
          pickPriority.map((member) => (
            <span key={member} className='flex items-center gap-2'>
              <ColorRow
                className='justify-center leading-tight font-normal'
                color={league.members.list.find(m => m.displayName === member)?.color}>
                {member}
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
                          return (castaway.pickedBy ?
                            <SelectLabel
                              key={castaway.fullName}
                              className='cursor-not-allowed'
                              style={{
                                backgroundColor:
                                  league.members.list
                                    .find(member => member.displayName === castaway.pickedBy)?.color,
                              }}>
                              <span
                                className='flex items-center gap-1'
                                style={{
                                  color: getContrastingColor(league.members.list.find(member =>
                                    member.displayName === castaway.pickedBy)?.color ?? '#000000')
                                }}>
                                {<ColorRow
                                  className='w-20 px-0 justify-center leading-tight font-normal'
                                  color={castaway.tribes.slice(-1)[0]?.tribeColor}>
                                  {castaway.tribes.slice(-1)[0]?.tribeName}
                                </ColorRow>}
                                {castaway.fullName} ({castaway.pickedBy})
                              </span>
                            </SelectLabel> :
                            <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                              <span className='flex items-center gap-1'>
                                {<ColorRow
                                  className='w-20 px-0 justify-center leading-tight'
                                  color={castaway.tribes.slice(-1)[0]?.tribeColor}>
                                  {castaway.tribes.slice(-1)[0]?.tribeName}
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
            className='lg:w-24 w-full'
            disabled={!formSchema.safeParse(reactForm.watch())?.success || leagueData.episodes.slice(-1)[0]?.airStatus === 'Airing'}
            type='submit'>
            Submit
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
