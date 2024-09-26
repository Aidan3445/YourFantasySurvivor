'use client';
import { type ComponentProps } from '~/lib/utils';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { type CustomEventRuleType } from '~/server/db/schema/customEvents';
import { type Member } from '~/server/db/schema/members';
import { type Tribe } from '~/server/db/schema/tribes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { useState } from 'react';
import { type AltEvents } from '~/app/api/leagues/[id]/score/query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '~/app/_components/commonUI/form';
import { SelectCastaways } from '~/app/_components/selectSeason';
import { Button } from '~/app/_components/commonUI/button';
import { Trash2 } from 'lucide-react';

interface NewEventProps extends ComponentProps {
  rules: CustomEventRuleType[];
  events: AltEvents | null;
  leagueId: number;
  castaways: CastawayDetails[];
  tribes: Tribe[];
  members: Member[];
  remaining: CastawayDetails[];
}

const newCustomEventSchema = z.object({
  ruleId: z.number(),
  referenceType: z.enum(['castaway', 'tribe', 'member']),
  episodeId: z.number(),
  references: z.array(z.string().or(z.undefined())),
});


export default function NewCustomEvent({
  rules,
  events,
  //leagueId,
  castaways,
  tribes,
  members,
  remaining,
}: NewEventProps) {
  const [selectedRule, setSelectedRule] = useState<CustomEventRuleType | null>(null);
  const form = useForm<z.infer<typeof newCustomEventSchema>>({
    defaultValues: {
      references: [],
    },
    resolver: zodResolver(newCustomEventSchema),
  });

  const getRuleById = (id: string) => {
    const idNum = parseInt(id);
    const rule = rules.find((r) => r.id === idNum);
    if (!rule) return;
    setSelectedRule(rule ?? null);
    form.setValue('referenceType', rule.referenceType);
  };

  console.log(form.watch('references'), 'refs');
  const refs = form.watch('references');

  return (
    <section className='flex flex-col gap-6'>
      <Form {...form}>
        <form className='flex flex-col gap-2 justify-center'>
          <FormField name='ruleId' render={({ field }) => (
            <FormItem>
              <Select onValueChange={getRuleById} {...field}>
                <SelectTrigger>
                  <SelectValue placeholder='Select rule' />
                </SelectTrigger>
                <SelectContent>
                  {rules.map((rule) => (
                    <SelectItem value={rule.id!.toString()} key={rule.id}> {rule.name} </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )} />
          {selectedRule && (
            <article className='bg-b3/80 rounded-md p-2 flex flex-col gap-3'>
              <div>
                <h3 className='text-xl font-semibold'>{selectedRule.name}</h3>
                <p>{selectedRule.description}</p>
              </div>
              <div className='flex flex-col justify-center gap-2'>
                {refs.map((name, index) => (
                  <span className='flex justify-between items-center' key={name}>
                    <FormField name={`referenceIds[${index}]`} render={({ field }) => {
                      console.log(name, 'name');
                      switch (selectedRule.referenceType) {
                        case 'castaway':
                          return (
                            <FormControl>
                              <SelectCastaways
                                castaways={remaining}
                                field={field} />
                            </FormControl>
                          );
                        case 'tribe':
                          return <div>SELECT TRIBE</div>;
                        case 'member':
                          return <div>SELECT MEMBER</div>;
                        default:
                          return <div>SELECT SOMETHING</div>;
                      }
                    }} />
                    <Trash2 size={24} onClick={() => form.setValue('references',
                      refs.filter((_, i) => i !== index))} />
                  </span>
                ))}
              </div>
              <Button
                type='button'
                onClick={() => form.setValue('references', [...refs, undefined])}>
                Add {selectedRule.referenceType}
              </Button>
            </article>)}
        </form>
      </Form>
      {events && <article>
        <h2 className='text-xl font-semibold'>Current events</h2>
        {(events.castawayEvents?.length ?? 0) > 0 && <h2>Castaway events</h2>}
        {events.castawayEvents.map((e) => (
          <article key={e.name} className='bg-b3/80 rounded-md'>
            <h3 className='text-xl font-semibold'>{e.name}</h3>
            <p>{e.description}</p>
            <p>Castaway: {e.castaway}</p>
            <p>Episode: {e.episode}</p>
          </article>))}
        {(events.tribeEvents?.length ?? 0) > 0 && <h2>Tribe events</h2>}
        {events.tribeEvents.map((e) => (
          <article key={e.name} className='bg-b3/80 rounded-md'>
            <h3 className='text-xl font-semibold'>{e.name}</h3>
            <p>{e.description}</p>
            <p>Tribe: {e.tribe}</p>
            <p>Episode: {e.episode}</p>
          </article>))}
        {(events.memberEvents?.length ?? 0) > 0 && <h2>Member events</h2>}
        {events.memberEvents.map((e) => (
          <article key={e.name} className='bg-b3/80 rounded-md'>
            <h3 className='text-xl font-semibold'>{e.name}</h3>
            <p>{e.description}</p>
            <p>Member: {e.member}</p>
            <p>Episode: {e.episode}</p>
          </article>))}
      </article>}
    </section>
  );
}
