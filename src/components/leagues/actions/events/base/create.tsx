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
import { BaseEventInsertZod, type EventWithReferences, type BaseEventInsert } from '~/types/events';
import { useEpisodes } from '~/hooks/seasons/useEpisodes';
import { BaseEventLabelPrefixes, BaseEventLabels, BaseEventNames } from '~/lib/events';
import createBaseEvent from '~/actions/createBaseEvent';
import { useQueryClient } from '@tanstack/react-query';
import { useEventOptions } from '~/hooks/seasons/enrich/useEventOptions';
import { cn } from '~/lib/utils';

export default function CreateBaseEvent() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: episodes } = useEpisodes(league?.seasonId ?? null);

  const reactForm = useForm<BaseEventInsert>({
    defaultValues: {
      episodeId: episodes?.find(episode => episode.airStatus === 'Airing')?.episodeId ??
        episodes?.findLast(episode => episode.airStatus === 'Aired')?.episodeId ??
        episodes?.[0]?.episodeId,
      notes: null,
    },
    resolver: zodResolver(BaseEventInsertZod),
  });

  const selectedReferences = reactForm.watch('references');
  const selectedEvent = reactForm.watch('eventName');
  const selectedEpisodeId = reactForm.watch('episodeId');
  const selectedEpisode = useMemo(() => episodes?.find(episode =>
    episode.episodeId === Number(selectedEpisodeId))?.episodeNumber,
    [episodes, selectedEpisodeId]);
  const setLabel = reactForm.watch('label');
  const setNotes = reactForm.watch('notes');

  const { combinedReferenceOptions, handleCombinedReferenceSelection } = useEventOptions(league?.seasonId ?? null, selectedEpisode ?? 1);

  const [eventSubtype, setEventSubtype] = useState('');

  const labelHelper = (subtype: string) => {
    setEventSubtype(subtype);
    if (subtype === 'Custom') return '';
    reactForm.setValue('label', `${BaseEventLabelPrefixes[selectedEvent]} ${subtype}`);
  };

  const mockEvent = useMemo(() => {
    if (!selectedEvent) return null;
    return {
      eventSource: 'Base',
      eventType: 'Direct',
      eventName: selectedEvent,
      label: setLabel ?? `${BaseEventLabelPrefixes[selectedEvent]} ${BaseEventLabels[selectedEvent]?.[0] ?? selectedEvent}`,
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

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await createBaseEvent(data);
      alert('Base event created successfully');
      setEventSubtype('');
      clearReferences();
      reactForm.reset({
        episodeId: data.episodeId,
        notes: null,
      });
      await queryClient.invalidateQueries({ queryKey: ['baseEvents', league?.seasonId] });
      await queryClient.invalidateQueries({ queryKey: ['seasons', league?.seasonId] });
    } catch (e) {
      alert('Failed to create base event');
      console.error('Failed to create base event', e);
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
              <h2 className='text-2xl self-center'>Score Base Event</h2>
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
              <span className='flex gap-2'>
                <FormField
                  name='eventName'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='ml-2'>Event</FormLabel>
                      <FormControl>
                        <Select
                          disabled={!selectedEpisode}
                          value={field.value as string}
                          onValueChange={(value) => {
                            field.onChange(value);
                            reactForm.resetField('label');
                            setEventSubtype('');
                            clearReferences();
                          }}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Event' />
                          </SelectTrigger>
                          <SelectContent>
                            {BaseEventNames.map(eventName => (
                              <SelectItem key={eventName} value={eventName}>
                                {eventName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <div className='w-full'>
                  <FormLabel className='ml-2'>Type</FormLabel>
                  <Select
                    disabled={!selectedEvent}
                    value={eventSubtype}
                    onValueChange={labelHelper}>
                    <SelectTrigger>
                      <SelectValue placeholder='Event Subtype' />
                    </SelectTrigger>
                    <SelectContent>
                      {BaseEventLabels[selectedEvent]?.map(subtype => (
                        <SelectItem key={subtype} value={subtype}>
                          {subtype}
                        </SelectItem>
                      ))}
                      <SelectItem value='Custom'>Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormField
                  name='label'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='ml-2'>Label</FormLabel>
                      <FormControl>
                        <Input
                          disabled={eventSubtype === ''}
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
                    <FormItem className={cn('w-full', eventSubtype === '' && '!pointer-events-none !cursor-not-allowed')}>
                      <FormLabel className='ml-2'>References</FormLabel>
                      <FormControl>
                        <MultiSelect
                          className='h-full rounded-xl pt-1'
                          maxCount={7}
                          disabled={eventSubtype === ''}
                          options={combinedReferenceOptions}
                          onValueChange={(value) =>
                            reactForm.setValue('references', handleCombinedReferenceSelection(value))}
                          modalPopover
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
                disabled={!reactForm.formState.isValid}
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
      </section >
    </div >
  );
}
