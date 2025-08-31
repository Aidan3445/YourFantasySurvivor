'use client';

import { z } from 'zod';
import { cn } from '~/lib/utils';
import { Button } from '~/components/common/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/components/common/form';
import { HelpCircle } from 'lucide-react';
import { type ReferenceType, type ScoringBaseEventName, type LeaguePredictionDraft } from '~/types/events';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/common/select';
import { makePrediction } from '~/services/leagues/settings/leagueActions';
import { useLeague } from '~/hooks/useLeague';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { useMemo } from 'react';
import { Input } from '~/components/common/input';
import ColorRow from '~/components/shared/colorRow';

const formSchema = z.object({
  referenceId: z.coerce.number(),
  bet: z.coerce.number().nullable().optional(),
});

interface SubmissionCardProps {
  prediction: LeaguePredictionDraft;
  options: Record<ReferenceType, Record<string, { id: number, color: string, tribeName?: string }>>;
}

export default function SubmissionCard({ prediction, options }: SubmissionCardProps) {
  const { league, refresh } = useLeague();

  const schema = useMemo(() => {
    return formSchema.extend({
      bet: z.coerce.number()
        .min(0, 'Bet must be a positive number')
        .max(league.shauhinModeSettings?.maxBet ?? 1000, 'Bet exceeds maximum allowed')
        .default(0)
        .optional(),
    });
  }, [league.shauhinModeSettings?.maxBet]);

  const reactForm = useForm<z.infer<typeof schema>>({
    defaultValues: {
      referenceId: prediction.predictionMade?.referenceId,
      bet: prediction.predictionMade?.bet ?? undefined,
    },
    resolver: zodResolver(schema),
  });

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const selectedType = Object.keys(options).find((type) =>
        Object.values(options[type as ReferenceType]).some(({ id }) =>
          id === data.referenceId)) as ReferenceType | undefined;
      if (!selectedType) throw new Error('Invalid reference type');

      await makePrediction(
        league.leagueHash,
        prediction,
        selectedType,
        data.referenceId,
        data.bet
      );
      await refresh();
      alert('Prediction submitted');
    } catch (error) {
      console.error(error);
      alert('Failed to submit prediction');
    }
  });

  const shauhinEnabled = league.shauhinModeSettings?.enabled &&
    league.shauhinModeSettings.enabledBets
      .includes(prediction.eventName as ScoringBaseEventName);

  return (
    <Form {...reactForm}>
      <form action={() => handleSubmit()}>
        <span className='grid lg:grid-cols-6 grid-cols-1 gap-2 items-center py-2 px-4'>
          <FormField
            name='referenceId'
            render={({ field }) => (
              <FormItem className={shauhinEnabled ? 'lg:col-span-3' : 'lg:col-span-4'}>
                <FormLabel className='sr-only'>Prediction</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={`${field.value ?? ''}`}>
                    <SelectTrigger className=''>
                      <SelectValue placeholder='Select prediction' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(options).map(([referenceType, references]) => (
                        Object.keys(references).length === 0 ? null : (
                          <SelectGroup key={referenceType}>
                            <SelectLabel>{referenceType}s</SelectLabel>
                            {Object.entries(references)
                              .sort(([name, vals], [name2, vals2]) =>
                                vals.tribeName?.localeCompare(vals2.tribeName ?? '') ??
                                name.localeCompare(name2))
                              .map(([name, vals]) => (
                                referenceType === 'Tribe' ?
                                  <SelectItem key={vals.id} value={`${vals.id}`}>
                                    <ColorRow
                                      className='w-20 px-0 justify-center leading-tight'
                                      color={vals.color}>
                                      {name}
                                    </ColorRow>
                                  </SelectItem> :
                                  <SelectItem key={vals.id} value={`${vals.id}`}>
                                    <span className='flex items-center gap-1'>
                                      <ColorRow
                                        className='w-20 px-0 justify-center leading-tight'
                                        color={vals.color}>
                                        {vals.tribeName}
                                      </ColorRow>
                                      {name}
                                    </span>
                                  </SelectItem>
                              ))}
                          </SelectGroup>
                        )))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )} />
          {shauhinEnabled && (
            <FormField
              name='bet'
              render={({ field: betField }) => (
                <FormItem className='relative col-span-2'>
                  <FormLabel className='sr-only'>Bet</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter bet'
                      {...betField}
                      value={betField.value as string ?? ''}
                    />
                  </FormControl>
                  <Popover>
                    <PopoverTrigger className='absolute -translate-y-1/2 top-1/2 right-8'>
                      <HelpCircle size={12} />
                    </PopoverTrigger >
                    <PopoverContent className='w-80'>
                      <PopoverArrow />
                      <h3 className='text-lg font-semibold'>Shauhin Mode</h3>
                      <p className='text-sm'>
                        If your prediction is correct, you will earn the bet amount in points.
                        Miss it, and you lose the bet amount.<br />
                        Bets are limited to a maximum of {league.shauhinModeSettings?.maxBet ?? 1000} points.<br />
                        <br />
                        <b>Note:</b> Bets are only available for certain predictions as defined in the league settings.
                        <br /><br />
                        Good luck!
                      </p>
                    </PopoverContent>
                  </Popover >
                </FormItem >
              )
              } />
          )}
          <Button
            className={cn(shauhinEnabled ? 'lg:col-span-1' : 'lg:col-span-2', 'w-full')}
            disabled={!reactForm.formState.isDirty || reactForm.formState.isSubmitting}
            type='submit'>
            {prediction.predictionMade ?? reactForm.formState.isSubmitSuccessful
              ? 'Update' : 'Submit'}
          </Button>
        </span >
      </form >
    </Form >
  );
}
