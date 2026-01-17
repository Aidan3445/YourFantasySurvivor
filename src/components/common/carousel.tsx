'use client';

import * as React from 'react';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '~/lib/utils';
import { Button } from '~/components/common/button';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '~/components/common/table';

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions & { ignoreKeys?: boolean }
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (_api: CarouselApi) => void
}

export type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (opts?.ignoreKeys) {
          return;
        }

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext, opts]
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);

      return () => {
        api?.off('select', onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role='region'
          aria-roledescription='carousel'
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className='overflow-hidden'>
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role='group'
      aria-roledescription='slide'
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full select-none',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      type='button'
      className={cn(
        'absolute  h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className='h-4 w-4' />
      <span className='sr-only'>Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      type='button'
      className={cn(
        'h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-right-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className='h-4 w-4' />
      <span className='sr-only'>Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = 'CarouselNext';

interface CoverCarouselProps {
  items: {
    header: React.ReactNode
    content: React.ReactNode
    footer?: React.ReactNode
  }[],
  reset?: boolean,
  setReset?: (_reset: boolean) => void
}

function CoverCarousel({ items, reset, setReset }: CoverCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  React.useEffect(() => {
    if (api && reset) {
      api.scrollTo(0);
      setReset?.(false);
    }
  }, [api, reset, setReset]);

  return (
    <Carousel className='relative' setApi={setApi} opts={{ containScroll: false, duration: 20 }}>
      <CarouselContent
        className='ml-0 -mx-2'>
        {items.map((item, index) => {
          const offset = index - (current - 1);
          const absOffset = Math.abs(offset);

          return (
            <CarouselItem
              key={index}
              className={cn(
                'will-change-transform transform-gpu',
                'z-10 transition-all duration-400 drop-shadow-md bg-secondary rounded-md',
                'overflow-x-clip p-0 mb-4 origin-top h-fit overflow-y-clip',
                'basis-[90%] lg:basis-2/3 xl:basis-1/2',
                {
                  'pointer-events-none': offset !== 0,

                  'scale-50 translate-y-2 -z-10 md:blur-[1px] duration-300': absOffset === 1,
                  'translate-x-1/3': offset === -1,
                  '-translate-x-1/3': offset === 1,

                  'scale-[25%] translate-y-4 -z-20 md:blur-[2px] duration-200': absOffset === 2,
                  'translate-x-full': offset === -2,
                  '-translate-x-full': offset === 2,

                  'scale-[12.5%] translate-y-6 -z-30 md:blur-[3px] duration-100': absOffset === 3,
                  'translate-x-[185%]': offset <= -3,
                  '-translate-x-[185%]': offset >= 3,

                  'scale-0 duration-50': absOffset > 3,
                }
              )}>
              <Table className='table-fixed'>
                <TableCaption className='sr-only'>
                  {`Slide ${index + 1} of ${items.length}`}
                </TableCaption>
                <TableHeader>
                  <TableRow className='bg-accent/50 hover:bg-accent/50 border-none px-0'>
                    <TableHead className='text-center w-1/7 px-0 align-bottom sm:align-middle pb-1'>
                      <Button
                        variant={'outline'}
                        type='button'
                        className={cn(
                          'rounded-full z-10 w-min h-min p-1',
                          index === 0 && 'invisible',
                        )}
                        disabled={!api?.canScrollPrev() || index !== current - 1}
                        onClick={() => api?.scrollPrev()}>
                        <ArrowLeft className='h-4 w-4' />
                        <span className='sr-only'>Previous slide</span>
                      </Button>
                    </TableHead>
                    <TableHead className='place-items-center text-center font-normal text-nowrap w-5/7 px-0'>
                      {item.header}
                    </TableHead>
                    <TableHead className='text-center w-1/7 px-0 align-bottom sm:align-middle pb-1'>
                      <Button
                        variant={'outline'}
                        type='button'
                        className={cn(
                          'rounded-full z-10 w-min h-min p-1',
                          index === items.length - 1 && 'invisible',
                        )}
                        disabled={!api?.canScrollNext() || index !== current - 1}
                        onClick={() => api?.scrollNext()}>
                        <ArrowRight className='h-4 w-4' />
                        <span className='sr-only'>Next slide</span>
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className='bg-transparent hover:bg-transparent border-none'>
                    <TableCell colSpan={3} className={cn(
                      'p-0 max-h-52 scrollbar-thin scrollbar-thumb-primary/75 scrollbar-track-secondary',
                      offset === 0 ? 'overflow-y-auto' : 'overflow-hidden')}>
                      {item.content}
                    </TableCell>
                  </TableRow>
                </TableBody>
                {item.footer && (
                  <TableFooter className='border-none'>
                    <TableRow className='bg-b2 hover:bg-b2 border-none'>
                      <TableCell colSpan={3} className='p-0 will-change-transform transform-gpu'>
                        {item.footer}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselProgress current={current} count={items.length} />
    </Carousel>
  );
}

interface CarouselProgressProps {
  current: number
  count: number,
  className?: string
}

function CarouselProgress({ current, count, className }: CarouselProgressProps) {
  if (count <= 1) return null;
  return (
    <div className={cn(
      'absolute bottom-0 left-0 right-0 h-1 bg-secondary/50 rounded-full',
      className
    )}>
      <div
        className={cn(
          'h-full bg-primary rounded-full transition-all ease-linear duration-300',
          className
        )}
        style={{
          width: `${((current - 1) / (count - 1)) * 100}%`,
        }}
      />
    </div>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CoverCarousel,
  CarouselProgress,
  useCarousel,
};
