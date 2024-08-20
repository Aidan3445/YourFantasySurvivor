'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, DotButtons } from '../commonUI/carousel';
import compileStats, { type SeasonStats as SS, emptyStats } from '~/app/api/seasons/[name]/events/stats';
import ChallengesPodium from './challengesPodium';
import AdvantagesTable from './advantagesTable';
import SelectSeason from '../selectSeason';
import EliminationsTable from './eliminationsTable';
import TitlesTable from './titlesTable';
import FinalsStats from './finalsStats';
import StatsSection from './statsSection';
import CardContainer from '../cardContainer';
import type { Events } from '~/app/api/seasons/[name]/events/query';
import { useToast } from '../commonUI/use-toast';

export default function SeasonStats() {
  const [stats, setStats] = useState<SS>(emptyStats());
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const season = searchParams.get('season')!;

  // when season is set, fetch episodes and compile stats
  useEffect(() => {
    if (season) {
      fetch(`/api/seasons/${season}/events`)
        .then((res) => res.json())
        .then((events: Events) => setStats(compileStats(events)))
        .catch((err: Error) => {
          setStats(emptyStats());
          toast({
            title: 'Error fetching events',
            description: err.message,
            variant: 'error',
          });
        });
    }
  }, [season, toast]);

  const carouselItems = [
    { title: 'Challenges', content: <ChallengesPodium castaways={stats.castawayChallenges} tribes={stats.tribeChallenges} />, noWrapper: true },
    { title: 'Advantages', content: <AdvantagesTable advantages={stats.advantages} /> },
    { title: 'Eliminations', content: <EliminationsTable eliminations={stats.eliminations} /> },
    { title: 'Finals', content: <FinalsStats final={stats.final} fireWin={stats.fireWin} soleSurvivor={stats.soleSurvivor} />, noWrapper: true },
    { title: 'Titles', content: <TitlesTable titles={stats.titles} /> },
  ];

  return (
    <CardContainer>
      <SelectSeason selectDefault />
      <Carousel>
        <span className='pb-2 text-center'>
          <h2 className='text-2xl font-semibold'>Season Stats</h2>
          <DotButtons className='justify-evenly w-full flex h-min p-0' />
        </span>
        <CarouselContent>
          {carouselItems.map((item, index) => (
            <CarouselItem key={index}>
              {item.noWrapper
                ? item.content
                : <StatsSection title={item.title}> {item.content} </StatsSection>}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </CardContainer>
  );
}
