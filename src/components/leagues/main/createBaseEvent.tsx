'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLeague } from '~/hooks/useLeague';
import { AllBaseEventNames, type BaseEventInsert, baseEventLabelPrefixes, baseEventLabels, BaseEventInsertZod } from '~/server/db/defs/events';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { MultiSelect } from '~/components/ui/multiSelect';
import { useMemo, useState } from 'react';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { EpisodeEvents } from './recentActivity';
import { Button } from '~/components/ui/button';
import { createBaseEvent } from '~/app/api/seasons/actions';
import { useEventOptions } from '~/hooks/useEventOptions';

export default function CreateBaseEvent() {
  const { leagueData, refresh } = useLeague();
  const reactForm = useForm<BaseEventInsert>({
    defaultValues: {
      episodeId: leagueData.episodes[0]?.episodeId,
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
    <section className='bg-card rounded-lg'>
      <Form {...reactForm}>
        <span className='flex gap-8 flex-wrap justify-evenly'>
          <form
            className='flex flex-col gap-1 px-2 max-md:w-full flex-grow'
            action={() => handleSubmit()}>
            <h2 className='text-2xl self-center'>Create Base Event</h2>
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
            mockBase={selectedEvent ? {
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
            } : undefined}
            edit
          />
        </span>
      </Form>
    </section >
  );
}
