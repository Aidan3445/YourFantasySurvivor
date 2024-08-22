'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/app/_components/commonUI/button';
import { Form } from '~/app/_components/commonUI/form';
import { TabsContent } from '~/app/_components/commonUI/tabs';
import { AdminEventRule, type AdminEventRuleType } from '~/server/db/schema/adminEvents';
import { BaseEventRule, type BaseEventRuleType, defaultBaseRules } from '~/server/db/schema/leagues';
import { PredictionEventRule, type PredictionEventRuleType } from '~/server/db/schema/predictions';
import { WeeklyEventRule, type WeeklyEventRuleType } from '~/server/db/schema/weeklyEvents';
import CustomEvents from './customEvents';
import BaseEvents from './baseEvents';
import { type ComponentProps } from '~/lib/utils';
import WeeklyEvents from './weeklyEvents';

interface EventsFormProps {
  className?: string;
  leagueId: number;
  rules: BaseEventRuleType & {
    admin: AdminEventRuleType[];
    weekly: WeeklyEventRuleType[];
    season: PredictionEventRuleType[];
  };
  ownerLoggedIn: boolean;
}

export const eventSchema = z.intersection(
  BaseEventRule,
  z.object({
    admin: z.array(AdminEventRule),
    weekly: z.array(WeeklyEventRule),
    season: z.array(PredictionEventRule),
  }));

export default function EventsForm({ className, leagueId, rules }: EventsFormProps) {
  // merge default rules with provided rules
  // any unspecified rules will use defaults
  const defaultRules = {
    ...defaultBaseRules(),
    ...rules
  };


  const form = useForm<z.infer<typeof eventSchema>>({
    defaultValues: defaultRules,
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = form.handleSubmit((data: z.infer<typeof eventSchema>) => {
    console.log(data);
  });

  useEffect(() => {
    async function submitOnLoad() {
      console.log('SUBMITTING', leagueId);
      console.log('FORM', form.getValues());
    }

    submitOnLoad().catch(console.error);
  }, [leagueId, form]);


  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className={className}>
        <Tab value='base'>
          <BaseEvents className='col-span-3 row-span-2' form={form} />
          <article className='col-span-2'>
            <h3 className='font-semibold text-lg'>Base Events</h3>
            Base events are added automatically when they
            occur in an episode. <br />
            You can customize the points each event is worth. <br /><p className='italic text-sm'>
              If you disagree with the automatic event,
              you can override it in the score entry page.</p>
          </article>
        </Tab>
        <Tab value='custom'>
          <CustomEvents className='col-span-3 row-span-2' form={form} />
          <article className='col-span-2'>
            <h3 className='font-semibold text-lg'>Custom Events</h3>
            Custom events are added manually by a league admin.
            They all you to score events not included on the base events list. <br />
            Use one of our examples or create your own.
          </article>
        </Tab>
        <Tab value='weekly'>
          <WeeklyEvents className='col-span-3 row-span-2' form={form} />
          <article className='col-span-2'>
            <h3 className='font-semibold text-lg'>Weekly Events</h3>
            League members can earn points through weekly events,
            even if their castaway is eliminated. <br />
            There are two types of weekly events:
            <ul className='list-disc pl-4 light-scroll h-40'>
              <li>
                <h3 className='font-semibold inline'>Votes</h3>:
                After each episode, members vote on specific events.
                Points are awarded to those who receive the most votes.</li>
              <li>
                <h3 className='font-semibold inline'>Predictions</h3>:
                Before an episode airs, members predict upcoming events.
                Correct predictions earn points. <br /> <p className='italic text-sm'>
                  Predictions can be tied to other events and poins will be earned for each
                  event that matches the prediction in the next episode.</p></li>
            </ul>
          </article>
        </Tab>
        <Tab value='season'>
          <article>
            SEASON EVENTS
          </article>
          <article>
            Season events are special predictions members make only once.
            They can be made before the season starts, after the merge,
            or after a specific episode. <br /> <p className='italic text-sm'>
              Predictions can be tied to other events and poins will be earned for each
              event that matches the prediction for all subsequent episodes.</p>
          </article>
        </Tab>
      </form>
    </Form>
  );
}

interface TabProps {
  value: string;
  children: ReactNode;
}

function Tab({ children, value }: TabProps) {
  return (
    <TabsContent value={value}>
      <section className='grid grid-cols-5 gap-2 max-w-screen-sm'>
        {children}
        <Button className='row-start-2 col-start-5 mt-auto mb-4' type='submit'>Save</Button>
      </section>
    </TabsContent>
  );
}

export interface EventsProps extends ComponentProps {
  form: UseFormReturn<z.infer<typeof eventSchema>>;
}
