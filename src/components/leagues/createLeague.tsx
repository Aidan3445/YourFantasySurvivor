'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { DraftTimingOptions, DEFAULT_SURVIVAL_CAP, LeagueNameZod, SurvivalCapZod } from '~/server/db/defs/leagues';
import { BaseEventRule, defaultBaseRules } from '~/server/db/defs/baseEvents';
import { AdvantageScoreSettings, ChallengeScoreSettings, OtherScoreSettings } from './customization/baseEvents';
import LeagueSettingsFields from './customization/leagueSettings';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious } from '../ui/carousel';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useCarouselProgress } from '~/hooks/useCarouselProgress';
import { createNewLeague } from '~/app/api/leagues/actions';
import { useRouter } from 'next/navigation';
import { LeagueMemberFields } from './joinLeague';
import { ColorZod, DisplayNameZod } from '~/server/db/defs/leagueMembers';

const formSchema = z.object({
  leagueName: LeagueNameZod,
  baseEventRules: BaseEventRule,
  draftTiming: z.enum(DraftTimingOptions),
  survivalCap: SurvivalCapZod,
  displayName: DisplayNameZod,
  color: ColorZod,
}).transform(data => ({
  ...data,
  leagueName: data.leagueName.trim()
}));


const defaultValues: z.infer<typeof formSchema> = {
  leagueName: '',
  baseEventRules: defaultBaseRules,
  draftTiming: 'Before Premier',
  survivalCap: DEFAULT_SURVIVAL_CAP,
  displayName: '',
  color: '',
};

export default function CreateLeagueForm() {
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues, resolver: zodResolver(formSchema)
  });
  const { api, setApi, current, count, progress } = useCarouselProgress();
  const router = useRouter();

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const leagueHash = await createNewLeague(
        data.leagueName,
        {
          draftTiming: data.draftTiming,
          survivalCap: data.survivalCap
        },
        data.baseEventRules,
        {
          displayName: data.displayName,
          color: data.color,
          role: 'owner'
        }
      );
      alert(`League created with id: ${leagueHash}`);
      router.push(`/leagues/${leagueHash}/predraft`);
    } catch (error) {
      console.error(error);
      alert('Failed to create league');
    }
  });

  return (
    <Form {...reactForm}>
      <form className='bg-card rounded-lg w-96' action={() => handleSubmit()}>
        <Carousel className='pt-10' setApi={setApi} opts={{ watchDrag: false, ignoreKeys: true }}>
          <CarouselPrevious className='absolute left-1 top-5 z-10' />
          {count > 0 &&
            <p className='w-full text-center text-sm absolute top-1'>
              Step {current + 1} of {count}
            </p>}
          <Progress className='w-80 absolute left-12 top-6' value={progress} />
          <CarouselContent className='-ml-14'>
            <CarouselItem className='pl-14 flex flex-col'>
              <LeagueNameFields />
              <LeagueMemberFields />
              <NextButton
                disabled={!formSchema.safeParse(reactForm.watch())?.success}
                onClick={() => api?.scrollNext()} />
            </CarouselItem>
            <CarouselItem className='pl-14 flex flex-col'>
              <LeagueSettingsFields />
              <NextButton onClick={() => api?.scrollNext()} />
            </CarouselItem>
            <CarouselItem className='pl-14 flex flex-col'>
              <BaseEventsFields />
              <Button
                className='m-4 mt-auto w-80 self-center'
                type='submit'>
                Create League
              </Button>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </form>
    </Form >
  );
}

interface NextButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

function NextButton({ disabled = false, onClick }: NextButtonProps) {
  return (
    <Button
      className='m-4 mt-auto w-80 self-center'
      type='button'
      disabled={disabled}
      onClick={onClick}>
      Next
    </Button>
  );
}

function LeagueNameFields() {
  return (
    <section className='mx-2'>
      <FormField
        name='leagueName'
        render={({ field }) => (
          <FormItem>
            <FormLabel>League Name</FormLabel>
            <FormControl>
              <Input
                className='w-full'
                type='text'
                autoComplete='off'
                autoCapitalize='on'
                placeholder='Enter the name of your league'
                {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}

function BaseEventsFields() {
  return (
    <section className='mx-2'>
      <FormLabel>Setup Events</FormLabel>
      <FormDescription>{'Don\'t worry, you can change these values later.'}</FormDescription>
      <Tabs defaultValue='challenges' className='h-[26rem] mt-2'>
        <TabsList className='w-full grid grid-cols-3'>
          <TabsTrigger value='challenges'>Challenges</TabsTrigger>
          <TabsTrigger value='advantages'>Advantages</TabsTrigger>
          <TabsTrigger value='other'>Other</TabsTrigger>
        </TabsList>
        <TabsContent value='challenges'>
          <ChallengeScoreSettings />
        </TabsContent>
        <TabsContent value='advantages'>
          <AdvantageScoreSettings />
        </TabsContent>
        <TabsContent value='other'>
          <OtherScoreSettings />
        </TabsContent>
      </Tabs>
    </section>
  );
}
