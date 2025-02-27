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

  if (availableCastaways.every(castaway => castaway.pickedBy)) {
    return null;
  }

  return (
    <div className='p-4'>
      <Form {...reactForm}>
        <form className='w-full text-center bg-accent rounded-lg flex flex-col' action={() => handleSubmit()}>
          <h1 className='text-2xl font-semibold'>Swap your Survivor Pick</h1>
          <span className='w-full flex justify-between gap-4 items-center p-1 mt-auto mb-1'>
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
                                className='cursor-not-allowed opacity-75'
                                style={{
                                  backgroundColor:
                                    league.members.list
                                      .find(member => member.displayName === castaway.pickedBy)?.color,
                                  color: getContrastingColor(league.members.list
                                    .find(member => member.displayName === castaway.pickedBy)?.color ?? '#000000')
                                }}>
                                {castaway.fullName} ({castaway.pickedBy})
                              </SelectLabel> :
                              <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                                {castaway.fullName}
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
              className='w-40'
              disabled={!formSchema.safeParse(reactForm.watch())?.success || leagueData.episodes.slice(-1)[0]?.airStatus === 'Airing'}
              type='submit'>
              Submit
            </Button>
          </span>
        </form>
      </Form>
    </div>
  );
}
