'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { useMemo, useState } from 'react';
import { Textarea } from '~/components/common/textarea';
import EpisodeEvents from '~/components/leagues/hub/activity/timeline/table/view';
import { Button } from '~/components/common/button';
import { CustomEventInsertZod, type EventWithReferences, type CustomEventInsert } from '~/types/events';
import { useQueryClient } from '@tanstack/react-query';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useEpisodes } from '~/hooks/seasons/useEpisodes';
import { useEventOptions } from '~/hooks/seasons/enrich/useEventOptions';
import createCustomEvent from '~/actions/createCustomEvent';
import { Switch } from '~/components/common/switch';
import { Input } from '~/components/common/input';
import { MultiSelect } from '~/components/common/multiSelect';

export default function CreateLeagueEvent() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: rules } = useLeagueRules();
  const { data: episodes } = useEpisodes(league?.leagueId ?? null);

  const reactForm = useForm<CustomEventInsert>({
    defaultValues: {
      episodeId: episodes?.find(episode => episode.airStatus === 'Airing')?.episodeId ??
        episodes?.findLast(episode => episode.airStatus === 'Aired')?.episodeId ??
        episodes?.[0]?.episodeId,
      notes: null,
    },
    resolver: zodResolver(CustomEventInsertZod),
  });

  const selectedReferenceType = reactForm.watch('referenceType');
  const selectedReferenceIds = reactForm.watch('references');
  const selectedRuleId = reactForm.watch('customEventRuleId');
  const selectedEvent = useMemo(() =>
    rules?.custom.find(rule => rule.customEventRuleId === +selectedRuleId),
    [rules?.custom, selectedRuleId]);
  const selectedEpisodeId = reactForm.watch('episodeId');
  const selectedEpisode = useMemo(() => episodes?.find(episode =>
    episode.episodeId === +selectedEpisodeId)?.episodeNumber ?? 1,
    [episodes, selectedEpisodeId]);
  const setLabel = reactForm.watch('label');
  const setNotes = reactForm.watch('notes');

  const { tribeOptions, castawayOptions } = useEventOptions(league?.seasonId ?? null, selectedEpisode ?? 1);

  const [hasCustomLabel, setHasCustomLabel] = useState(false);

  const mockEvent = useMemo(() => {
    if (!selectedEvent) return null;
    return {
      eventSource: 'Custom',
      eventType: 'Direct',
      eventName: selectedEvent.eventName,
      label: setLabel ?? selectedEvent.eventName,
      episodeNumber: selectedEpisode,
      references: (selectedReferenceIds ?? []).map(id => ({
        type: selectedReferenceType,
        id: id,
      })),
      notes: setNotes
    } as EventWithReferences;
  }, [
    selectedEvent,
    selectedEpisode,
    selectedReferenceType,
    selectedReferenceIds,
    setLabel,
    setNotes
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
      alert('Base event created successfully');
      reactForm.reset();
      await queryClient.invalidateQueries({ queryKey: ['customEvents', league.hash] });
    } catch (e) {
      alert('Failed to create base event');
      console.error('Failed to create base event', e);
    }
  });

  return (
    <div className='px-4 w-full md:pb-14'>
      <section className='bg-card rounded-xl w-full'>
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
                    <FormLabel>Episode</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={`${field.value}`}
                        value={`${field.value}`}
                        onValueChange={(value) => field.onChange(Number(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Episode' />
                        </SelectTrigger>
                        <SelectContent>
                          {episodes?.map(episode => (
                            <SelectItem key={episode.episodeId} value={`${episode.episodeId}`}>
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
              <FormField
                name='leagueEventRuleId'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormControl>
                      <Select
                        defaultValue={field.value as string}
                        value={field.value as string}
                        onValueChange={(value) => {
                          field.onChange(value);
                          reactForm.resetField('label');
                          reactForm.resetField('referenceType');
                          setHasCustomLabel(false);
                          clearReferences();
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Event' />
                        </SelectTrigger>
                        <SelectContent>
                          {rules?.custom.map(({ eventName, customEventRuleId }) => (
                            <SelectItem key={eventName} value={customEventRuleId.toString()}>
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
                <Switch
                  id='custom-label'
                  checked={hasCustomLabel}
                  onCheckedChange={(checked) => {
                    setHasCustomLabel(checked);
                    if (!checked) reactForm.resetField('label');
                  }}>
                  Use Custom Label
                </Switch>}
              {selectedEvent && hasCustomLabel &&
                <FormField
                  name='label'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>Custom Label</FormLabel>
                      <FormControl>
                        <Input
                          type='text'
                          className='w-full'
                          placeholder='Label'
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />}
              {selectedEvent && <>
                <FormLabel>Reference</FormLabel>
                <FormField
                  name='referenceType'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          defaultValue={field.value as string}
                          value={field.value as string}
                          onValueChange={(value) => {
                            field.onChange(value);
                            clearReferences();
                          }}>
                          <SelectTrigger className='h-full'>
                            <SelectValue placeholder='Select Reference Type' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Castaway'>Castaway</SelectItem>
                            <SelectItem value='Tribe'>Tribe</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )} />
              </>}
              {selectedReferenceType &&
                <FormField
                  name='references'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiSelect
                          options={selectedReferenceType === 'Castaway' ?
                            castawayOptions : tribeOptions}
                          onValueChange={field.onChange}
                          defaultValue={field.value as string[]}
                          value={field.value as string[]}
                          modalPopover
                          clear={eventClearer}
                          placeholder={`Select ${selectedReferenceType}s`} />
                      </FormControl>
                    </FormItem>
                  )} />}
              {selectedReferenceIds?.length &&
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

