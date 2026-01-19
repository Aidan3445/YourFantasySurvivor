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
import EpisodeEvents from '~/components/shared/eventTimeline/table/view';
import { CustomEventInsertZod, type EventWithReferences, type CustomEventInsert } from '~/types/events';
import { useEpisodes } from '~/hooks/seasons/useEpisodes';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import createCustomEvent from '~/actions/createCustomEvent';
import { useQueryClient } from '@tanstack/react-query';
import { useEventOptions } from '~/hooks/seasons/enrich/useEventOptions';
import { useSeasonsData } from '~/hooks/seasons/useSeasonsData';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';

export default function CreateCustomEvent() {
  const queryClient = useQueryClient();
  const leagueData = useLeagueData();
  const { data: rules } = useLeagueRules();
  const { data: episodes } = useEpisodes(leagueData?.league?.seasonId ?? null);
  const { data: seasonData } = useSeasonsData(true, leagueData?.league?.seasonId ?? undefined);
  const season = seasonData?.[0];

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

  const { combinedReferenceOptions, handleCombinedReferenceSelection } = useEventOptions(
    leagueData?.league?.seasonId ?? null,
    selectedEpisode ?? 1
  );

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
    <div className='w-full text-center'>
      <section className='bg-card rounded-lg border-2 border-primary/20 shadow-lg shadow-primary/10 p-4 w-full'>
        <h2 className='text-xl font-bold uppercase tracking-wider text-muted-foreground'>No Custom Events</h2>
        <p className='text-sm text-muted-foreground'>You can create a custom event in the <span className='font-bold'>Settings</span> tab.</p>
      </section>
    </div>
  );

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!leagueData?.league) return;
    try {
      await createCustomEvent(leagueData.league.hash, data);
      alert('Custom event created successfully');
      clearReferences();
      reactForm.reset({
        episodeId: data.episodeId,
        notes: null,
      });
      await queryClient.invalidateQueries({ queryKey: ['customEvents', leagueData.league.hash] });
    } catch (e) {
      alert('Failed to create custom event');
      console.error('Failed to create custom event', e);
    }
  });

  return (
    <div className='w-full'>
      <section className='bg-card rounded-lg border-2 border-primary/20 shadow-lg shadow-primary/10 p-3'>
        <Form {...reactForm}>
          <span className='flex gap-8 flex-wrap justify-evenly'>
            <form
              className='flex flex-col gap-2 px-2 max-md:w-full grow'
              action={() => handleSubmit()}>
              <div className='flex items-center gap-3 h-8'>
                <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
                <h2 className='md:text-xl font-black uppercase tracking-tight leading-none text-nowrap'>
                  Create Custom Event
                </h2>
              </div>
              <FormField
                name='episodeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Episode</FormLabel>
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
                      <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Event</FormLabel>
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
                      <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Label (optional)</FormLabel>
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
                      <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>References</FormLabel>
                      <FormControl>
                        <MultiSelect
                          className='h-full rounded-xl pt-1 z-50'
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
                      <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Notes (line separated)</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={!selectedReferences || selectedReferences.length === 0}
                          className='w-full'
                          value={(field.value as string[])?.join('\n')}
                          onChange={(e) => reactForm.setValue('notes', e.target.value.split('\n'))}
                          placeholder='Notes' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
              </span>
              <Button
                className='mt-2 font-bold uppercase text-xs tracking-wider'
                disabled={
                  !selectedEvent ||
                  setLabel === '' ||
                  !selectedReferences ||
                  selectedReferences.length === 0
                }
                type='submit'>
                Create
              </Button>
            </form>
            <div className='w-full'>
              <EpisodeEvents
                episodeNumber={selectedEpisode ?? 1}
                seasonData={season!}
                leagueData={leagueData}
                mockEvents={mockEvent ? [mockEvent] : []}
                edit
                filters={{
                  castaway: [],
                  tribe: [],
                  member: [],
                  event: []
                }} />
            </div>
          </span>
        </Form>
      </section>
    </div>
  );
}

