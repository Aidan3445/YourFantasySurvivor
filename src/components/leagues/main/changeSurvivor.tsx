'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { Button } from '~/components/ui/button';
import { useLeague } from '~/hooks/useLeague';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select';
import { chooseCastaway } from '~/app/api/leagues/actions';
import { getContrastingColor } from '@uiw/color-convert';
import { useState } from 'react';
import { ColorRow } from '../draftOrder';

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
    .filter(castaway => !castaway.eliminatedEpisode)
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

  if (availableCastaways.every((castaway) => castaway.pickedBy)) {
    return null;
  }


  const pickPriority = Object.entries(leagueData.selectionTimeline.memberCastaways)
    .filter(([_, castaways]) => !!leagueData.castaways
      .find(castaway => castaway.fullName === castaways.slice(-1)[0])?.eliminatedEpisode)
    .map(([member, _]) => member);

  if (pickPriority.length > 0 && !pickPriority.includes(league.members.loggedIn?.displayName ?? '')) {
    return (
      <div className='w-full text-center bg-card rounded-lg flex flex-col p-1 place-items-center'>
        <h1 className='text-2xl font-semibold'>Wait to Swap your Survivor Pick</h1>
        <h3 className='text-lg font-semibold'>Eliminated members must pick first:</h3>
        {pickPriority.map((member) => (
          <span key={member} className='flex items-center gap-2'>
            <ColorRow
              className='justify-center leading-tight font-normal'
              color={league.members.list.find(m => m.displayName === member)?.color}>
              {member}
            </ColorRow>
          </span>
        ))}
      </div>
    );
  }

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
                                  color: getContrastingColor(league.members.list
                                    .find(member => member.displayName === castaway.pickedBy)?.color ?? '#000000')
                                }}>
                                {<ColorRow
                                  className='w-10 px-0 justify-center leading-tight font-normal'
                                  color={castaway.tribes.slice(-1)[0]?.tribeColor}>
                                  {castaway.tribes.slice(-1)[0]?.tribeName}
                                </ColorRow>}
                                {castaway.fullName} ({castaway.pickedBy})
                              </span>
                            </SelectLabel> :
                            <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                              <span className='flex items-center gap-1'>
                                {<ColorRow
                                  className='w-10 px-0 justify-center leading-tight'
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
    </Form>
  );
}
