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
    episode.episodeId === Number(selectedEpisodeId))?.episodeNumber ?? 1,
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
      await queryClient.invalidateQueries({ queryKey: ['baseEvents'] });
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
                    <FormLabel>Episode</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value as string}
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
              <FormLabel>Event</FormLabel>
              <span className='flex gap-2'>
                <FormField
                  name='eventName'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormControl>
                        <Select
                          defaultValue={field.value as string}
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
                {selectedEvent &&
                  <Select
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
                  </Select>}
                {eventSubtype &&
                  <FormField
                    name='label'
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <FormControl>
                          <Input
                            type='text'
                            placeholder='Label'
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />}
                {eventSubtype &&
                  <FormField
                    name='references'
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <MultiSelect
                            options={combinedReferenceOptions}
                            onValueChange={(value) =>
                              reactForm.setValue('references', handleCombinedReferenceSelection(value))}
                            modalPopover
                            clear={eventClearer}
                            placeholder={'Select References'} />
                        </FormControl>
                      </FormItem>
                    )} />}
              </span>
              {selectedReferences && selectedReferences.length > 0 &&
                <FormField
                  name='notes'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>Notes (line separated)</FormLabel>
                      <FormControl>
                        <Textarea
                          className='w-full'
                          value={(field.value as string[])?.join('\n')}
                          onChange={(e) => reactForm.setValue('notes', e.target.value.split('\n'))}
                          placeholder='Notes' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />}
              <br />
              <Button
                disabled={!reactForm.formState.isValid}
                type='submit'>
                Create
              </Button>
            </form>
            <EpisodeEvents
              episodeNumber={selectedEpisode}
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
