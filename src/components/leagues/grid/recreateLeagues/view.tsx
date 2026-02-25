'use client';

import { type LeagueDetails } from '~/types/leagues';
import { useEffect, useState } from 'react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '~/components/common/alertDialog';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious } from '~/components/common/carousel';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { Progress } from '~/components/common/progress';
import { Button } from '~/components/common/button';
import { Recycle, X } from 'lucide-react';
import { useCarouselProgress } from '~/hooks/ui/useCarouselProgress';
import ChooseLeague from '~/components/leagues/grid/recreateLeagues/chooseLeague';
import ChooseMembers from '~/components/leagues/grid/recreateLeagues/chooseMembers';

interface RecreateLeaguesProps {
  leagues: LeagueDetails[];
}

export default function RecreateLeagues({ leagues }: RecreateLeaguesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const { api, setApi, current, count } = useCarouselProgress();
  const progress = count > 0 ? (current / (count - 1)) * 100 : 0;

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedHash(null);
      api?.scrollTo(0);
    }
  }, [isOpen, api]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className='flex gap-2 items-center px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all cursor-pointer'>
          <Recycle size={18} className='stroke-primary-foreground shrink-0' />
          <h3 className='text-sm font-bold uppercase tracking-wider text-primary-foreground'>
            Clone League
          </h3>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='sm:w-160 w-96 flex flex-col animate-scale-in-fast'>
        <AlertDialogHeader>
          <span className='flex items-center gap-3 mb-2'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <AlertDialogTitle className='text-2xl font-black uppercase tracking-tight'>
              Clone League
            </AlertDialogTitle>
          </span>
        </AlertDialogHeader>

        <Carousel setApi={setApi} opts={{ watchDrag: false, ignoreKeys: true }}>
          <span className='flex w-full justify-center items-end gap-4 px-2'>
            <CarouselPrevious className='static translate-y-0 border-2 border-primary/30 hover:bg-primary/10' />
            <div className='space-y-2 grow'>
              {count > 0 && (
                <p className='w-full text-center text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Step {current + 1} of {count}
                </p>
              )}
              <Progress className='w-full h-2' value={progress} />
            </div>
            <div className='w-8' />
          </span>

          <CarouselContent className='-ml-14 max-h-[60svh]'>
            {/* Step 1: Select League */}
            <CarouselItem className='pl-14 flex flex-col pt-4'>
              <AlertDialogDescription className='text-base text-left mb-4'>
                Select an inactive league you own to clone into the new season.
              </AlertDialogDescription>
              <ScrollArea className='min-h-[30svh] pr-4'>
                <ChooseLeague
                  leagues={leagues}
                  selectedHash={selectedHash}
                  onSelect={setSelectedHash} />
                <ScrollBar orientation='vertical' forceMount />
              </ScrollArea>
              <Button
                className='m-4 mt-4 w-80 self-center font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transition-all'
                disabled={!selectedHash}
                onClick={() => api?.scrollNext()}>
                Next
              </Button>
            </CarouselItem>

            {/* Step 2: Select Members */}
            <CarouselItem className='pl-14 flex flex-col pt-4'>
              {selectedHash && (
                <ChooseMembers
                  hash={selectedHash}
                  onSuccess={() => setIsOpen(false)} />
              )}
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        <AlertDialogFooter className='absolute top-4 right-4'>
          <AlertDialogCancel className='h-auto w-auto p-2 bg-destructive/10 border-destructive/30 hover:bg-destructive/20'>
            <X className='w-4 h-4 shrink-0' />
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
