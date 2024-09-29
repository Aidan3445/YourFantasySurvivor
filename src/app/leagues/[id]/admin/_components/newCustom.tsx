'use client';
import { type ComponentProps } from '~/lib/utils';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { type CustomEventRuleType } from '~/server/db/schema/customEvents';
import { type Member } from '~/server/db/schema/members';
import { type Tribe } from '~/server/db/schema/tribes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { type ChangeEvent, useEffect, useState } from 'react';
import { type AltEvents } from '~/app/api/leagues/[id]/score/query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '~/app/_components/commonUI/form';
import { SelectCastaways, SelectMembers, SelectTribes } from '~/app/_components/selectSeason';
import { Button } from '~/app/_components/commonUI/button';
import { Switch } from '~/app/_components/commonUI/switch';
import { useToast } from '~/app/_components/commonUI/use-toast';
import { submitCustomEvent } from '~/app/api/leagues/[id]/score/actions';
/*import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import { NotepadText } from 'lucide-react';
import { Textarea } from '~/app/_components/commonUI/textArea';
import CardContainer from '~/app/_components/cardContainer';*/

interface NewEventProps extends ComponentProps {
  rules: CustomEventRuleType[];
  events: AltEvents | null;
  leagueId: number;
  castaways: CastawayDetails[];
  tribes: Tribe[];
  members: Member[];
  remaining: CastawayDetails[];
  episodes: [{ id: number; title: string, number: number, airDate: string }];
}

const newCustomEventSchema = z.object({
  ruleId: z.number(),
  episodeId: z.string(),
  references: z.array(z.string().or(z.undefined())).refine((refs) => {
    if (refs.length === 0) return false;
    if (refs.findIndex((ref) => ref === undefined) !== -1) return false;
    return true;
  }),
  /*notes: z.object({
    reference: z.string().nullable(),
    note: z.string(),
  }).array(),*/
});

export default function NewCustomEvent({
  rules,
  events,
  leagueId,
  castaways,
  tribes,
  members,
  remaining,
  episodes,
}: NewEventProps) {
  const [selectedRule, setSelectedRule] = useState<CustomEventRuleType | null>(null);
  const [remainingOnly, setRemainingOnly] = useState(true);

  const form = useForm<z.infer<typeof newCustomEventSchema>>({
    defaultValues: {
      references: [],
      //notes: [],
      episodeId: episodes[0].id.toString(),
    },
    resolver: zodResolver(newCustomEventSchema),
  });

  const { toast } = useToast();

  const refs = form.watch('references');

  useEffect(() => {
    form.setValue('references', [undefined]);
  }, [form]);

  if (rules.length === 0) return (
    <h3 className='text-xl font-semibold'>This leagues has no custom event rules</h3>
  );

  const getRuleById = (id: string) => {
    const idNum = parseInt(id);
    const rule = rules.find((r) => r.id === idNum);
    if (!rule) return;
    setSelectedRule(rule ?? null);
    form.setValue('ruleId', rule.id!);
  };

  const popRef = () => {
    form.setValue('references', refs.slice(0, refs.length - 1));
    //form.setValue('notes', form.watch('notes').slice(0, refs.length - 1));
  };

  const catchSubmit = () => {
    const data = form.getValues();

    try {
      newCustomEventSchema.parse(data);
    } catch {
      toast({
        title: 'Invalid data',
        description: 'Please check the form for errors',
        variant: 'error',
      });
      return;
    }

    const references: { id: number }[] = [];

    let r: { id: number } | undefined;
    data.references.forEach((ref) => {
      switch (selectedRule?.referenceType) {
        case 'castaway':
          r = castaways.find((c) => c.name === ref);
          if (r) references.push({ id: r.id });
          break;
        case 'tribe':
          r = tribes.find((t) => t.name === ref);
          if (r) references.push({ id: r.id });
          break;
        case 'member':
          r = members.find((m) => m.displayName === ref);
          if (r) references.push({ id: r.id });
          break;
      }
    });

    const submit = submitCustomEvent.bind(
      null,
      leagueId,
      parseInt(data.episodeId),
      selectedRule!,
      references,
    );

    submit()
      .then(() => {
        toast({
          title: 'Event scored',
          description: 'The event has been scored',
        });
        form.reset();
      })
      .catch((e) => {
        if (e instanceof Error) {
          toast({
            title: 'Error scoring event',
            description: e.message,
            variant: 'error',
          });
        }
      });
  };

  return (
    <section className='flex flex-col gap-6 items-center'>
      <Form {...form}>
        <form className='flex flex-col gap-2 justify-center md:w-3/4' action={catchSubmit}>
          <span className='flex gap-2 items-center w-full'>
            <FormField name='episodeId' render={({ field }) => (
              <FormItem className='flex-grow'>
                <Select onValueChange={field.onChange} {...field}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select Episode' />
                  </SelectTrigger>
                  <SelectContent>
                    {episodes.map((episode) => (
                      <SelectItem key={episode.id} value={episode.id.toString()}>
                        {episode.number}: {episode.title} - {new Date(episode.airDate).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <Button type='submit' className='px-1 right-0'>Score Event</Button>
          </span>
          <FormField name='ruleId' render={({ field }) => (
            <FormItem>
              <Select onValueChange={getRuleById} {...field} value={selectedRule?.id?.toString()}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select rule' />
                </SelectTrigger>
                <SelectContent>
                  {rules.map((rule) => (
                    <SelectItem value={rule.id!.toString()} key={rule.id}>{rule.name}</SelectItem>
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
                <span className='flex gap-2 items-center justify-center'>
                  {selectedRule.referenceType === 'castaway' && remaining.length == castaways.length && (
                    <>
                      <label className='text-xs' htmlFor='remainingOnly'>Show Eliminated</label>
                      <Switch checked={remainingOnly} onCheckedChange={setRemainingOnly} />
                    </>
                  )}
                  {/*<AddNote form={form} index={null}>
                    <div className='cursor-pointer hs-in rounded-md p-1 px-2'>Common Notes</div>
                  </AddNote>*/}
                </span>
                {refs.map((_, index) => (
                  <FormField key={index} name={`references.${index}`} render={({ field }) => {
                    switch (selectedRule.referenceType) {
                      case 'castaway':
                        return (
                          <span className='flex gap-2 justify-center items-center'>
                            <FormControl>
                              <SelectCastaways castaways={remainingOnly ? remaining : castaways} field={field} />
                            </FormControl>
                            {/*<AddNote form={form} index={index} />*/}
                          </span>
                        );
                      case 'tribe':
                        return (
                          <FormControl>
                            <SelectTribes tribes={tribes} field={field} />
                          </FormControl>
                        );
                      case 'member':
                        return (
                          <FormControl>
                            <SelectMembers members={members} field={field} />
                          </FormControl>
                        );
                    }
                  }} />
                ))}
              </div>
              <span className='grid grid-cols-2 gap-2'>
                <Button
                  type='button'
                  className='px-1'
                  onClick={() => form.setValue('references', [...refs, undefined])}>
                  Add {selectedRule.referenceType}
                </Button>
                <Button
                  type='button'
                  className='px-1'
                  onClick={popRef}>
                  Remove {selectedRule.referenceType}
                </Button>
              </span>
            </article>)}
        </form>
      </Form>
      {events &&
        <>
          <h2 className='text-xl font-semibold'>Current events</h2>
          <article className='grid grid-cols-1 gap-2 md:grid-cols-3'>
            {(events.castawayEvents?.length ?? 0) > 0 &&
              <section>
                <h2>Castaway events</h2>
                {events.castawayEvents.map((e) => (
                  <article key={e.name} className='bg-b3/80 rounded-md'>
                    <h3 className='text-xl font-semibold'>{e.name}</h3>
                    <p>{e.description}</p>
                    <p>Castaway: {e.castaway}</p>
                    <p>Episode: {e.episode}</p>
                  </article>))}
              </section>}
            {(events.tribeEvents?.length ?? 0) > 0 &&
              <section>
                <h2>Tribe events</h2>
                {events.tribeEvents.map((e) => (
                  <article key={e.name} className='bg-b3/80 rounded-md'>
                    <h3 className='text-xl font-semibold'>{e.name}</h3>
                    <p>{e.description}</p>
                    <p>Tribe: {e.tribe}</p>
                    <p>Episode: {e.episode}</p>
                  </article>))}
              </section>}
            {(events.memberEvents?.length ?? 0) > 0 &&
              <section>
                <h2>Member events</h2>
                {events.memberEvents.map((e) => (
                  <article key={e.name} className='bg-b3/80 rounded-md'>
                    <h3 className='text-xl font-semibold'>{e.name}</h3>
                    <p>{e.description}</p>
                    <p>Member: {e.member}</p>
                    <p>Episode: {e.episode}</p>
                  </article>))}
              </section>}
          </article>
        </>}
    </section>
  );
}

/*
interface AddNoteProps extends ComponentProps {
  form: ReturnType<typeof useForm<z.infer<typeof newCustomEventSchema>>>;
  index: number | null;
}

function AddNote({ form, index, children, className }: AddNoteProps) {
  const noteIndex = index !== null ? index + 1 : 0;
  const ref = noteIndex ? form.getValues(`references.${index!}`) : null;

  if (!ref && noteIndex) return (children ?? <NotepadText className='cursor-not-allowed opacity-30' />);

  const updateNotes = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const notes = form.getValues('notes');
    notes[noteIndex] = { reference: ref ?? null, note: event.target.value };

    form.setValue('notes', notes);
  };

  return (
    <Popover>
      <PopoverTrigger className={className}>
        {children ?? <NotepadText className='cursor-pointer' />}
      </PopoverTrigger>
      <PopoverContent>
        <CardContainer className='p-4'>
          <h3 className='text-xl font-semibold'>Add line seperated notes</h3>
          <FormField name={`notes.${noteIndex}.note`} render={() => (
            <FormItem>
              <Textarea
                value={form.getValues(`notes.${noteIndex}.note`)}
                onChange={(e) => updateNotes(e)} />
            </FormItem>
          )} />
        </CardContainer>
      </PopoverContent>
    </Popover>
  );
}
*/
