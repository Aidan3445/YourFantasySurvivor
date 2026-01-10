'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/common/select';
import { useSeasons } from '~/hooks/seasons/useSeasons';

const formSchema = z.object({
  baseEventRules: BaseEventRulesZod,
});

export default function PlaygroundPage() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const { data: seasons } = useSeasons(true);
  const { data: seasonData } = useSeasonsData(true, selectedSeasonId ?? undefined);
  const season = seasonData?.[0];

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      baseEventRules: defaultBaseRules,
    },
    resolver: zodResolver(formSchema)
  });

  // Auto-select most recent season on mount
  useEffect(() => {
    if (!selectedSeasonId && seasons && seasons.length > 0) {
      setSelectedSeasonId(seasons[0]!.seasonId);
    }
  }, [seasons, selectedSeasonId]);

  return (
    <div>
      <div className='sticky z-50 flex flex-col w-full h-32 justify-center bg-card shadow-md shadow-primary px-2 items-center'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold'>Scoring Playground</h1>
          <p className='text-muted-foreground text-pretty text-sm md:text-base'>
            Test out different scoring configurations and see how they impact the castaways scores!
          </p>
        </div>

        {seasons && seasons.length > 0 && (
          <Select
            value={selectedSeasonId?.toString() ?? ''}
            onValueChange={(value) => setSelectedSeasonId(Number(value))}>
            <SelectTrigger className='max-w-lg'>
              <SelectValue placeholder='Select a season' />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.seasonId} value={season.seasonId.toString()}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-9rem)] h-[calc(100svh-8rem-var(--navbar-height))]'>
        <div className='flex flex-col gap-4 my-2'>
          <Form {...reactForm}>
            <form className='p-4 bg-card rounded-lg'>
              <span className='grid lg:grid-cols-3 gap-2'>
                <ChallengeScoreSettings hidePredictions />
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
            scoreData={[season!]}
            overrideBaseRules={BaseEventRulesZod.parse(reactForm.watch('baseEventRules'))} />
        </div>
        <ScrollBar className='pb-4 pt-2' />
      </ScrollArea>
    </div>
  );
}
