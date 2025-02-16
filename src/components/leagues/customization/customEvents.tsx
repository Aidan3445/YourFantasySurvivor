'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { useLeague } from '~/hooks/useLeague';
import {
  type LeagueEventRule, LeagueEventRuleZod, LeagueEventTypeOptions,
  LeaguePredictionTimingOptions, defaultLeagueEventRule
} from '~/server/db/defs/events';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { MultiSelect } from '~/components/ui/multiSelect';
import { Button } from '~/components/ui/button';
import { createLeagueEventRule, deleteLeagueEventRule, updateLeagueEventRule } from '~/app/api/leagues/actions';
import { Flame, Settings2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alertDialog';
import { type ReactNode, useState } from 'react';

export default function CustomEvents() {
  const {
    league: {
      leagueHash,
      leagueStatus,
      customEventRules,
      members: {
        loggedIn
      },
      settings: {
        draftDate
      }
    },
    refresh
  } = useLeague();

  const reactForm = useForm<LeagueEventRule>({
    defaultValues: defaultLeagueEventRule,
    resolver: zodResolver(LeagueEventRuleZod),
  });

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    const newRule: LeagueEventRule = {
      ...data,
      timing: data.eventType === 'Prediction' ? data.timing : [],
    };

    try {
      await createLeagueEventRule(leagueHash, newRule);
      await refresh();
      alert(`Custom event created for league ${leagueHash}`);
      reactForm.reset();
    } catch (error) {
      console.error(error);
      alert('Failed to create custom event');
    }
  });

  const disabled =
    leagueStatus !== 'Predraft' ||
    loggedIn?.role !== 'Owner' ||
    (!!draftDate && Date.now() > draftDate.getTime());

  return (
    <article className='bg-card py-2 rounded-xl w-full'>
      <div className='px-2'>
        <h2 className='text-lg font-bold text-card-foreground'>Custom Events</h2>
        <div className='flex flex-col gap-2'>
          <p className='text-sm'>
            These <b><i>custom events</i></b> allow you to make this league unique!
            Anything and everything can be scored here, from speaking the first word of the
            episode to orchestrating a blindside. The possibilities are endless!
          </p>
          <p className='text-sm'>
            For most custom events you make, you will need to record the <i>result</i> during
            the episode yourself. Once the season starts, you will see a new tab on this page
            where you can score events as they happen.
          </p>
          <div>
            <p className='text-sm font-medium'>
              <b><i>Custom events</i></b> can be scored in two ways:
            </p>
            <ul className='ml-4 list-decimal text-sm'>
              <li><b>Direct</b>: Points awarded like the <b><i>base events</i></b> to the members whose pick
                scores the event.</li>
              <li><b>Prediction</b>: Points awarded to the members who correctly predict the outcome
                of the event. Predictions can be every episode or at specific times during the
                season.</li>
            </ul>
          </div>
        </div>
        {!disabled &&
          <Accordion
            type='single'
            collapsible
            defaultValue={customEventRules.length === 0 ? 'create' : ''}>
            <AccordionItem value='create'>
              <Form {...reactForm}>
                <form action={() => handleSubmit()}>
                  <AccordionTrigger className='items-baseline gap-2 justify-start'>
                    <h3 className='text-lg font-bold text-card-foreground'>Create a Custom Event</h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CustomEventFields>
                      <Button type='submit' className='ml-auto mt-auto'>Create Event</Button>
                    </CustomEventFields>
                  </AccordionContent>
                </form>
              </Form>
            </AccordionItem>
          </Accordion>}
        <br />
      </div>
      {customEventRules.length === 0 &&
        <h3 className='text-lg w-full text-center font-semibold text-card-foreground px-2 pb-2'>
          No custom events have been created yet.
        </h3>}

      <article className='grid grid-cols-2 gap-3 px-2'>
        {customEventRules.map((rule, index) => (
          <CustomEventCard key={index} rule={rule} />
        ))}
      </article>
    </article >
  );
}

/*
You can create your own or subscribe to events published by other leagues.
If you create your own, you will need to record when it happens during the episode
yourself. If you subscribe to an event, it will be automatically scored for you but
you will not be able to override or ignore if you {'don\'t'} agree with the scoring
from the event publisher.
*/

interface CustomEventFieldsProps {
  children?: ReactNode;
}

export function CustomEventFields({ children }: CustomEventFieldsProps) {
  const [isPrediction, setIsPrediction] = useState(false);

  const onTypeChange = (type: string) => {
    setIsPrediction(type === 'Prediction');
    return type;
  };

  return (
    <>
      <FormField
        name='eventName'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Name</FormLabel>
            <FormControl>
              <Input
                className='w-full text-black'
                type='text'
                placeholder='Enter the name of the event'
                {...field} />
            </FormControl>
            <FormDescription hidden>
              The name of the event that will be scored in this league.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                className='w-full text-black max-h-20'
                placeholder='Points awarded to...'
                {...field} />
            </FormControl>
            <FormDescription hidden>
              A description of the event that will be scored in this league.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      <span className='flex gap-4 items-center w-full'>
        <FormField
          name='points'
          render={({ field }) => (
            <FormItem className='w-1/3'>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input
                  className='w-full text-black'
                  type='number'
                  step={1}
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription hidden>
                Points awarded for this event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        <FormField
          name='type'
          render={({ field }) => (
            <FormItem className='w-2/3'>
              <FormLabel>Event Type</FormLabel>
              <FormControl>
                <Select
                  defaultValue={field.value as string}
                  value={field.value as string}
                  onValueChange={(value) => { onTypeChange(value); field.onChange(value); }} >
                  <SelectTrigger>
                    <SelectValue placeholder='Select event type' />
                  </SelectTrigger>
                  <SelectContent>
                    {LeagueEventTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription hidden>
                How this event will be scored.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
      </span>
      <span className='flex gap-4 items-center w-full'>
        <FormField
          name='timing'
          render={({ field }) => (
            <FormItem className={!isPrediction ? '!pointer-events-none w-full' : 'w-full'}>
              <FormLabel >Timing</FormLabel>
              <FormControl>
                <MultiSelect
                  options={LeaguePredictionTimingOptions
                    .map((option) => ({ label: option, value: option }))}
                  onValueChange={field.onChange}
                  defaultValue={field.value as string[]}
                  value={field.value as string[]}
                  disabled={!isPrediction}
                  empty={!isPrediction}
                  modalPopover
                  placeholder='Select prediction timing' />
              </FormControl>
              <FormDescription hidden>
                When this event will be scored.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        {children}
      </span>
    </>
  );
}

interface CustomEventCardProps {
  rule: LeagueEventRule;
}

function CustomEventCard({ rule }: CustomEventCardProps) {
  const {
    league: {
      leagueHash,
      members: {
        loggedIn
      }
    },
    refresh
  } = useLeague();
  const [isEditing, setIsEditing] = useState(false);

  const reactForm = useForm<LeagueEventRule>({
    defaultValues: rule,
    resolver: zodResolver(LeagueEventRuleZod),
  });

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await updateLeagueEventRule(leagueHash, data);
      await refresh();
      alert(`Custom event updated for league ${leagueHash}`);
    } catch (error) {
      console.error(error);
      alert('Failed to update custom event');
    }
  });

  const handleDelete = async () => {
    try {
      await deleteLeagueEventRule(leagueHash, rule.eventName);
      setIsEditing(false);
      alert(`Custom event deleted for league ${leagueHash}`);
    } catch (error) {
      console.error(error);
      alert('Failed to delete custom event');
    }
  };

  return (
    <article className='bg-b3 rounded-xl p-2 h-full relative max-h-40 select-none'>
      <span className='flex gap-1 items-center mr-8'>
        <h3 className='text-lg font-semibold text-card-foreground text-nowrap'>{rule.eventName}</h3>
        -
        <div className='inline-flex items-center'>
          <p className='text-sm'>{rule.points}</p>
          <Flame size={16} />
        </div>
      </span>
      {rule.eventType === 'Prediction' &&
        <p className='text-xs italic mb-1'>Predictions: {rule.timing.join(', ')}</p>}
      <p className='text-sm'>{rule.description}</p>
      {loggedIn && loggedIn.role === 'Owner' &&
        <Form {...reactForm}>
          <form action={() => handleSubmit()}>
            <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
              <AlertDialogTrigger asChild>
                <Settings2 className='absolute top-2 right-2 cursor-pointer' size={18} />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className='flex justify-between'>
                    {rule.eventName}
                    <form action={() => handleDelete()}>
                      <Button type='submit' variant='destructive'>Delete Event</Button>
                    </form>
                  </AlertDialogTitle>
                  <AlertDialogDescription hidden>
                    Edit the event details or delete the event.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <CustomEventFields />
                <AlertDialogFooter className='grid grid-cols-2 gap-2'>
                  <AlertDialogCancel variant='secondary'>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    {/* Not sure why the form action isn't working */}
                    <Button onClick={() => handleSubmit()} type='submit'>Save Changes</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        </Form>
      }
    </article >
  );
}
