'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLeague } from '~/hooks/useLeague';
import { type LeagueEventInsert, LeagueEventInsertZod } from '~/types/events';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { useMemo } from 'react';
import { Textarea } from '~/components/common/textarea';
import { EpisodeEvents } from '~/components/leagues/hub/recentActivity';
import { Button } from '~/components/common/button';
import { useEventOptions } from '~/hooks/useEventOptions';
import { createLeagueEvent } from '~/services/leagues/settings/leagueSettingActions';

export default function CreateCustomEvent() {
  const { leagueData, league, refresh } = useLeague();
  const reactForm = useForm<LeagueEventInsert>({
    defaultValues: {
      episodeId: leagueData.episodes.find(episode => episode.airStatus === 'Airing')?.episodeId ??
        leagueData.episodes.findLast(episode => episode.airStatus === 'Aired')?.episodeId ??
        leagueData.episodes[0]?.episodeId,
      notes: null,
    },
    resolver: zodResolver(LeagueEventInsertZod),
  });

  const selectedReferenceType = reactForm.watch('referenceType');
  const selectedEvent = league.customEventRules.find(rule =>
    rule.leagueEventRuleId === +reactForm.watch('leagueEventRuleId'));
  const selectedEpisodeId = reactForm.watch('episodeId');
  const selectedEpisode = useMemo(() => leagueData.episodes
    .find(episode =>
      episode.episodeId === +selectedEpisodeId)?.episodeNumber ?? 1,
    [leagueData.episodes, selectedEpisodeId]);

  const { castawayOptions, tribeOptions } = useEventOptions(selectedEpisode);

  if (league.customEventRules.length === 0) return (
    <div className='px-4 w-full md:pb-14 text-center'>
      <section className='bg-card rounded-xl pb-4 w-full'>
        <h2 className='text-2xl self-center text-muted-foreground'>No Custom Events</h2>
        <p className='text-center text-muted-foreground'>You can create a custom event in the <span className='font-bold'>Settings</span> tab.</p>
      </section>
    </div>
  );

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await createLeagueEvent(league.leagueHash, data);
      alert('Base event created successfully');
      reactForm.reset();
      await refresh();
    } catch (e) {
      alert('Failed to create base event');
      console.error('Failed to create base event', e);
    }
  });


  const correctPredictions: { predictionMaker: string }[] =
    leagueData.leagueEvents.predictionEvents[selectedEpisode]
      ?.filter((prediction) => prediction.leagueEventRuleId === +reactForm.watch('leagueEventRuleId') &&
        prediction.referenceId === +reactForm.watch('referenceId')) ?? [];
  if (correctPredictions.length === 0) {
    correctPredictions.push({ predictionMaker: 'No Correct Predictions' });
  }

  return (
    <div className='px-4 w-full md:pb-14'>
      <section className='bg-card rounded-xl pb-4 w-full'>
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
                          {leagueData.episodes.map(episode => (
                            <SelectItem key={episode.episodeId} value={`${episode.episodeId}`}>
                              {episode.episodeNumber}: {episode.episodeTitle} - {episode.episodeAirDate.toLocaleDateString()}
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
                          if (selectedEvent?.referenceTypes[0])
                            reactForm.setValue('referenceType', selectedEvent.referenceTypes[0]);
                        }}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Event' />
                        </SelectTrigger>
                        <SelectContent>
                          {league.customEventRules.map(({ eventName, leagueEventRuleId }) => (
                            <SelectItem key={eventName} value={leagueEventRuleId.toString()}>
                              {eventName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
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
                            reactForm.resetField('referenceId');
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
                  name='referenceId'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          defaultValue={field.value as string}
                          value={field.value as string ?? ''}
                          onValueChange={(value) => field.onChange(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Reference' />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedReferenceType === 'Castaway' ?
                              castawayOptions.map(({ value, label }) => (
                                <SelectItem key={value} value={`${value}`}>
                                  {label}
                                </SelectItem>
                              )) :
                              tribeOptions.map(({ value, label }) => (
                                <SelectItem key={value} value={`${value}`}>
                                  {label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )} />}
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
                )} />
              <br />
              <Button
                disabled={!reactForm.formState.isValid}
                type='submit'>
                Create
              </Button>
            </form>
            <EpisodeEvents
              episodeNumber={selectedEpisode}
              mockDirects={selectedEvent?.eventType === 'Direct' ? [{
                leagueEventRuleId: +reactForm.watch('leagueEventRuleId'),
                eventName: selectedEvent.eventName,
                referenceType: selectedReferenceType,
                points: selectedEvent.points,
                referenceId: +reactForm.watch('referenceId'),
                referenceName: selectedReferenceType === 'Castaway' ?
                  castawayOptions.find(castaway => castaway.value === +reactForm.watch('referenceId'))?.label ?? '' :
                  tribeOptions.find(tribe => tribe.value === +reactForm.watch('referenceId'))?.label ?? '',
                notes: reactForm.watch('notes')?.filter(note => note !== '') ?? null,
              }] : undefined}
              mockPredictions={selectedEvent?.eventType === 'Prediction' ?
                correctPredictions.map(prediction => ({
                  leagueEventRuleId: +reactForm.watch('leagueEventRuleId'),
                  eventName: selectedEvent.eventName,
                  referenceType: selectedReferenceType,
                  points: selectedEvent.points,
                  predictionMaker: prediction.predictionMaker,
                  referenceId: +reactForm.watch('referenceId'),
                  referenceName: selectedReferenceType === 'Castaway' ?
                    castawayOptions.find(castaway => castaway.value === +reactForm.watch('referenceId'))?.label ?? '' :
                    tribeOptions.find(tribe => tribe.value === +reactForm.watch('referenceId'))?.label ?? '',
                  hit: true,
                  notes: reactForm.watch('notes')?.filter(note => note !== '') ?? null,
                })) : undefined}
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

