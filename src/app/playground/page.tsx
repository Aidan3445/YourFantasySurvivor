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
import { RotateCcw } from 'lucide-react';

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
      <div className='sticky z-50 flex flex-col w-full justify-center bg-card shadow-lg shadow-primary/20 px-4 py-4 items-center border-b-2 border-primary/20'>
        <div className='text-center'>
          <span className='flex items-center justify-center gap-3 mb-2'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <h1 className='text-3xl md:text-4xl font-black uppercase tracking-tight'>Scoring Playground</h1>
            <span className='h-6 w-1 bg-primary rounded-full' />
          </span>
          <p className='text-muted-foreground text-pretty text-sm md:text-base font-medium'>
            Test out different scoring configurations and see how they impact the castaways scores!
          </p>
        </div>

        {seasons && seasons.length > 0 && (
          <Select
            value={selectedSeasonId?.toString() ?? ''}
            onValueChange={(value) => setSelectedSeasonId(Number(value))}>
            <SelectTrigger className='max-w-lg mt-3 border-2 border-primary/20 hover:border-primary/40 bg-primary/5 font-medium'>
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

      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-10.5rem)] h-[calc(100svh-9.5rem-var(--navbar-height))]'>
        <div className='flex flex-col gap-4 my-2'>
          <Form {...reactForm}>
            <form className='p-4 bg-card rounded-lg shadow-lg shadow-primary/10'>
              <span className='grid lg:grid-cols-3 gap-2'>
                <ChallengeScoreSettings hidePredictions />
                <AdvantageScoreSettings hidePredictions>
                  <Button
                    type='button'
                    className='w-full h-full hidden lg:flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-wider border-2 border-primary/30 hover:bg-primary/10'
                    variant='outline'
                    onClick={() => reactForm.reset()}>
                    <RotateCcw className='w-4 h-4 shrink-0' />
                    Reset Scoring
                  </Button>
                </AdvantageScoreSettings>
                <OtherScoreSettings hidePredictions />
              </span>
              <Button
                type='button'
                className='w-full lg:hidden mt-4 flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-wider border-2 border-primary/30 hover:bg-primary/10'
                variant='outline'
                onClick={() => reactForm.reset()}>
                <RotateCcw className='w-4 h-4 shrink-0' />
                Reset Scoring
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
