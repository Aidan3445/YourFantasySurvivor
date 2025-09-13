'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { MultiSelect } from '~/components/common/multiSelect';
import { useMemo, useState } from 'react';
import { Input } from '~/components/common/input';
import { Textarea } from '~/components/common/textarea';
import { Button } from '~/components/common/button';
import EpisodeEvents from '~/components/leagues/hub/activity/timeline/table/view';
import { useLeague } from '~/hooks/leagues/useLeague';
import { CustomEventInsertZod, type EventWithReferences, type CustomEventInsert } from '~/types/events';
import { useEpisodes } from '~/hooks/seasons/useEpisodes';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import createCustomEvent from '~/actions/createCustomEvent';
import { useQueryClient } from '@tanstack/react-query';
import { useEventOptions } from '~/hooks/seasons/enrich/useEventOptions';

export default function CreateCustomEvent() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: rules } = useLeagueRules();
  const { data: episodes } = useEpisodes(league?.seasonId ?? null);

  const reactForm = useForm<CustomEventInsert>({
    defaultValues: {
      episodeId: episodes?.find(episode => episode.airStatus === 'Airing')?.episodeId ??
        episodes?.findLast(episode => episode.airStatus === 'Aired')?.episodeId ??
        episodes?.[0]?.episodeId,
      notes: null,
    },
    resolver: zodResolver(CustomEventInsertZod),
  });

  const selectedReferences = reactForm.watch('references');
  const selectedRuleId = reactForm.watch('customEventRuleId');
  const selectedEvent = useMemo(() =>
    rules?.custom.find(rule => rule.customEventRuleId === Number(selectedRuleId)),
    [rules?.custom, selectedRuleId]);
  const selectedEpisodeId = reactForm.watch('episodeId');
  const selectedEpisode = useMemo(() => episodes?.find(episode =>
    episode.episodeId === Number(selectedEpisodeId))?.episodeNumber,
    [episodes, selectedEpisodeId]);
  const setLabel = reactForm.watch('label');
  const setNotes = reactForm.watch('notes');

  const { combinedReferenceOptions, handleCombinedReferenceSelection } = useEventOptions(league?.seasonId ?? null, selectedEpisode ?? 1);

  const mockEvent = useMemo(() => {
    if (!selectedEvent) return null;
    return {
      eventSource: 'Custom',
      eventType: 'Direct',
      eventName: selectedEvent.eventName,
      label: setLabel ?? selectedEvent.eventName,
      episodeNumber: selectedEpisode,
      references: selectedReferences ?? [],
      notes: setNotes
    } as EventWithReferences;
  }, [
    selectedEpisode,
    selectedEvent,
    selectedReferences,
    setLabel,
    setNotes,
  ]);

  const [eventClearer, setEventClearer] = useState(0);

  const clearReferences = () => {
    setEventClearer(eventClearer + 1);
    reactForm.resetField('references');
  };

  if (!rules?.custom || rules.custom.length === 0) return (
    <div className='px-4 w-full md:pb-14 text-center'>
      <section className='bg-card rounded-xl pb-4 w-full'>
        <h2 className='text-2xl self-center text-muted-foreground'>No Custom Events</h2>
        <p className='text-center text-muted-foreground'>You can create a custom event in the <span className='font-bold'>Settings</span> tab.</p>
      </section>
    </div>
  );

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;
    try {
      await createCustomEvent(league.hash, data);
      alert('Custom event created successfully');
      clearReferences();
      reactForm.reset({
        episodeId: data.episodeId,
        notes: null,
      });
      await queryClient.invalidateQueries({ queryKey: ['customEvents', league.hash] });
    } catch (e) {
      alert('Failed to create custom event');
      console.error('Failed to create custom event', e);
    }
  });

  return (
    <div className='w-full px-4 md:pb-14'>
      <section className='bg-card rounded-xl'>
        <Form {...reactForm}>
          <span className='flex gap-8 flex-wrap justify-evenly'>
            <form
              className='flex flex-col gap-1 px-2 max-md:w-full grow'
              action={() => handleSubmit()}>
              <h2 className='text-2xl self-center'>Create Custom Event</h2>
              <FormField
                name='episodeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='ml-2'>Episode</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value as string}
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          clearReferences();
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Episode' />
                        </SelectTrigger>
                        <SelectContent>
                          {episodes?.map(episode => (
                            <SelectItem key={episode.episodeId} value={episode.episodeId as unknown as string}>
                              {episode.episodeNumber}: {episode.title} - {episode.airDate.toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <span className='flex gap-4'>
                <FormField
                  name='customEventRuleId'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='ml-2'>Event</FormLabel>
                      <FormControl>
                        <Select
                          disabled={!selectedEpisode}
                          value={field.value as string}
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                            clearReferences();
                          }}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Event'>
                              {
                                (() => {
                                  const rule = rules?.custom.find(rule => rule.customEventRuleId === Number(field.value));
                                  if (rule) return `${rule.eventName} (${rule.eventType})`;
                                  return 'Select Event';
                                })()
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {rules?.custom.map(({ eventName, customEventRuleId, eventType }) => (
                              <SelectItem key={customEventRuleId} value={customEventRuleId.toString()}>
                                {eventName} ({eventType})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField
                  name='label'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='ml-2'>Label (optional)</FormLabel>
                      <FormControl>
                        <Input
                          disabled={!selectedEvent}
                          type='text'
                          placeholder='Label'
                          {...field}
                          value={field.value as string ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
              </span>
              <span className='flex gap-2'>
                <FormField
                  name='references'
                  render={() => (
                    <FormItem className='w-full'>
                      <FormLabel className='ml-2'>References</FormLabel>
                      <FormControl>
                        <MultiSelect
                          className='h-full rounded-xl pt-1'
                          disabled={!selectedEvent}
                          options={combinedReferenceOptions}
                          onValueChange={(value) =>
                            reactForm.setValue('references', handleCombinedReferenceSelection(value))}
                          modalPopover
                          maxCount={7}
                          clear={eventClearer}
                          placeholder={'Select References'} />
                      </FormControl>
                    </FormItem>
                  )} />
                <FormField
                  name='notes'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='ml-2'>Notes (line separated)</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={!selectedReferences || selectedReferences.length === 0}
                          className='w-full h-full'
                          value={(field.value as string[])?.join('\n')}
                          onChange={(e) => reactForm.setValue('notes', e.target.value.split('\n'))}
                          placeholder='Notes' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
              </span>
              <br />
              <Button
                disabled={CustomEventInsertZod.safeParse(reactForm.getValues()).success === false}
                type='submit'>
                Create
              </Button>
            </form>
            <EpisodeEvents
              episodeNumber={selectedEpisode ?? 1}
              mockEvents={mockEvent ? [mockEvent] : []}
              edit
              filters={{
                castaway: [],
                tribe: [],
                member: [],
                event: []
              }}
            />
          </span>
        </Form>
      </section>
    </div>
  );
}

