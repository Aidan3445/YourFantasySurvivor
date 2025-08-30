'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { useLeague } from '~/hooks/useLeague';
import { type CastawayDraftInfo } from '~/types/castaways';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/common/select';
import { chooseCastaway } from '~/services/leagues/settings/leagueSettingActions';
import { ColorRow } from '~/components/leagues/predraft/order/view';
import { getContrastingColor } from '@uiw/color-convert';

interface ChooseCastawayProps {
  castaways: CastawayDraftInfo[];
  onDeck: boolean;
}

const formSchema = z.object({
  castawayId: z.coerce.number({ required_error: 'Please select a castaway' }),
});

export default function ChooseCastaway({ castaways, onDeck }: ChooseCastawayProps) {
  const {
    league: {
      leagueHash,
      members
    },
    refresh
  } = useLeague();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const availableCastaways = castaways.filter(castaway => !castaway.eliminatedEpisode);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await chooseCastaway(leagueHash, data.castawayId, true);
      await refresh();
      alert('Castaway chosen successfully');
    } catch (error) {
      alert('Failed to choose castaway');
    }
  });

  return (
    <Form {...reactForm}>
      <form className='bg-card p-1 rounded-lg text-center' action={() => handleSubmit()}>
        <h1 className='text-2xl font-semibold'>
          {onDeck ? 'You\'re on deck' : 'You\'re on the clock!'}
        </h1>
        <span className='w-full flex justify-between gap-4 items-center p-1'>
          <FormField
            name='castawayId'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Select onValueChange={field.onChange}>
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
                                  members.list
                                    .find(member => member.displayName === castaway.pickedBy)?.color,

                              }}>
                              <span
                                className='flex items-center gap-1'
                                style={{
                                  color: getContrastingColor(members.list
                                    .find(member => member.displayName === castaway.pickedBy)?.color ?? '#000000')
                                }}>
                                <ColorRow
                                  className='w-10 px-0 justify-center leading-tight font-normal'
                                  color={castaway.tribe.tribeColor}>
                                  {castaway.tribe.tribeName}
                                </ColorRow>
                                {castaway.fullName} ({castaway.pickedBy})
                              </span>
                            </SelectLabel> :
                            <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                              <span className='flex items-center gap-1'>
                                <ColorRow
                                  className='w-10 px-0 justify-center leading-tight'
                                  color={castaway.tribe.tribeColor}>
                                  {castaway.tribe.tribeName}
                                </ColorRow>
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
            className='w-40'
            disabled={!formSchema.safeParse(reactForm.watch())?.success || onDeck}
            type='submit'>
            {onDeck ? 'Almost time!' : 'Submit Pick'}
          </Button>
        </span>
      </form>
    </Form >
  );
}
