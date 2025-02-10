'use client';

import { z } from 'zod';
import { BaseEventRule } from '~/server/db/defs/baseEvents';
import { useForm } from 'react-hook-form';
import { useLeague } from '~/hooks/useLeague';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../ui/form';
import { BaseEventRuleTabs } from './createLeague';
import { Button } from '../ui/button';

const formSchema = z.object({
  baseEventRules: BaseEventRule
});

export default function LeagueScoring() {
  const {
    league: {
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

  return (
    <article className='p-2 bg-card rounded-xl'>
      <h2 className='text-lg font-bold text-card-foreground'>Scoring</h2>
      <Form {...reactForm}>
        <form>
          <BaseEventRuleTabs rightSide={
            <section className='flex flex-col gap-2 mt-2'>
              <h3 className='text-lg font-bold text-card-foreground'>Customizing Base Events</h3>
              <p className='text-sm'>These <i>base events</i> will be automatically scored for your league
                based on the events of each episode. Set the point values for each event
                that will be awarded to the member whose current pick scores the event.
              </p>
              <p className='text-sm'>For example, if you set the <i>Individual Immunity</i> event to 5 points, the member
                whose pick wins immunity will receive 5 points.
                If you set the <i>Tribe 1st Place</i> event to 3 points, then every member whose pick
                is on the winning tribe will receive 3 points.
              </p>
              {loggedIn?.role !== 'member' && <Button type='submit' className='w-full'>Save</Button>}
            </section>} />
        </form>
      </Form>
    </article >
  );
}
