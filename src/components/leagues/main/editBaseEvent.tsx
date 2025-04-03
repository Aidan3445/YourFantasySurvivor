'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/ui/alertDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { MultiSelect } from '~/components/ui/multiSelect';
import { type BaseEventInsert, BaseEventInsertZod, baseEventLabelPrefixes, baseEventLabels, type BaseEvent } from '~/server/db/defs/events';
import { useState } from 'react';
import { Input } from '~/components/ui/input';
import { useEventOptions } from '~/hooks/useEventOptions';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { deleteBaseEvent, updateBaseEvent } from '~/app/api/seasons/actions';
import { useLeague } from '~/hooks/useLeague';

interface EditBaseEventProps {
  episodeNumber: number;
  baseEvent: BaseEvent;
}

export default function EditBaseEvent({ episodeNumber, baseEvent }: EditBaseEventProps) {
  const { leagueData, refresh } = useLeague();
  const reactForm = useForm<BaseEventInsert>({
    defaultValues: {
      episodeId: leagueData.episodes[episodeNumber - 1]?.episodeId,
      ...baseEvent,
      label: baseEvent.label || (`${baseEventLabelPrefixes[baseEvent.eventName]} ${baseEventLabels[baseEvent.eventName]?.[0] ?? baseEvent.eventName}`)
    },
    resolver: zodResolver(BaseEventInsertZod)
  });
  const selectedReferenceType = reactForm.watch('referenceType');
  const { castawayOptions, tribeOptions } = useEventOptions(episodeNumber);
  const [eventClearer, setEventClearer] = useState(0);

  const clearReferences = () => {
    setEventClearer(eventClearer + 1);
    reactForm.resetField('references');
  };

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await updateBaseEvent(baseEvent.baseEventId, data);
      alert('Event updated successfully');
      await refresh();
    } catch (e) {
      alert('Failed to update event');
      console.error('Failed to update event', e);
    }
  });

  const handleDelete = async () => {
    try {
      await deleteBaseEvent(baseEvent.baseEventId);
      alert('Event deleted successfully');
      await refresh();
    } catch (e) {
      alert('Failed to delete event');
      console.error('Failed to delete event', e);
    }
  };

  const [modalsOpen, setModalsOpen] = useState(false);

  return (
    <Form {...reactForm}>
      <AlertDialog open={modalsOpen} onOpenChange={setModalsOpen}>
        <AlertDialogTrigger>
          <Pencil size={20} />
        </AlertDialogTrigger>
        <AlertDialogContent className='bg-card rounded-lg overflow-y-auto min-w-max'>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Edit {baseEvent.eventName}
            </AlertDialogTitle>
            <AlertDialogDescription hidden>Edit the event details</AlertDialogDescription>
          </AlertDialogHeader>
          <form
            className='flex flex-col gap-1 px-2 w-full'
            action={() => handleSubmit()}>
            <FormField
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Label</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      placeholder='Label'
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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
              )} />
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
            <AlertDialogFooter className='flex w-full !justify-between !flex-row-reverse'>
              <AlertDialogCancel className='absolute top-1 right-1 h-min p-1'>
                <X stroke='white' />
              </AlertDialogCancel>
              <span className='flex gap-1 items-baseline'>
                <AlertDialogCancel variant='secondary'>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button type='submit'>Save</Button>
                </AlertDialogAction>
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive'>Delete Event</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className='w-min text-nowrap'>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this event?
                      <br />
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant='secondary'>
                      Cancel
                    </AlertDialogCancel>
                    <form action={() => handleDelete()}>
                      <AlertDialogAction
                        variant='destructive'
                        asChild>
                        <Button
                          type='submit'
                          onClick={() => setModalsOpen(false)}>
                          Delete
                        </Button>
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog >
    </Form>
  );
}
