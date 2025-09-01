'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { useState } from 'react';
import { useEventOptions } from '~/hooks/useEventOptions';
import { Textarea } from '~/components/common/textarea';
import { Button } from '~/components/common/button';
import { deleteCustomEvent, updateCustomEvent } from '~/services/leagues/settings/leagueActions';
import { useLeague } from '~/hooks/useLeague';
import { type LeagueEvent, type LeagueEventInsert, LeagueEventInsertZod } from '~/types/events';

interface EditCustomEventProps {
  episodeNumber: number;
  customEvent: LeagueEvent;
}

export default function EditCustomEvent({ episodeNumber, customEvent }: EditCustomEventProps) {
  const { league, leagueData, refresh } = useLeague();
  const reactForm = useForm<LeagueEventInsert>({
    defaultValues: {
      episodeId: leagueData.episodes.toReversed()[episodeNumber - 1]?.episodeId,
      ...customEvent,
    },
    resolver: zodResolver(LeagueEventInsertZod)
  });
  const selectedReferenceType = reactForm.watch('referenceType');
  const { castawayOptions, tribeOptions } = useEventOptions(episodeNumber);

  const clearReferences = () => {
    reactForm.resetField('referenceId');
  };

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await updateCustomEvent(league.leagueHash, customEvent.eventId, data);
      alert('Event updated successfully');
      await refresh();
    } catch (e) {
      alert('Failed to update event');
      console.error('Failed to update event', e);
    }
  });

  const handleDelete = async () => {
    try {
      await deleteCustomEvent(league.leagueHash, customEvent.eventId);
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
            <AlertDialogTitle>Edit {customEvent.eventName}</AlertDialogTitle>
            <AlertDialogDescription hidden>Edit the event details</AlertDialogDescription>
          </AlertDialogHeader>
          <form
            className='flex flex-col gap-1 px-2 w-full'
            action={() => handleSubmit()}>
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
              name='referenceId'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      defaultValue={`${field.value}`}
                      value={`${field.value}`}
                      onValueChange={field.onChange}>
                      <SelectTrigger className='h-full'>
                        <SelectValue placeholder='Select Reference' />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedReferenceType === 'Castaway' && castawayOptions.map((castaway) => (
                          <SelectItem key={castaway.value} value={`${castaway.value}`}>
                            {castaway.label}
                          </SelectItem>
                        ))}
                        {selectedReferenceType === 'Tribe' && tribeOptions.map((tribe) => (
                          <SelectItem key={tribe.value} value={`${tribe.value}`}>
                            {tribe.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      <FormMessage />
                    </Select>
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
              <span className='flex gap-1 items-leagueline'>
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
