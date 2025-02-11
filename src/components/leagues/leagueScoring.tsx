'use client';

import { z } from 'zod';
import { BaseEventRuleZod } from '~/server/db/defs/events';
import { useForm } from 'react-hook-form';
import { useLeague } from '~/hooks/useLeague';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../ui/form';
import { BaseEventRuleTabs } from './createLeague';
import { Button } from '../ui/button';
import { updateBaseEventRules } from '~/app/api/leagues/actions';

const formSchema = z.object({
  baseEventRules: BaseEventRuleZod
});

export default function LeagueScoring() {
  const {
    league: {
      leagueHash,
      baseEventRules,
      members: {
        loggedIn
      }
    }
  } = useLeague();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: { baseEventRules },
    resolver: zodResolver(formSchema)
  });

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await updateBaseEventRules(leagueHash, data.baseEventRules);
      alert(`Base event rules updated for league ${leagueHash}`);
    } catch (error) {
      console.error(error);
      alert('Failed to update base event rules');
    }
  });

  return (
    <article className='p-2 bg-card rounded-xl w-full'>
      <h2 className='text-lg font-bold text-card-foreground'>Base Events</h2>
      <Form {...reactForm}>
        <form action={() => handleSubmit()}>
          <BaseEventRuleTabs rightSide={
            <section className='flex flex-col gap-2 mt-2'>
              <h3 className='text-lg font-bold text-card-foreground'>Customizing Base Events</h3>
              <p className='text-sm'>These <b><i>base events</i></b> will be automatically scored
                for your league based on the events of each episode. Set the point values for each
                event that will be awarded to the member whose current <i>survivor</i> scores the event.
              </p>
              <p className='text-sm'>For example, if you set the <i>Individual Immunity</i> event
                to 5 points, the member whose pick wins immunity will receive 5 points.
                If you set the <i>Tribe 1st Place</i> event to 3 points, then every member whose
                pick is on the winning tribe will receive 3 points.
              </p>
              {loggedIn?.role === 'Owner' && (
                <span className='flex gap-2'>
                  <Button type='submit' className='w-1/2'>Save</Button>
                  <Button
                    type='button'
                    variant='destructive'
                    className='w-1/2'
                    onClick={() => reactForm.reset()}>
                    Reset
                  </Button>
                </span>)}
            </section>} />
        </form>
      </Form>
    </article >
  );
}
