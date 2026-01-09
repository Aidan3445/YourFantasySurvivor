'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '~/components/common/button';
import { Form } from '~/components/common/form';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import ScoreboardTable from '~/components/home/scoreboard/table';
import AdvantageScoreSettings from '~/components/leagues/customization/events/base/advantages';
import ChallengeScoreSettings from '~/components/leagues/customization/events/base/challenges';
import OtherScoreSettings from '~/components/leagues/customization/events/base/other';
import { useSeasonsData } from '~/hooks/seasons/useSeasonsData';
import { defaultBaseRules } from '~/lib/leagues';
import { BaseEventRulesZod } from '~/types/leagues';

const formSchema = z.object({
  baseEventRules: BaseEventRulesZod,
});

export default function PlaygroundPage() {
  const { data: seasonData } = useSeasonsData(true);

  const sortedSeasons = useMemo(() => {
    return seasonData?.toSorted((a, b) =>
      b.season.premiereDate.getTime() - a.season.premiereDate.getTime()) ?? [];
  }, [seasonData]);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      baseEventRules: defaultBaseRules,
    },
    resolver: zodResolver(formSchema)
  });

  return (
    <main className='md:w-[calc(100svw-var(--sidebar-width))] md:p-2 pb-0 md:h-svh h-[calc(100svh-(var(--navbar-height)))]'>
      <div className='w-full md:shadow-lg md:bg-secondary md:rounded-3xl md:border overflow-hidden'>
        <div className='sticky z-50 flex flex-col w-full h-10 justify-between bg-card shadow-md shadow-primary'>
          <h1 className='text-center text-3xl'>Playground</h1>
        </div>

        <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-3.5rem)] h-[calc(100svh-3.5-var(--navbar-height))]'>
          <div className='flex flex-col gap-4 my-2'>
            <Form {...reactForm}>
              <form className='p-4 bg-card rounded-lg'>
                <p className='text-sm text-secondary-foreground mb-2 border-b lg:hidden'>
                  Test out different scoring configurations and see how they impact the castaways scores!
                  <br />
                  Select season in the top right corner of the scoreboard.
                </p>
                <span className='grid lg:grid-cols-3 gap-x-4 gap-y-2'>
                  <ChallengeScoreSettings hidePredictions>
                    <p className='text-sm text-secondary-foreground hidden lg:block'>
                      Test out different scoring configurations and see how they impact the castaways scores!
                      <br />
                      Select season in the top right corner of the scoreboard.
                    </p>
                  </ChallengeScoreSettings>
                  <AdvantageScoreSettings hidePredictions>
                    <Button
                      type='button'
                      className='w-full h-full hidden lg:block'
                      variant='destructive'
                      onClick={() => reactForm.reset()}>
                      Reset to Default
                    </Button>
                  </AdvantageScoreSettings>
                  <OtherScoreSettings hidePredictions />
                </span>
                <Button
                  type='button'
                  className='w-full h-full lg:hidden mt-4'
                  variant='destructive'
                  onClick={() => reactForm.reset()}>
                  Reset to Default
                </Button>
              </form>
            </Form>
            <ScoreboardTable
              scoreData={sortedSeasons}
              overrideBaseRules={BaseEventRulesZod.parse(reactForm.watch('baseEventRules'))} />
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>
    </main>
  );
}
