'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLeague } from '~/hooks/useLeague';
import { AllBaseEventNames, type BaseEventInsert, baseEventLabelPrefixes, baseEventLabels, BaseEventInsertZod } from '~/types/events';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { MultiSelect } from '~/components/common/multiSelect';
import { useMemo, useState } from 'react';
import { Input } from '~/components/common/input';
import { Textarea } from '~/components/common/textarea';
import { EpisodeEvents } from '~/components/leagues/hub/recentActivity';
import { Button } from '~/components/common/button';
import { createBaseEvent } from '~/app/api/seasons/actions';
import { useEventOptions } from '~/hooks/useEventOptions';
import { Circle } from 'lucide-react';

export default function CreateCustomEvent() {
  const { leagueData, refresh } = useLeague();
  const reactForm = useForm<BaseEventInsert>({
    defaultValues: {
      episodeId: leagueData.episodes.find(episode => episode.airStatus === 'Airing')?.episodeId ??
        leagueData.episodes.findLast(episode => episode.airStatus === 'Aired')?.episodeId ??
        leagueData.episodes[0]?.episodeId,
      notes: null,
    },
    resolver: zodResolver(BaseEventInsertZod),
  });

  const selectedReferenceType = reactForm.watch('referenceType');
  const selectedReferenceIds = reactForm.watch('references');
  const selectedEvent = reactForm.watch('eventName');
  const selectedEpisodeId = reactForm.watch('episodeId');
  const selectedEpisode = useMemo(() => leagueData.episodes
    .find(episode =>
      episode.episodeId === Number(selectedEpisodeId))?.episodeNumber ?? 1,
    [leagueData.episodes, selectedEpisodeId]);

  const { castawayOptions, tribeOptions } = useEventOptions(selectedEpisode);
  const [eventSubtype, setEventSubtype] = useState('');

  const labelHelper = (subtype: string) => {
    setEventSubtype(subtype);
    if (subtype === 'Custom') return '';
    reactForm.setValue('label', `${baseEventLabelPrefixes[selectedEvent]} ${subtype}`);
  };

  const [eventClearer, setEventClearer] = useState(0);

  const clearReferences = () => {
    setEventClearer(eventClearer + 1);
    reactForm.resetField('references');
  };

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await createBaseEvent(data);
      alert('Base event created successfully');
      reactForm.reset();
      await refresh();
    } catch (e) {
      alert('Failed to create base event');
      console.error('Failed to create base event', e);
    }
  });

  return (
    <div className='w-full px-4 md:pb-14'>
      <section className='bg-card rounded-xl pb-4'>
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
                        defaultValue={`${field.value}`}
                        value={`${field.value}`}
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          clearReferences();
                        }}>
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
                            {AllBaseEventNames.map(eventName => (
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
                      {baseEventLabels[selectedEvent]?.map(subtype => (
                        <SelectItem key={subtype} value={subtype}>
                          {subtype}
                        </SelectItem>
                      ))}
                      <SelectItem value='Custom'>Custom</SelectItem>
                    </SelectContent>
                  </Select>}
              </span>
              {eventSubtype &&
                <FormField
                  name='label'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type='text'
                          placeholder='Label'
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />}
              {eventSubtype && <>
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
              {selectedEvent === 'tribeUpdate' && (
                <FormField
                  name='updateTribe'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          defaultValue={field.value as string}
                          value={field.value as string}
                          onValueChange={(value) => field.onChange(value)}>
                          <SelectTrigger className='h-full'>
                            <SelectValue placeholder='Select Tribe' />
                          </SelectTrigger>
                          <SelectContent>
                            {leagueData.tribes.map(tribe => (
                              <SelectItem
                                className='place-items-center'
                                key={tribe.tribeId}
                                value={`${tribe.tribeId}`}>
                                {tribe.tribeName}
                                <Circle className='inline-block ml-2' fill={tribe.tribeColor} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )} />
              )}
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
              mockBases={selectedEvent ? [{
                eventName: selectedEvent,
                label: reactForm.watch('label'),
                notes: reactForm.watch('notes')?.filter(note => note !== '') ?? null,
                castaways: selectedReferenceType === 'Castaway' ?
                  selectedReferenceIds?.map(castawayId =>
                    castawayOptions.find(castaway => castaway.value === castawayId)?.label)
                    .filter((castaway): castaway is string => castaway !== undefined) :
                  selectedReferenceIds?.map(tribeId =>
                    tribeOptions.find(tribe => tribe.value === tribeId)?.castaways).flat()
                    .filter((castaway): castaway is string => castaway !== undefined),
                tribes: selectedReferenceType === 'Tribe' ?
                  selectedReferenceIds?.map(tribeId =>
                    tribeOptions.find(tribe => tribe.value === tribeId)?.label)
                    .filter((tribe): tribe is string => tribe !== undefined) : [] as string[],
                referenceType: selectedReferenceType,
                references: selectedReferenceIds,
              }] : undefined}
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
