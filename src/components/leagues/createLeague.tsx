'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { DEFAULT_SURVIVAL_CAP, LeagueNameZod, SurvivalCapZod } from '~/server/db/defs/leagues';
import { BaseEventRuleZod, defaultBaseRules } from '~/server/db/defs/events';
import { AdvantageScoreSettings, ChallengeScoreSettings, OtherScoreSettings } from './customization/baseEvents';
import LeagueSettingsFields from './customization/leagueSettings';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious } from '~/components/ui/carousel';
import { Button } from '~/components/ui/button';
import { Progress } from '~/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useCarouselProgress } from '~/hooks/useCarouselProgress';
import { createNewLeague } from '~/app/api/leagues/actions';
import { useRouter } from 'next/navigation';
import { LeagueMemberFields } from './joinLeague';
import { ColorZod, DisplayNameZod } from '~/server/db/defs/leagueMembers';
import { type ReactNode, useEffect, useState } from 'react';
import { useYfsUser } from '~/hooks/useYfsUser';
import { useUser } from '@clerk/nextjs';
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/ui/alertDialog';
import { X } from 'lucide-react';

const formSchema = z.object({
  leagueName: LeagueNameZod,
  baseEventRules: BaseEventRuleZod,
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
  survivalCap: DEFAULT_SURVIVAL_CAP,
  displayName: '',
  color: '',
};

interface CreateLeagueFormProps {
  onSubmit?: () => void;
}

export default function CreateLeagueForm({ onSubmit }: CreateLeagueFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const { api, setApi, current, count, progress } = useCarouselProgress();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues, resolver: zodResolver(formSchema)
  });
  const { addLeague } = useYfsUser();

  useEffect(() => {
    reactForm.setValue('displayName', user?.username ?? '');
  }, [user, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const leagueInfo = await createNewLeague(
        data.leagueName,
        {
          survivalCap: data.survivalCap
        },
        data.baseEventRules,
        {
          displayName: data.displayName,
          color: data.color,
          role: 'Owner'
        }
      );
      addLeague(leagueInfo);
      alert(`League created with id: ${leagueInfo.leagueHash}`);
      onSubmit?.();
      router.push(`/leagues/${leagueInfo.leagueHash}/predraft`);
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
      <BaseEventRuleTabs />
    </section>
  );
}

interface BaseEventRuleTabsProps {
  rightSide?: ReactNode;
  disabled?: boolean;
}

export function BaseEventRuleTabs({ rightSide, disabled }: BaseEventRuleTabsProps) {
  return (
    <Tabs defaultValue='challenges' className='h-[26rem] mt-2'>
      <TabsList className='w-full grid grid-cols-3'>
        <TabsTrigger value='challenges'>Challenges</TabsTrigger>
        <TabsTrigger value='advantages'>Advantages</TabsTrigger>
        <TabsTrigger value='other'>Other</TabsTrigger>
      </TabsList>
      <span className='flex gap-4'>
        <div className='flex-grow flex-shrink-0'>
          <TabsContent value='challenges'>
            <ChallengeScoreSettings disabled={disabled} />
          </TabsContent>
          <TabsContent value='advantages'>
            <AdvantageScoreSettings disabled={disabled} />
          </TabsContent>
          <TabsContent value='other'>
            <OtherScoreSettings disabled={disabled} />
          </TabsContent>
        </div>
        <div className='flex-shrink flex-grow-0'>
          {rightSide}
        </div>
      </span>
    </Tabs>
  );
}

interface CreateLeagueModalProps {
  children: ReactNode;
}

export function CreateLeagueModal({ children }: CreateLeagueModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className='w-min max-sm:scale-75'>
        <AlertDialogHeader>
          <AlertDialogTitle className='sr-only'>Create a New League</AlertDialogTitle>
          <AlertDialogDescription className='sr-only'>
            Create a new league to start drafting with your friends.
          </AlertDialogDescription>
          <CreateLeagueForm onSubmit={() => setIsOpen(false)} />
        </AlertDialogHeader>
        <AlertDialogFooter className='absolute top-1 right-1'>
          <AlertDialogCancel className='h-min p-1'>
            <X stroke='white' />
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

