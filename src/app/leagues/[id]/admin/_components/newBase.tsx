'use client';
import { type ComponentProps } from '~/lib/utils';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { type Tribe } from '~/server/db/schema/tribes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/app/_components/commonUI/form';
import { SelectCastaways, SelectTribes } from '~/app/_components/selectSeason';
import { Button } from '~/app/_components/commonUI/button';
import { Switch } from '~/app/_components/commonUI/switch';
import { useToast } from '~/app/_components/commonUI/use-toast';
import { type EventName, eventName } from '~/server/db/schema/episodes';
import { submitBaseEvent } from '~/app/api/seasons/[name]/events/actions';
import { Textarea } from '~/app/_components/commonUI/textArea';
import { type getBaseEvents } from '~/app/api/leagues/[id]/score/query';
import { useRouter } from 'next/navigation';
import { type CustomEventRuleType } from '~/server/db/schema/customEvents';
import { type WeeklyEventRuleType } from '~/server/db/schema/weeklyEvents';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
/*import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import { NotepadText } from 'lucide-react';
import { Textarea } from '~/app/_components/commonUI/textArea';
import CardContainer from '~/app/_components/cardContainer';*/

interface NewBaseEventProps extends ComponentProps {
  castaways: CastawayDetails[];
  tribes: Tribe[];
  remaining: CastawayDetails[];
  episodes: [{ id: number; title: string, number: number, airDate: string }];
  events: Awaited<ReturnType<typeof getBaseEvents>> | null;
  otherRules?: {
    custom: CustomEventRuleType[];
    weekly: WeeklyEventRuleType[];
    season: SeasonEventRuleType[];
  };
}

const newBaseEventSchema = z.object({
  eventName: z.enum([...eventName.enumValues, '']),
  episodeId: z.string(),
  keywords: z.array(z.string().min(3).max(32)).max(5),
  notes: z.array(z.string().min(3).max(256)).max(5),
  referenceType: z.enum(['castaway', 'tribe']),
  references: z.array(z.string().or(z.undefined())).refine((refs) => {
    if (refs.length === 0) return false;
    if (refs.findIndex((ref) => ref === undefined || ref === '') !== -1) return false;
    return true;
  }),
  /*notes: z.object({
    reference: z.string().nullable(),
    note: z.string(),
  }).array(),*/
});

export default function NewBaseEvent({
  castaways,
  tribes,
  remaining,
  episodes,
  otherRules
}: NewBaseEventProps) {
  const [showEliminated, setShowEliminated] = useState(false);

  const form = useForm<z.infer<typeof newBaseEventSchema>>({
    defaultValues: {
      eventName: '',
      references: [],
      keywords: [],
      notes: [],
      episodeId: episodes[0].id.toString(),
    },
    resolver: zodResolver(newBaseEventSchema),
  });

  const { toast } = useToast();
  const router = useRouter();

  const refs = form.watch('references');
  const selectedEvent = form.watch('eventName');
  const selectedReferenceType = form.watch('referenceType');

  useEffect(() => {
    form.setValue('references', ['']);
  }, [form, selectedReferenceType]);

  const popRef = () => {
    form.setValue('references', refs.slice(0, refs.length - 1));
    //form.setValue('notes', form.watch('notes').slice(0, refs.length - 1));
  };

  const catchSubmit = () => {
    const data = form.getValues();

    try {
      newBaseEventSchema.parse(data);
    } catch (e) {
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
      switch (data.referenceType) {
        case 'castaway':
          r = castaways.find((c) => c.name === ref);
          if (r) references.push({ id: r.id });
          break;
        case 'tribe':
          r = tribes.find((t) => t.name === ref);
          if (r) references.push({ id: r.id });
          break;
      }
    });

    const submit = submitBaseEvent.bind(
      null,
      parseInt(data.episodeId),
      data.eventName as EventName,
      references,
      data.referenceType,
      data.keywords.map((k) => k.trim()),
      data.notes.map((n) => n.trim())
    );

    submit()
      .then(() => {
        toast({
          title: 'Event scored',
          description: 'The event has been scored',
        });
        form.reset();
        router.refresh();
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
    <Form {...form}>
      <form className='flex flex-col gap-2 justify-center md:min-w-3/4' action={catchSubmit}>
        <span className='flex gap-2 items-center w-full'>
          <FormField name='episodeId' render={({ field }) => (
            <FormControl>
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
            </FormControl>
          )} />
          <Button
            type='submit'
            disabled={refs.some((ref) => ref === '') || refs.length === 0 || form.formState.isSubmitting}
            className='px-1 right-0'>
            Score Event
          </Button>
        </span>
        <FormField name='eventName' render={({ field }) => (
          <FormControl>
            <FormItem>
              <Select onValueChange={field.onChange} {...field}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Event' />
                </SelectTrigger>
                <SelectContent>
                  {eventName.enumValues.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </FormControl>
        )} />
        {selectedEvent && (
          <article className='bg-b3/80 rounded-md p-2 flex flex-col gap-3 justify-center'>
            <h3 className='text-xl font-semibold'>{form.watch('eventName')}</h3>
            <div className='flex flex-col justify-center gap-2'>
              <FormField name='referenceType' render={({ field }) => (
                <FormControl className='flex justify-center'>
                  <FormItem>
                    <Select onValueChange={field.onChange} {...field}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select Reference' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='castaway'>Castaway</SelectItem>
                        <SelectItem value='tribe'>Tribe</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </FormControl>
              )} />
              <span className='flex gap-2 items-center justify-center'>
                {selectedReferenceType === 'castaway' && remaining.length !== castaways.length && (
                  <>
                    <label className='text-xs' htmlFor='remainingOnly'>Show Eliminated</label>
                    <Switch checked={showEliminated} onCheckedChange={setShowEliminated} />
                  </>
                )}
                {/*<AddNote form={form} index={null}>
                    <div className='cursor-pointer hs-in rounded-md p-1 px-2'>Common Notes</div>
                  </AddNote>*/}
              </span>
              {refs.map((_, index) => (
                <FormField key={index} name={`references.${index}`} render={({ field }) => {
                  switch (selectedReferenceType) {
                    case 'castaway':
                      return (
                        <span className='flex gap-2 justify-center items-center'>
                          <FormControl>
                            <SelectCastaways castaways={showEliminated ? castaways : remaining} field={field} />
                          </FormControl>
                          {/*<AddNote form={form} index={index} />*/}
                        </span>
                      );
                    case 'tribe':
                      return (
                        <FormControl className='flex justify-center'>
                          <SelectTribes tribes={tribes} field={field} />
                        </FormControl>
                      );
                  }
                }} />
              ))}
            </div>
            {form.formState.errors.references &&
              <FormMessage> At least one reference is required </FormMessage>}
            {selectedReferenceType && (
              <span className='grid grid-cols-2 gap-2'>
                < Button
                  type='button'
                  className='px-1'
                  onClick={() => form.setValue('references', [...refs, ''])}>
                  Add {selectedReferenceType}
                </Button>
                <Button
                  type='button'
                  className='px-1'
                  onClick={popRef}>
                  Remove {selectedReferenceType}
                </Button>
              </span>)}
            <section className='flex flex-col gap-1'>
              <span className='inline items-center'>
                <h3 className='text-xl font-semibold '>Keywords and Notes </h3>
                <h4 className='text-sm font-normal  ml-1'>(line separated)</h4>
              </span>
              <FormField name='keywords' render={({ field }) => (
                <FormControl>
                  <FormItem>
                    <Textarea
                      placeholder='Keywords'
                      value={(field.value as string[]).join('\n')}
                      onChange={(e) => form.setValue('keywords', e.target.value.split('\n'))} />
                  </FormItem>
                </FormControl>
              )} />
              {form.formState.errors.keywords &&
                <FormMessage> Each line must be between 3 and 32 characters </FormMessage>}
              <FormField name='notes' render={({ field }) => (
                <FormControl>
                  <FormItem>
                    <Textarea
                      placeholder='Notes'
                      value={(field.value as string[]).join('\n')}
                      onChange={(e) => form.setValue('notes', e.target.value.split('\n'))} />
                  </FormItem>
                </FormControl>
              )} />
              {form.formState.errors.notes &&
                <FormMessage> Each line must be between 3 and 256 characters </FormMessage>}
            </section>
            {otherRules && (
              <section className='flex flex-col gap-1'>
                <h3 className='text-xl font-semibold'>Submit with other rule</h3>
                <p>Coming soon...</p>
              </section>)}
          </article>)}
      </form>
    </Form>
  );
}

/*
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
    <p>Tribe: {e.tribe}</p>
    <p>Episode: {e.episode}</p>
    </article>))}
    </section>}
    {JSON.stringify(events.tribeUpdates, null, 2)}
    </article>
    </>}
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
          <h3 className='text-xl font-semibold'>Add line separated notes</h3>
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
