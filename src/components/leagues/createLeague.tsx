'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { LeagueNameZod } from '~/server/db/defs/leagues';
import { AdvantageScoreSettings, ChallengeScoreSettings, OtherScoreSettings } from './customization/baseEvents';
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
import { DraftDateField } from './customization/setDraftDate';

const formSchema = z.object({
  leagueName: LeagueNameZod,
  displayName: DisplayNameZod,
  color: ColorZod,
  draftDate: z.date().optional(),
}).transform(data => ({
  ...data,
  leagueName: data.leagueName.trim()
}));

interface CreateLeagueFormProps {
  onSubmit?: () => void;
}

export default function CreateLeagueForm({ onSubmit }: CreateLeagueFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const { api, setApi, current, count } = useCarouselProgress();
  const progress = count > 0 ? current / (count - 1) * 100 : 0;
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      leagueName: '',
      displayName: '',
      color: '',
    },
    resolver: zodResolver(formSchema)
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
          displayName: data.displayName,
          color: data.color,
          role: 'Owner'
        },
        data.draftDate
      );
      addLeague(leagueInfo);
      alert(`League created called ${data.leagueName}`);
      onSubmit?.();
      router.push(`/leagues/${leagueInfo.leagueHash}/predraft`);
    } catch (error) {
      console.error(error);
      alert('Failed to create league');
    }
  });

  return (
    <Form {...reactForm}>
      <form className='bg-card rounded-lg' action={() => handleSubmit()}>
        <Carousel setApi={setApi} opts={{ watchDrag: false, ignoreKeys: true }}>
          <span className='flex w-full justify-center items-end gap-4'>
            <CarouselPrevious className='static translate-y-0' />
            <div className='space-y-1 grow'>
              {count > 0 &&
                <p className='w-full text-center text-sm'>
                  Step {current + 1} of {count}
                </p>}
              <Progress className='w-full' value={progress} />
            </div>
            <div className='w-8' />
          </span>
          <CarouselContent className='-ml-14'>
            <CarouselItem className='pl-14 flex flex-col pt-4'>
              <LeagueNameField />
              <NextButton
                disabled={!LeagueNameZod.safeParse(reactForm.watch('leagueName')).success}
                onClick={() => api?.scrollNext()} />
            </CarouselItem>
            <CarouselItem className='pl-14 flex flex-col pt-4'>
              <DraftDateField />
              <NextButton onClick={() => api?.scrollNext()} />
            </CarouselItem>
            <CarouselItem className='pl-14 flex flex-col pt-4'>
              <div className='pr-4'>
                <LeagueMemberFields />
              </div>
              <Button
                className='m-4 mt-auto w-80 self-center'
                disabled={!reactForm.formState.isValid}
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


const placeholderOptions = [
  'Jeff Probst Fan Club',
  'Torch Snuffers',
  'Jury\'s Out'
];

function LeagueNameField() {
  const [placeholder, setPlaceholder] = useState(0);


  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) => (prev + 1) % placeholderOptions.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [setPlaceholder]);



  return (
    <section className='mx-2'>
      <FormField
        name='leagueName'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-lg'>League Name</FormLabel>
            <FormControl>
              <Input
                className='w-full h-12 indent-2 placeholder:italic'
                type='text'
                autoComplete='off'
                autoCapitalize='on'
                placeholder={placeholderOptions[placeholder]}
                {...field} />
            </FormControl>
            <FormDescription className='text-sm text-left'>
              Pick a fun or creative name for your league!
              This is how your league will appear to members.
              {' Don\'t worry, you can change this later.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}

interface BaseEventRuleTabsProps {
  rightSide?: ReactNode;
  locked?: boolean;
}

export function BaseEventRuleTabs({ rightSide, locked: disabled }: BaseEventRuleTabsProps) {
  return (
    <Tabs defaultValue='challenges' className='h-108 mt-2'>
      <TabsList className='w-full grid grid-cols-3'>
        <TabsTrigger value='challenges'>Challenges</TabsTrigger>
        <TabsTrigger value='advantages'>Advantages</TabsTrigger>
        <TabsTrigger value='other'>Other</TabsTrigger>
      </TabsList>
      <span className='flex'>
        <TabsContent value='challenges'>
          <ChallengeScoreSettings disabled={disabled} />
        </TabsContent>
        <TabsContent value='advantages'>
          <AdvantageScoreSettings disabled={disabled} />
        </TabsContent>
        <TabsContent value='other'>
          <OtherScoreSettings disabled={disabled} />
        </TabsContent>
        {rightSide}
      </span>
    </Tabs>
  );
}

interface CreateLeagueModalProps {
  children: ReactNode;
  className?: string;
}

export function CreateLeagueModal({ children, className }: CreateLeagueModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger className={className} asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className='sm:w-160 w-96 flex flex-col'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-2xl'>Create a New League</AlertDialogTitle>
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

