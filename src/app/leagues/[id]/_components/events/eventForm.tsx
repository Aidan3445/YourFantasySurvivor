'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { Button } from '~/app/_components/commonUI/button';
import { Form } from '~/app/_components/commonUI/form';
import { TabsContent } from '~/app/_components/commonUI/tabs';
import CustomEvents from './customEvents';
import BaseEvents from './baseEvents';
import { type ComponentProps } from '~/lib/utils';
import WeeklyEvents from './weeklyEvents';
import { Rules, type RulesType } from '~/server/db/schema/rules';
import { defaultBaseRules } from '~/server/db/schema/leagues';
import SeasonEvents from './seasonEvents';
import { updateRules } from '~/app/api/leagues/[id]/rules/actions';
import { useToast } from '~/app/_components/commonUI/use-toast';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface EventsFormProps {
  className?: string;
  leagueId: number;
  rules: RulesType;
  ownerLoggedIn: boolean;
}

export default function EventsForm({ className, leagueId, rules, ownerLoggedIn }: EventsFormProps) {
  // merge default rules with provided rules
  // any unspecified rules will use defaults
  const defaultRules = {
    ...defaultBaseRules(),
    ...rules
  };

  const form = useForm<RulesType>({
    defaultValues: defaultRules,
    resolver: zodResolver(Rules),
  });
  const router = useRouter();
  const { toast } = useToast();

  const [valid, setValid] = useState(true);
  const [unsaved, setUnsaved] = useState(false);

  const catchUpdate = () => {
    const update = updateRules.bind(null, leagueId, form.getValues());
    update()
      .then((res) => {
        toast({
          title: 'League updated',
          description: 'The league rules have been saved',
        });

        // update the form with the new rules
        form.reset(res);
        setUnsaved(false);
        router.refresh();
      })
      .catch((e) => {
        if (e instanceof Error) {
          toast({
            title: 'Error updating league rules',
            description: e.message,
            variant: 'error',
          });
        }
      });
  };

  const watch = form.watch();
  const unsave = () => setUnsaved(true);

  useEffect(() => {
    try {
      Rules.parse(form.getValues());
      setValid(true);
    } catch (e) {
      setValid(false);
    }
  }, [form, watch, rules]);

  return (
    <Form {...form}>
      <form className={className} action={catchUpdate} onChange={() => setUnsaved(true)}>
        <Tab value='base' valid={valid} unsaved={unsaved} ownerLoggedIn={ownerLoggedIn}>
          <BaseEvents className='col-span-3 row-span-2' form={form} freeze={!ownerLoggedIn} />
          <article className='col-span-2 hidden lg:block'>
            <h3 className='font-semibold text-lg'>Base Events</h3>
            Base events are added automatically when they
            occur in an episode. <br />
            You can customize the points each event is worth. <br /><p className='italic text-sm'>
              If you disagree with the automatic event,
              you can override it in the score entry page.</p>
          </article>
        </Tab>
        <Tab value='custom' valid={valid} unsaved={unsaved} ownerLoggedIn={ownerLoggedIn}>
          <CustomEvents className='col-span-3 row-span-2' form={form} freeze={!ownerLoggedIn} setUnsaved={unsave} />
          <article className='col-span-2 hidden lg:block'>
            <h3 className='font-semibold text-lg'>Custom Events</h3>
            Custom events are added manually by a league admin.
            They all you to score events not included on the base events list. <br />
            Use one of our examples or create your own.
          </article>
        </Tab>
        <Tab value='weekly' valid={valid} unsaved={unsaved} ownerLoggedIn={ownerLoggedIn}>
          <WeeklyEvents className='col-span-3 row-span-2' form={form} freeze={!ownerLoggedIn} setUnsaved={unsave} />
          <article className='col-span-2 hidden lg:block'>
            <h3 className='font-semibold text-lg'>Weekly Events</h3>
            League members can earn points through weekly events,
            even if their castaway is eliminated. <br />
            There are two types of weekly events:
            <ul className='list-disc pl-4 light-scroll h-40 text-sm'>
              <li>
                <h3 className='font-semibold inline'>Votes</h3>:
                After each episode, members vote on specific events.
                Points are awarded to those who receive the most votes.</li>
              <li>
                <h3 className='font-semibold inline'>Predictions</h3>:
                Before an episode airs, members predict upcoming events.
                Correct predictions earn points. <br /> <p className='italic'>
                  Predictions can be tied to other events and poins will be earned for each
                  event that matches the prediction in the next episode.</p></li>
            </ul>
          </article>
        </Tab>
        <Tab value='season' valid={valid} unsaved={unsaved} ownerLoggedIn={ownerLoggedIn}>
          <SeasonEvents className='col-span-3 row-span-2' form={form} freeze={!ownerLoggedIn} setUnsaved={unsave} />
          <article className='col-span-2 hidden lg:block'>
            Season events are special predictions members make only once.
            They can be made before the season starts, after the merge,
            or before the final episode of the season. <br /> <p className='italic text-sm'>
              Predictions can be tied to other events and poins will be earned for each
              event that matches the prediction for all subsequent episodes.</p>
          </article>
        </Tab>
      </form>
    </Form >
  );
}

interface TabProps {
  children: ReactNode;
  value: string;
  valid: boolean;
  unsaved: boolean;
  ownerLoggedIn: boolean;
}

function Tab({ children, value, valid, unsaved, ownerLoggedIn }: TabProps) {
  return (
    <TabsContent value={value}>
      <section className='md:grid md:grid-cols-5 gap-2 md:max-w-screen-sm'>
        {children}
        {ownerLoggedIn ?
          <div className='row-start-2 col-start-5 flex flex-col gap-2 mt-auto mb-4 text-center'>
            {unsaved && <p className='text-red-900 text-sm font-semibold'>Unsaved Changes</p>}
            <Button disabled={!valid} type='submit'>Save</Button>
          </div> :
          <h3 className='row-start-2 col-start-4 col-span-2 italic text-sm mt-auto mb-4'>Only the owner can edit league rules</h3>}
      </section>
    </TabsContent >
  );
}

export interface EventsProps extends ComponentProps {
  form: UseFormReturn<RulesType>;
  freeze: boolean;
  setUnsaved?: () => void;
}

