'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { MultiSelect } from '~/components/common/multiSelect';
import { useState } from 'react';
import { Input } from '~/components/common/input';
import { Textarea } from '~/components/common/textarea';
import { Button } from '~/components/common/button';
import { BaseEventInsertZod, CustomEventInsertZod, type EventReference, type BaseEventInsert, type CustomEventInsert, type EnrichedEvent, type BaseEventName } from '~/types/events';
import z from 'zod';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useEventOptions } from '~/hooks/seasons/enrich/useEventOptions';
import updateBaseEvent from '~/actions/updateBaseEvent';
import updateCustomEvent from '~/actions/updateCustomEvent';
import { useQueryClient } from '@tanstack/react-query';
import deleteBaseEvent from '~/actions/deleteBaseEvent';
import deleteCustomEvent from '~/actions/deleteCustomEvent';

interface EditEventProps {
  event: EnrichedEvent;
}

export default function EditEvent({ event }: EditEventProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const reactForm = useForm<BaseEventInsert | CustomEventInsert>({
    defaultValues: {
      label: event.label ?? '',
      notes: event.notes ?? [],
      references: event.references,
      customEventRuleId: event.customEventRuleId,
      episodeId: event.episodeId,
      eventName: event.eventName as BaseEventName
    },
    resolver: zodResolver(z.union([BaseEventInsertZod, CustomEventInsertZod]))
  });
  const {
    combinedReferenceOptions,
    handleCombinedReferenceSelection,
    getDefaultStringValues
  } = useEventOptions(league?.seasonId ?? null, event.episodeNumber);
  const [eventClearer, setEventClearer] = useState(0);

  const clearReferences = () => {
    setEventClearer(eventClearer + 1);
    reactForm.resetField('references');
  };

  const [modalsOpen, setModalsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    // determine if base or custom event
    const isBaseEvent = event.eventSource === 'Base';
    try {
      if (isBaseEvent) {
        await updateBaseEvent(event.eventId, data as BaseEventInsert);
        await queryClient.invalidateQueries({ queryKey: ['baseEvents', league?.seasonId] });
        await queryClient.invalidateQueries({ queryKey: ['seasons', league?.seasonId] });
      } else {
        if (!event.customEventRuleId) throw new Error('Missing customEventRuleId for custom event');
        if (!league?.hash) throw new Error('Missing league hash');
        await updateCustomEvent(league?.hash, event.eventId, data as CustomEventInsert);
        await queryClient.invalidateQueries({ queryKey: ['customEvents', league?.hash] });
      }

      clearReferences();
      setModalsOpen(false);
      alert('Event updated successfully');
    } catch (e) {
      alert('Failed to update event');
      console.error('Failed to update event', e);
    }
  });

  const handleDelete = async () => {
    // determine if base or custom event
    const isBaseEvent = event.eventSource === 'Base';
    try {
      if (isBaseEvent) {
        await deleteBaseEvent(event.eventId);
        await queryClient.invalidateQueries({ queryKey: ['baseEvents', league?.seasonId] });
        await queryClient.invalidateQueries({ queryKey: ['seasons', league?.seasonId] });
      } else {
        if (!event.customEventRuleId) throw new Error('Missing customEventRuleId for custom event');
        if (!league?.hash) throw new Error('Missing league hash');
        await deleteCustomEvent(league?.hash, event.eventId);
        await queryClient.invalidateQueries({ queryKey: ['customEvents', league?.hash] });
      }
      clearReferences();
      setModalsOpen(false);
      setDeleteModalOpen(false);

      alert('Event deleted successfully');
    } catch (e) {
      alert('Failed to delete event');
      console.error('Failed to delete event', e);
    }
  };

  return (
    <Form {...reactForm}>
      <AlertDialog open={modalsOpen} onOpenChange={setModalsOpen}>
        <AlertDialogTrigger>
          <Pencil size={20} />
        </AlertDialogTrigger>
        <AlertDialogContent className='bg-card rounded-lg overflow-y-auto min-w-max'>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Edit {event.eventName}
            </AlertDialogTitle>
            <AlertDialogDescription hidden>Edit the event details</AlertDialogDescription>
          </AlertDialogHeader>
          <form className='flex flex-col gap-1 px-2 w-full' action={() => handleSubmit()}>
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
              name='references'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiSelect
                      className='[&_[role=dialog]]:z-[100]'
                      options={combinedReferenceOptions}
                      onValueChange={(value) =>
                        reactForm.setValue('references', handleCombinedReferenceSelection(value))}
                      defaultValue={getDefaultStringValues(field.value as EventReference[])}
                      clear={eventClearer}
                      placeholder={'Select References'} />
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
            <AlertDialogFooter className='flex w-full justify-between! flex-row-reverse!'>
              <AlertDialogCancel className='absolute top-1 right-1 h-min p-1'>
                <X stroke='white' />
              </AlertDialogCancel>
              <span className='flex gap-1 items-baseline'>
                <AlertDialogCancel variant='secondary'>
                  Cancel
                </AlertDialogCancel>
                <Button type='submit'>
                  Save
                </Button>
              </span>
              <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
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
                      <Button variant='destructive' type='submit'>
                        Delete
                      </Button>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog >
    </Form >
  );
}

