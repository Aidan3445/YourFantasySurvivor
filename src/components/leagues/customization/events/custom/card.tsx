'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { Settings2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { useState } from 'react';
import { cn } from '~/lib/utils';
import LeagueEventFields from '~/components/leagues/customization/events/custom/fields';
import { type CustomEventRuleInsert, CustomEventRuleInsertZod, type CustomEventRule } from '~/types/leagues';
import { useQueryClient } from '@tanstack/react-query';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import updateCustomEventRule from '~/actions/updateCustomEventRule';
import deleteCustomEventRule from '~/actions/deleteCustomEventRule';
import { PointsIcon } from '~/components/icons/generated';

interface LeagueEventCardProps {
  rule: CustomEventRule;
  locked?: boolean;
}

export default function LeagueEventCard({ rule, locked }: LeagueEventCardProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: leagueMembers } = useLeagueMembers();

  const [isEditing, setIsEditing] = useState(false);

  const reactForm = useForm<CustomEventRuleInsert>({
    defaultValues: rule,
    resolver: zodResolver(CustomEventRuleInsertZod),
  });

  const isPrediction = reactForm.watch('eventType') === 'Prediction';

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league) return;

    try {
      await updateCustomEventRule(league.hash, data, rule.customEventRuleId);
      await queryClient.invalidateQueries({ queryKey: ['rules', league.hash] });
      setIsEditing(false);
      alert(`Custom event ${data.eventName} updated.`);
    } catch (error) {
      console.error(error);
      alert('Failed to update custom event');
    }
  });

  const handleDelete = async () => {
    if (!league) return;
    try {
      await deleteCustomEventRule(league.hash, rule.customEventRuleId);
      await queryClient.invalidateQueries({ queryKey: ['rules', league.hash] });
      setIsEditing(false);
      alert(`Custom event ${rule.eventName} deleted.`);
    } catch (error) {
      console.error(error);
      alert('Failed to delete custom event');
    }
  };

  return (
    <article className={cn(
      'rounded-lg p-3 h-full relative max-h-40 select-none border-2 border-primary/20 shadow-lg shadow-primary/10',
      locked ? 'bg-accent border-primary/20' : 'bg-primary/5 border-primary/30')}>
      <span className='flex gap-2 items-center mr-10'>
        <h3 className='text-base font-bold uppercase tracking-wider text-nowrap'>{rule.eventName}</h3>
        <span className='text-muted-foreground'>•</span>
        <div className='inline-flex items-center'>
          <p className={cn(
            'text-sm font-bold',
            rule.points <= 0 ? 'text-destructive' : 'text-green-700')}>
            {rule.points}
          </p>
          <PointsIcon className={cn(
            'w-3 h-3 shrink-0',
            rule.points <= 0 ? 'fill-destructive' : 'fill-green-700'
          )} />
        </div>
      </span>
      {rule.eventType === 'Prediction' &&
        <p className='text-xs italic mb-1 font-medium text-muted-foreground'>Predictions: {rule.timing.join(', ')}</p>}
      <p className='text-sm'>{rule.description}</p>
      {leagueMembers?.loggedIn?.role === 'Owner' && !locked &&
        <Form {...reactForm}>
          <form action={() => handleSubmit()}>
            <AlertDialog open={isEditing} onOpenChange={setIsEditing}>
              <AlertDialogTrigger asChild>
                <Settings2 className='absolute top-3 right-3 w-5 h-5 shrink-0 cursor-pointer text-primary hover:text-primary/70 active:text-primary/50 transition-colors' />
              </AlertDialogTrigger>
              <AlertDialogContent className='border-2 border-primary/30 shadow-lg shadow-primary/20'>
                <AlertDialogHeader>
                  <span className='flex items-center justify-between'>
                    <span className='flex items-center gap-3'>
                      <span className='h-6 w-1 bg-primary rounded-full' />
                      <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
                        {rule.eventName}
                      </AlertDialogTitle>
                    </span>
                    <form action={() => handleDelete()}>
                      <Button type='submit' variant='destructive' className='font-bold uppercase text-xs tracking-wider'>
                        Delete Event
                      </Button>
                    </form>
                  </span>
                  <AlertDialogDescription className='sr-only'>
                    Edit the event details or delete the event.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <LeagueEventFields isPrediction={isPrediction} />
                <AlertDialogFooter className='grid grid-cols-2 gap-2'>
                  <AlertDialogCancel variant='secondary' className='font-bold uppercase text-xs tracking-wider'>
                    Cancel
                  </AlertDialogCancel>
                  {/* Not sure why the form action isn't working */}
                  <Button
                    type='submit'
                    className='font-bold uppercase text-xs tracking-wider'
                    onClick={() => {
                      if (CustomEventRuleInsertZod.safeParse(reactForm.getValues()).success) {
                        void handleSubmit();
                      } else {
                        void reactForm.trigger();
                      }
                    }}>
                    Save Changes
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        </Form>
      }
    </article >
  );
}

