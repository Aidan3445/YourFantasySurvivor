'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '~/components/common/form';
import { useLeague } from '~/hooks/useLeague';
import { type LeagueEventRule, LeagueEventRuleZod } from '~/types/events';

import { Button } from '~/components/common/button';
import { deleteLeagueEventRule, updateLeagueEventRule } from '~/services/deprecated/leagueActions';
import { Flame, Settings2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { useState } from 'react';
import { cn } from '~/lib/utils';
import LeagueEventFields from '~/components/leagues/customization/events/custom/fields';

interface LeagueEventCardProps {
  rule: LeagueEventRule;
  locked?: boolean;
}

export default function LeagueEventCard({ rule, locked }: LeagueEventCardProps) {
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
                <LeagueEventFields predictionDefault={rule.eventType === 'Prediction'} />
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

