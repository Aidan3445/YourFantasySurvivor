'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '~/components/common/form';
import { useLeague } from '~/hooks/leagues/useLeague';
import { Button } from '~/components/common/button';
import { Lock, LockOpen } from 'lucide-react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { useState } from 'react';
import LeagueEventFields from '~/components/leagues/customization/events/custom/fields';
import LeagueEventCard from '~/components/leagues/customization/events/custom/card';
import { useQueryClient } from '@tanstack/react-query';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { type CustomEventRuleInsert, CustomEventRuleInsertZod } from '~/types/leagues';
import { defaultNewCustomRule } from '~/lib/leagues';
import createCustomEventRule from '~/actions/createCustomEventRule';
import { useLeagueRules } from '~/hooks/leagues/useRules';

export default function CustomEvents() {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: rules } = useLeagueRules();
  const { data: leagueMembers } = useLeagueMembers();

  const reactForm = useForm<CustomEventRuleInsert>({
    defaultValues: defaultNewCustomRule,
    resolver: zodResolver(CustomEventRuleInsertZod)
  });
  const [locked, setLocked] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;

    try {
      await createCustomEventRule(league.hash, data);
      await queryClient.invalidateQueries({ queryKey: ['rules', league.hash] });
      alert(`Custom event ${data.eventName} created.`);
      reactForm.reset();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to create custom event');
    }
  });

  const disabled = (!!leagueMembers?.loggedIn && leagueMembers.loggedIn.role !== 'Owner') || league?.status === 'Inactive';

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
                <LeagueEventFields predictionDefault={reactForm.watch('eventType') === 'Prediction'} />
                <AlertDialogFooter>
                  <AlertDialogCancel variant='secondary'>Cancel</AlertDialogCancel>
                  <Button type='submit' onClick={() => handleSubmit()}>Create Event</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </form>
          </Form>
        </AlertDialog>}
      {
        rules?.custom?.length ?
          <article className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
            {rules?.custom.map((rule, index) => (
              <LeagueEventCard key={index} rule={rule} locked={disabled || locked} />
            ))}
          </article>
          :
          <h3 className='text-lg w-full text-center font-semibold text-card-foreground px-2 pb-2'>
            No custom events have been created yet.
          </h3>
      }
    </article >
  );
}
