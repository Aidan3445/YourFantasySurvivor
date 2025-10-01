'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { Flame, Settings2 } from 'lucide-react';
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
      {leagueMembers?.loggedIn && leagueMembers.loggedIn.role === 'Owner' && !locked &&
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
                <LeagueEventFields predictionDefault={rule.eventType === 'Prediction'} />
                <AlertDialogFooter className='grid grid-cols-2 gap-2'>
                  <AlertDialogCancel variant='secondary'>Cancel</AlertDialogCancel>
                  {/* Not sure why the form action isn't working */}
                  <Button
                    type='submit'
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

