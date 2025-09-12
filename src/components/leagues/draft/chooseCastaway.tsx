'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/common/select';
import ColorRow from '~/components/shared/colorRow';
import { getContrastingColor } from '@uiw/color-convert';
import { type DraftDetails } from '~/types/leagues';
import { useLeague } from '~/hooks/leagues/useLeague';
import chooseCastaway from '~/actions/chooseCastaway';
import { useQueryClient } from '@tanstack/react-query';

interface ChooseCastawayProps {
  draftDetails?: DraftDetails;
  onDeck: boolean;
}

const formSchema = z.object({
  castawayId: z.coerce.number({ required_error: 'Please select a castaway' }),
});

export default function ChooseCastaway({ draftDetails, onDeck }: ChooseCastawayProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;

    try {
      await chooseCastaway(league.hash, data.castawayId);
      await queryClient.invalidateQueries({ queryKey: ['selectionTimeline', league.hash] });
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
                        {Object.values(draftDetails ?? {})
                          .map(({ tribe, castaways }) => castaways
                            .map(({ castaway, member }) => {
                              return (member ?
                                <SelectLabel
                                  key={castaway.castawayId}
                                  className='cursor-not-allowed'
                                  style={{ backgroundColor: member.color }}>
                                  <span
                                    className='flex items-center gap-1'
                                    style={{ color: getContrastingColor(member.color) }}>
                                    <ColorRow
                                      className='min-w-12 px-1 justify-center leading-tight font-normal'
                                      color={tribe.tribeColor}>
                                      {tribe.tribeName}
                                    </ColorRow>
                                    {castaway.fullName} ({member.displayName})
                                  </span>
                                </SelectLabel> :
                                <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                                  <span className='flex items-center gap-1'>
                                    <ColorRow
                                      className='min-w-12 px-1 justify-center leading-tight'
                                      color={tribe.tribeColor}>
                                      {tribe.tribeName}
                                    </ColorRow>
                                    {castaway.fullName}
                                  </span>
                                </SelectItem>
                              );
                            }))}
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
