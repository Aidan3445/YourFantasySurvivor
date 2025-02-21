'use client';
import { z } from 'zod';
import { type ComponentProps } from '~/lib/utils';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { type Tribe } from '~/server/db/schema/tribes';
import { type Member } from '~/server/db/schema/members';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/app/_components/commonUI/form';
import { Button } from '~/app/_components/commonUI/button';
import { type Picks, submitDraft } from '~/app/api/leagues/[id]/draft/actions';
import { useRouter } from 'next/navigation';
import { type Predictions } from '~/app/api/leagues/[id]/draft/query';
import { useToast } from '~/app/_components/commonUI/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '~/app/_components/commonUI/alert';
import { PredictionCard } from '../../_components/settings/predictionCard';
import { SelectCastaways, SelectMembers, SelectTribes } from '~/app/_components/selectSeason';

export interface DraftFormProps extends ComponentProps {
  leagueId: number;
  currentPicks: Predictions;
  pickCount: number;
  castaway?: SeasonEventRuleType[];
  tribe?: SeasonEventRuleType[];
  member?: SeasonEventRuleType[];
  options: {
    castaways: CastawayDetails[];
    tribes: Tribe[];
    members: Member[];
    unavailable: CastawayDetails[];
  };
  yourTurn: boolean;
  draftOver: boolean;
}

export default function DraftForm({
  leagueId,
  currentPicks,
  pickCount,
  castaway,
  tribe,
  member,
  options,
  yourTurn,
  draftOver,
  className
}: DraftFormProps) {
  const draftSchema = z.object({
    firstPick: z.string().optional().refine(
      (value) => value ?? !yourTurn,
      { message: 'Required' }),
    secondPick: z.string().optional().refine(
      (value) => value ?? pickCount === 1,
      { message: 'Required' }),
    castaway: z.array(z.string()).optional(),
    tribe: z.array(z.string()).optional(),
    member: z.array(z.string()).optional(),
  });
  type Data = z.infer<typeof draftSchema>;

  const form = useForm<Data>({
    resolver: zodResolver(draftSchema),
  });
  const router = useRouter();
  const { toast } = useToast();

  const submitPicks = () => {
    try {
      form.handleSubmit(() => null)().catch((err) => { throw err; });
      draftSchema.parse(form.getValues());
    } catch (err) {
      console.error('Failed to submit picks', err);
      return;
    }

    const data = form.getValues();

    const firstPickId = options.castaways.find((c) => c.name === data.firstPick)?.id;

    const submission = { firstPick: firstPickId, castaway: {}, tribe: {}, member: {} } as Picks;
    castaway?.forEach((event, index) => {
      const castawayId = options.castaways.find((c) => c.name === data.castaway![index])?.id;
      if (castawayId && event.id) submission.castaway[event.id] = castawayId;
    });
    tribe?.forEach((event, index) => {
      const tribeId = options.tribes.find((t) => t.name === data.tribe![index])?.tribeId;
      if (tribeId && event.id) submission.tribe[event.id] = tribeId;
    });
    member?.forEach((event, index) => {
      const memberId = options.members.find((m) => m.displayName === data.member![index])?.id;
      if (memberId && event.id) submission.member[event.id] = memberId;
    });
    const submit = submitDraft.bind(null, leagueId, submission);

    submit()
      .then(() => {
        router.push(`/leagues/${leagueId}/`);
      })
      .catch((e) => {
        if (e instanceof Error) {
          toast({
            title: 'Error joining league',
            description: e.message,
            variant: 'error',
          });
        }
      });
  };

  const getAlert = () => {
    let content: { title: string, description: string } = { title: '', description: '' };
    if (currentPicks.firstPick) {
      content = {
        title: 'You have already submitted your draft.',
        description: `You can only update your predictions. You will be able to change your 
                      survivor pick once all players have submitted theirs.`,
      };
    } else if (!yourTurn) {
      content = {
        title: 'It is not your turn to draft.',
        description: 'You can submit your predictions now but must wait for your survivor pick.',
      };
    } else {
      content = {
        title: 'It\'s your turn!',
        description: `You can now submit your prediction and your survivor pick. Note that your 
                      survivor pick cannot be changed once submitted until all players have drafted.
                      Choose wisely.`,
      };
    }
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{content.title}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>{content.description}</AlertDialogDescription>
          <AlertDialogFooter><AlertDialogCancel>Close</AlertDialogCancel></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <Form {...form}>
      {!draftOver && getAlert()}
      <form
        className={className}
        action={submitPicks}>
        <FormLabel className='text-2xl'> Pick your Survivor{pickCount > 1 ? 's' : ''}</FormLabel>
        <FormField
          name='firstPick'
          defaultValue={currentPicks.firstPick}
          render={({ field }) => (
            <FormItem className='flex flex-col justify-center my-0 rounded-md'>
              <PredictionCard prediction={survivorPrediction}>
                <FormControl>
                  <SelectCastaways
                    castaways={options.castaways}
                    otherChoices={currentPicks.firstPick ? undefined : options.unavailable}
                    locked={currentPicks.firstPick ? true : false}
                    field={field} />
                </FormControl>
              </PredictionCard>
            </FormItem>)} />
        {castaway && // TODO: FormItem goes inside the FormField
          <div>
            <br />
            <FormLabel className='text-2xl'>Castaway Predictions</FormLabel>
            <div className='flex flex-col gap-1'>
              {castaway?.map((c, index) => (
                <FormItem key={c.id} className='flex flex-col justify-center my-0 rounded-md'>
                  <PredictionCard prediction={c} >
                    <FormControl>
                      <FormField
                        name={`castaway[${index}]`}
                        defaultValue={currentPicks.castawayPicks?.[index]}
                        render={({ field }) => (
                          <SelectCastaways
                            castaways={options.castaways}
                            locked={draftOver}
                            field={field} />)} />
                    </FormControl>
                  </PredictionCard>
                </FormItem>))}
            </div>
          </div>}
        {tribe && // TODO: FormItem goes inside the FormField
          <div>
            <br />
            <FormLabel className='text-2xl'>Tribe Predictions</FormLabel>
            <div className='flex flex-col gap-1'>
              {tribe?.map((t, index) => (
                <FormItem key={t.id} className='flex flex-col justify-center my-0 rounded-md'>
                  <PredictionCard prediction={t} >
                    <FormControl>
                      <FormField
                        name={`tribe[${index}]`}
                        defaultValue={currentPicks.tribePicks?.[index]}
                        render={({ field }) => (
                          <SelectTribes
                            tribes={options.tribes}
                            locked={draftOver}
                            field={field} />)} />
                    </FormControl>
                  </PredictionCard>
                </FormItem>))}
            </div>
          </div>}
        {member &&
          <div>
            <br />
            <h2 className='text-2xl font-semibold text-center'>Member Predictions</h2>
            <div className='flex flex-col gap-1'>
              {member?.map((m, index) => (
                <FormItem key={m.id} className='flex flex-col justify-center my-0 rounded-md'>
                  <PredictionCard prediction={m} >
                    <FormControl>
                      <FormField
                        name={`member[${index}]`}
                        defaultValue={currentPicks.memberPicks?.[index]}
                        render={({ field }) => (
                          <SelectMembers
                            members={options.members}
                            locked={draftOver}
                            field={field} />)} />
                    </FormControl>
                  </PredictionCard>
                </FormItem>))}
            </div>
          </div>}
        <span className='flex gap-2 justify-center'>
          {!draftOver &&
            <Button type='submit' className='mt-4'>
              {currentPicks.firstPick ? 'Update and return' : 'Submit Picks'}
            </Button>}
          <Button type='button' onClick={() => router.push(`/leagues/${leagueId}/`)} className='mt-4'>
            {draftOver ? 'Back' : 'Cancel'}
          </Button>
        </span>
      </form >
    </Form >
  );
}

const survivorPrediction = {
  eventName: 'Main Survivor',
  points: 0,
  description: 'Your main castaway that will earn you points for each episode.',
} as SeasonEventRuleType;
