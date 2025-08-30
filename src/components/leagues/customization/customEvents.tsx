'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { useLeague } from '~/hooks/useLeague';
import {
  type LeagueEventRule, LeagueEventRuleZod, LeagueEventTypeOptions,
  PredictionTimingOptions, ReferenceOptions, defaultLeagueEventRule
} from '~/server/db/defs/events';
import { Input } from '~/components/common/input';
import { Textarea } from '~/components/common/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { MultiSelect } from '~/components/common/multiSelect';
import { Button } from '~/components/common/button';
import { createLeagueEventRule, deleteLeagueEventRule, updateLeagueEventRule } from '~/app/api/leagues/actions';
import { Flame, Lock, LockOpen, Settings2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { type ReactNode, useState } from 'react';
import { cn } from '~/lib/utils';
import { PredictionTimingHelp } from '~/components/leagues/draft/makePredictions';

export default function CustomEvents() {
  const {
    league: {
      leagueHash,
      customEventRules,
      members: {
        loggedIn
      }
    },
    refresh
  } = useLeague();

  const reactForm = useForm<LeagueEventRule>({
    defaultValues: defaultLeagueEventRule,
    resolver: zodResolver(LeagueEventRuleZod),
  });
  const [locked, setLocked] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    const newRule: LeagueEventRule = {
      ...data,
      timing: data.eventType === 'Prediction' ? data.timing : [],
    };

    try {
      await createLeagueEventRule(leagueHash, newRule);
      await refresh();
      alert(`Custom event ${newRule.eventName} created.`);
      reactForm.reset();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to create custom event');
    }
  });

  const disabled = loggedIn?.role !== 'Owner';

  return (
    <article className='bg-card p-2 rounded-xl w-full relative space-y-2'>
      {!disabled && (locked ?
        <Lock
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => setLocked(false)} /> :
        <LockOpen
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => { setLocked(true); reactForm.reset(); }} />)}
      <div>
        <h2 className='text-lg font-bold text-card-foreground'>Custom Events</h2>
        <div className='flex flex-col gap-2'>
          <p className='text-sm mr-12 max-w-4xl'>
            These <i>Custom Events</i> let you make your league truly unique!
            Anything can be scored—from speaking the first word of the episode to orchestrating a blindside.
            <br />
            The possibilities are endless!
          </p>
          <p className='text-sm mr-12 max-w-4xl'>
            Custom events require manual scoring. Once your league drafts, you’ll see a new
            tab on this page where you can score, edit and delete custom events during the season.
          </p>
          <div>
            <p className='text-sm'>
              <i>Custom Events</i> can be scored in two ways:
            </p>
            <ul className='ml-4 list-decimal text-sm max-w-4xl'>
              <li><b>Direct</b>: Points are awarded like <i>Official Events</i>, based on a player’s pick.</li>
              <li><b>Prediction</b>: Points are awarded to members who correctly predict an event’s outcome.
                Predictions can be made before each episode or at specific times throughout the season.
              </li>
            </ul>
          </div>
        </div>
      </div>
      {!(disabled || locked) &&
        <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
          <Form {...reactForm}>
            <form action={() => handleSubmit()}>
              <AlertDialogTrigger asChild>
                <Button>Create Custom Event</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create a Custom Event</AlertDialogTitle>
                  <AlertDialogDescription className='sr-only'>
                    Create a custom event to score in your league.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <CustomEventFields predictionDefault={reactForm.watch('eventType') === 'Prediction'} />
                <AlertDialogFooter>
                  <AlertDialogCancel variant='secondary'>Cancel</AlertDialogCancel>
                  <Button type='submit' onClick={() => handleSubmit()}>Create Event</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </form>
          </Form>
        </AlertDialog>}
      {
        customEventRules.length === 0 &&
        <h3 className='text-lg w-full text-center font-semibold text-card-foreground px-2 pb-2'>
          No custom events have been created yet.
        </h3>
      }
      <article className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
        {customEventRules.map((rule, index) => (
          <CustomEventCard key={index} rule={rule} locked={disabled || locked} />
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
  predictionDefault?: boolean;
  children?: ReactNode;
}

export function CustomEventFields({ predictionDefault, children }: CustomEventFieldsProps) {
  const [isPrediction, setIsPrediction] = useState(predictionDefault ?? false);

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
            <FormDescription className='sr-only'>
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
            <FormDescription className='sr-only'>
              A description of the event that will be scored in this league.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='referenceTypes'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel>Reference Type</FormLabel>
            <FormControl>
              <MultiSelect
                options={ReferenceOptions
                  .map((option) => ({ label: option, value: option }))}
                onValueChange={field.onChange}
                defaultValue={field.value as string[]}
                value={field.value as string[]}
                modalPopover
                placeholder='Select reference types' />
            </FormControl>
            <FormDescription className='sr-only'>
              Does this event reference a castaway or tribe or either?
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
              <FormDescription className='sr-only'>
                Points awarded for this event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        <FormField
          name='eventType'
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
              <FormDescription className='sr-only'>
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
            <FormItem className={!isPrediction ? 'pointer-events-none! w-full' : 'w-full'}>
              <FormLabel className='flex items-center gap-1'>
                Timing
                <PredictionTimingHelp />
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={PredictionTimingOptions
                    .map((option) => ({ label: option, value: option }))}
                  onValueChange={field.onChange}
                  defaultValue={field.value as string[]}
                  value={field.value as string[]}
                  disabled={!isPrediction}
                  empty={!isPrediction}
                  modalPopover
                  placeholder='Select prediction timing' />
              </FormControl>
              <FormDescription className='sr-only'>
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
  locked?: boolean;
}

function CustomEventCard({ rule, locked }: CustomEventCardProps) {
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
      alert(`Custom event ${data.eventName} updated.`);
    } catch (error) {
      console.error(error);
      alert('Failed to update custom event');
    }
  });

  const handleDelete = async () => {
    try {
      await deleteLeagueEventRule(leagueHash, rule.eventName);
      setIsEditing(false);
      alert(`Custom event ${rule.eventName} deleted.`);
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
        <div className='inline-flex'>
          <p className={cn(
            'text-sm',
            rule.points <= 0 ? 'text-destructive' : 'text-green-600')}>
            {rule.points}
          </p>
          <Flame className={rule.points <= 0 ? 'stroke-destructive' : 'stroke-green-600'} size={16} />
        </div>
      </span>
      {rule.eventType === 'Prediction' &&
        <p className='text-xs italic mb-1'>Predictions: {rule.timing.join(', ')}</p>}
      <p className='text-sm'>{rule.description}</p>
      {loggedIn && loggedIn.role === 'Owner' && !locked &&
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
                  <AlertDialogDescription className='sr-only'>
                    Edit the event details or delete the event.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <CustomEventFields predictionDefault={rule.eventType === 'Prediction'} />
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
