'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CardContainer from '~/app/_components/cardContainer';
import { Form, FormControl, FormField, FormLabel } from '~/app/_components/commonUI/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter } from '~/app/_components/commonUI/alert';
import { SelectCastaways, SelectMembers, SelectTribes } from '~/app/_components/selectSeason';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { type Member } from '~/server/db/schema/members';
import { type Tribe } from '~/server/db/schema/tribes';
import { PredictionCard } from '../settings/predictionCard';
import { submitVotesPredicts, type VotePredicts } from '~/app/api/leagues/[id]/draft/actions';
import { useToast } from '~/app/_components/commonUI/use-toast';
import { useState } from 'react';
import { Button } from '~/app/_components/commonUI/button';
import { type MemberEpisodeEvents } from '~/app/api/leagues/[id]/score/query';

interface VotePredictProps {
  leagueId: number;
  events: MemberEpisodeEvents;
  castaways: CastawayDetails[];
  tribes: Tribe[];
  members: Member[];
}

const formSchema = z.object({
  weeklyVote: z.array(z.string().min(1, 'Make all selections')),
  weeklyPredict: z.array(z.string().min(1, 'Make all selections')),
  season: z.array(z.string().min(1, 'Make all selections')),
});

export default function VotePredict({ leagueId, events, castaways, tribes, members }: VotePredictProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      weeklyVote: events.weekly.votes.map((v) => v.pick.castaway ?? v.pick.tribe ?? v.pick.member ?? ''),
      weeklyPredict: events.weekly.predictions.map((p) => p.pick.castaway ?? p.pick.tribe ?? p.pick.member ?? ''),
      season: events.season.map((p) => p.pick.castaway ?? p.pick.tribe ?? p.pick.member ?? ''),
    },
    resolver: zodResolver(formSchema),
  });

  const { toast } = useToast();
  const [alertOpen, setAlertOpen] = useState(
    events.count > 0 && !events.locked && !events.picked);

  const handleSubmit = () => {
    const data = form.getValues();

    const submitData: VotePredicts = {
      weeklyVotes: { castaway: {}, tribe: {}, member: {}, },
      weeklyPredicts: { castaway: {}, tribe: {}, member: {}, },
      seasonPredicts: { castaway: {}, tribe: {}, member: {}, },
    };
    events.weekly.votes.forEach((event, index) => {
      let id: number | undefined;
      switch (event.referenceType) {
        case 'castaway':
          id = castaways.find((castaway) => castaway.name === data.weeklyVote[index])?.id;
          if (id) submitData.weeklyVotes.castaway[event.id] = id;
          break;
        case 'tribe':
          id = tribes.find((tribe) => tribe.name === data.weeklyVote[index])?.id;
          if (id) submitData.weeklyVotes.tribe[event.id] = id;
          break;
        case 'member':
          id = members.find((member) => member.displayName === data.weeklyVote[index])?.id;
          if (id) submitData.weeklyVotes.member[event.id] = id;
          break;
      }
    });

    events.weekly.predictions.forEach((event, index) => {
      let id: number | undefined;
      switch (event.referenceType) {
        case 'castaway':
          id = castaways.find((castaway) => castaway.name === data.weeklyPredict[index])?.id;
          if (id) submitData.weeklyPredicts.castaway[event.id] = id;
          break;
        case 'tribe':
          id = tribes.find((tribe) => tribe.name === data.weeklyPredict[index])?.id;
          if (id) submitData.weeklyPredicts.tribe[event.id] = id;
          break;
        case 'member':
          id = members.find((member) => member.displayName === data.weeklyPredict[index])?.id;
          if (id) submitData.weeklyPredicts.member[event.id] = id;
          break;
      }
    });

    events.season.forEach((event, index) => {
      let id: number | undefined;
      switch (event.referenceType) {
        case 'castaway':
          id = castaways.find((castaway) => castaway.name === data.season[index])?.id;
          if (id) submitData.seasonPredicts.castaway[event.id] = id;
          break;
        case 'tribe':
          id = tribes.find((tribe) => tribe.name === data.season[index])?.id;
          if (id) submitData.seasonPredicts.tribe[event.id] = id;
          break;
        case 'member':
          id = members.find((member) => member.displayName === data.season[index])?.id;
          if (id) submitData.seasonPredicts.member[event.id] = id;
          break;
      }
    });

    const submit = submitVotesPredicts.bind(null, leagueId, submitData);
    submit()
      .then(() => {
        toast({
          title: 'Votes submitted',
          description: `Your ${events.weekly.votes.length > 0 ? 'votes' : ''} 
          ${events.weekly.votes.length > 0 && events.weekly.predictions.length > 0 ? 'and ' : ''}
          ${events.weekly.predictions.length + events.season.length > 0 ? 'predictions' : ''} 
          have been submitted.`,
        });
      })
      .catch((e) => {
        if (e instanceof Error) {
          toast({
            title: 'Error submitting votes',
            description: e.message,
            variant: 'error',
          });
        }
      });
  };

  if (events.count === 0) return null;

  return (
    <article>
      <Button className='text-xs p-1 h-min font-semibold mb-2 w-full' onClick={() => setAlertOpen(true)}>
        {events.locked ?
          'Weekly picks are locked' :
          events.picked ?
            'Edit weekly picks' :
            'Weekly picks available'}
      </Button>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <CardContainer className={'flex flex-col pb-2 items-center text-center max-h-[40rem] m-0 w-72'} >
            <h2 className='text-xl font-semibold'>Vote & Predict</h2>
            <Form {...form}>
              <form action={handleSubmit} className='light-scroll'>
                {events.weekly.votes.length > 0 && (
                  <section className='flex flex-col gap-2 pb-4'>
                    <FormLabel className='text-base'>Vote on this week&apos;s episode</FormLabel>
                    {events.weekly.votes.map((event, index) => (
                      <FormControl key={index}>
                        <PredictionCard prediction={event} vote>
                          <FormField
                            name={`weeklyVote[${index}]`}
                            render={({ field }) => {
                              switch (event.referenceType) {
                                case 'castaway':
                                  return (
                                    <span className='flex gap-2 justify-center items-center'>
                                      <FormControl>
                                        <SelectCastaways castaways={castaways} field={field} />
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
                        </PredictionCard>
                      </FormControl>
                    ))}
                  </section>
                )}
                {events.weekly.predictions.length > 0 && (
                  <section className='flex flex-col gap-2 pb-4'>
                    <FormLabel className='text-base'>Predict next week&apos;s episode</FormLabel>
                    {events.weekly.predictions.map((event, index) => (
                      <FormControl key={index}>
                        <PredictionCard prediction={event}>
                          <FormField
                            name={`weeklyPredict[${index}]`}
                            render={({ field }) => {
                              switch (event.referenceType) {
                                case 'castaway':
                                  return (
                                    <span className='flex gap-2 justify-center items-center'>
                                      <FormControl>
                                        <SelectCastaways castaways={castaways} field={field} />
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
                        </PredictionCard>
                      </FormControl>
                    ))}
                  </section>
                )}
                {events.season.length > 0 && (
                  <section className='flex flex-col gap-2 pb-4'>
                    <FormLabel className='text-base'>Predict the rest of the season</FormLabel>
                    {events.season.map((event, index) => (
                      <FormControl key={index}>
                        <PredictionCard prediction={event}>
                          <FormField
                            name={`season[${index}]`}
                            render={({ field }) => {
                              switch (event.referenceType) {
                                case 'castaway':
                                  return (
                                    <span className='flex gap-2 justify-center items-center'>
                                      <FormControl>
                                        <SelectCastaways castaways={castaways} field={field} />
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
                        </PredictionCard>
                      </FormControl>
                    ))}
                  </section>
                )}
                <AlertDialogFooter className='w-full items-center justify-center flex-row'>
                  <AlertDialogAction
                    onClick={handleSubmit}
                    className='w-1/2'
                    disabled={!form.formState.isValid || form.formState.isSubmitting}>
                    Submit
                  </AlertDialogAction>
                  <AlertDialogCancel className='w-1/2'>I&apos;ll do this Later</AlertDialogCancel>
                </AlertDialogFooter>
              </form>
            </Form>
          </CardContainer>
        </AlertDialogContent>
      </AlertDialog >
    </article>
  );
}
