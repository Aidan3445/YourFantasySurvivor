'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '~/components/common/form';
import { type LeagueInsert, LeagueInsertZod, LeagueNameZod } from '~/types/leagues';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious } from '~/components/common/carousel';
import { Button } from '~/components/common/button';
import { Progress } from '~/components/common/progress';
import { useCarouselProgress } from '~/hooks/ui/useCarouselProgress';
import createNewLeague from '~/actions/createNewLeague';
import { useRouter } from 'next/navigation';
import LeagueMemberFields from '~/components/leagues/customization/member/formFields';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import NextButton from '~/components/leagues/actions/league/create/next';
import LeagueNameField from '~/components/leagues/actions/league/create/name';
import { DraftDateField } from '~/components/leagues/customization/settings/draft/date';
import { useQueryClient } from '@tanstack/react-query';

interface CreateLeagueFormProps {
  onSubmit?: () => void;
}

export default function CreateLeagueForm({ onSubmit }: CreateLeagueFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { api, setApi, current, count } = useCarouselProgress();
  const progress = count > 0 ? current / (count - 1) * 100 : 0;
  const reactForm = useForm<LeagueInsert>({
    defaultValues: {
      leagueName: '',
      member: {
        displayName: '',
        color: '',
      },
    },
    resolver: zodResolver(LeagueInsertZod),
  });

  useEffect(() => {
    reactForm.setValue('member.displayName', user?.username ?? '');
  }, [user, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const { newHash } = await createNewLeague(data.leagueName, data.member, data.draftDate);
      if (!newHash) throw new Error('Failed to create league');

      await queryClient.invalidateQueries({ queryKey: ['leagues'] });
      alert(`League created called ${data.leagueName}`);
      onSubmit?.();
      router.push(`/leagues/${newHash}/predraft`);
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
                <LeagueMemberFields formPrefix='member' />
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
