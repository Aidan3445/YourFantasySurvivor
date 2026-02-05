'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/common/select';
import ColorRow from '~/components/shared/colorRow';
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
    } catch {
      alert('Failed to choose castaway');
    }
  });

  return (
    <Form {...reactForm}>
      <form className='bg-card p-4 rounded-lg text-center border-2 border-primary/20 shadow-lg shadow-primary/10 relative' action={() => handleSubmit()}>
        {/* Accent Elements */}
        <div className='absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl' />
        <h1 className='text-2xl font-black uppercase tracking-wider relative z-10 mb-3'>
          {onDeck ? 'You\'re on deck' : 'You\'re on the clock!'}
        </h1>
        <span className='w-full flex justify-between gap-4 items-center relative z-10'>
          <FormField
            name='castawayId'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger className='py-0 [&>span]:line-clamp-none'>
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
                                  <ColorRow
                                    className='min-w-20 w-fit justify-center leading-tight'
                                    color={tribe.tribeColor}>
                                    {tribe.tribeName}
                                  </ColorRow>
                                  {castaway.fullName} ({member.displayName})
                                </SelectLabel> :
                                <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                                  <span className='flex items-center gap-1'>
                                    <ColorRow
                                      className='min-w-20 w-fit justify-center leading-tight'
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
            className='w-40 font-bold uppercase tracking-wider'
            disabled={!formSchema.safeParse(reactForm.watch())?.success || onDeck}
            type='submit'>
            {onDeck ? 'Almost time!' : 'Submit Pick'}
          </Button>
        </span>
      </form>
    </Form >
  );
}
