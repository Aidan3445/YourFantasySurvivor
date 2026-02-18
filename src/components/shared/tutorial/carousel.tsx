'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselPrevious } from '~/components/common/carousel';
import { Button } from '~/components/common/button';
import { Progress } from '~/components/common/progress';
import { useCarouselProgress } from '~/hooks/ui/useCarouselProgress';
import { TorchIcon, UserIcon, PointsIcon, PlaygroundIcon, LeaguesIcon } from '~/components/icons/generated';
import { cn } from '~/lib/utils';
import {
  TrendingUp, HelpCircle, Coins,
  Users, Dices, ArrowLeftRight, Rocket, Settings,
  HandMetal,
  MousePointerClick,
} from 'lucide-react';

// Each slide maps a custom icon (left) + lucide accent icon (badges/inline)
const SLIDES = [
  {
    icon: TorchIcon,
    accentIcon: HandMetal,
    color: 'fill-primary',
    stroke: 'stroke-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    badgeColor: 'bg-primary/15 text-primary border-primary/30',
    title: 'Welcome to Trial by Fire',
    subtitle: 'Your Fantasy Survivor experience',
    body: 'Draft castaways, earn points, make predictions, and compete with friends across the entire season.',
  },
  {
    icon: UserIcon,
    iconStrokeWidth: 0.5,
    accentIcon: MousePointerClick,
    color: 'fill-amber-500 stroke-amber-500',
    stroke: 'stroke-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    badgeColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    title: 'Draft Your Survivor',
    subtitle: 'Your main castaway',
    body: 'Each player in your league drafts one castaway. Only you earn points for everything they do. No one else can pick your player.',
    customizable: 'Your league can customize point values for challenges, idols, advantages, and more. Commissioners can also create custom events that they score and track manually.',
  },
  {
    icon: PointsIcon,
    accentIcon: TrendingUp,
    color: 'fill-emerald-500',
    stroke: 'stroke-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    badgeColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    title: 'Build Your Streak',
    subtitle: 'Bonus points that grow each episode',
    body: 'Every episode your survivor stays in the game, you earn escalating bonus points: 1, then 2, then 3, and so on. The longer they last, the more you earn.',
    customizable: 'Your league can set a streak cap (e.g. max 5 pts/episode), leave it unlimited, or disable streaks entirely.',
    detail: [
      { label: 'Episode 1', value: '+1 pt' },
      { label: 'Episode 2', value: '+2 pts' },
      { label: 'Episode 3', value: '+3 pts' },
      { label: 'Episode 4', value: '+4 pts' },
      { label: 'Episode 5+', value: '+5 pts (if capped)' },
    ],
  },
  {
    icon: PlaygroundIcon,
    accentIcon: HelpCircle,
    color: 'fill-purple-500',
    stroke: 'stroke-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    badgeColor: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
    title: 'Make Predictions',
    subtitle: 'Call the shots each episode',
    body: 'Before each episode, predict what will happen. Correct predictions earn you bonus points on top of your survivor\'s score.',
    customizable: 'Your league chooses which events can be predicted and when. Predict the winner at the draft, merge, or finale. Predict tribe challenge winners pre-merge, individual winners post-merge. Commissioners can also create custom predictions.',
  },
  {
    icon: PointsIcon,
    accentIcon: Coins,
    color: 'fill-amber-500',
    stroke: 'stroke-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    badgeColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    title: 'Place Your Bets',
    subtitle: 'Wager points on your predictions',
    body: 'Once betting opens, wager points you\'ve earned throughout the season on predictions. If you\'re right, you gain those points on top of the base score. If you miss, you lose the wager.',
    customizable: 'Your league controls when betting activates (e.g. at the merge or a custom episode), the max points per bet, how many bets per week, and which prediction events are bettable. Betting can also be disabled entirely.',
  },
  {
    icon: UserIcon,
    iconStrokeWidth: 0.5,
    accentIcon: Users,
    color: 'fill-blue-500 stroke-blue-500',
    stroke: 'stroke-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    badgeColor: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    title: 'Pick a Secondary',
    subtitle: 'A second castaway for bonus points',
    body: 'Each episode, choose a secondary player. Multiple people can pick the same one. Unlike your main survivor, your secondary doesn\'t earn streak points. You can still pick one even if your main has been eliminated.',
    customizable: 'Your league controls the points multiplier (50% or full), the lockout period before re-picking the same player (or never repeat), whether you can pick your own survivor, and whether picks are visible to others before the episode airs.',
    tag: 'NEW',
  },
  {
    icon: LeaguesIcon,
    accentIcon: Dices,
    color: 'fill-red-500',
    stroke: 'stroke-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    badgeColor: 'bg-red-500/15 text-red-500 border-red-500/30',
    title: 'Shot in the Dark',
    subtitle: 'A last-ditch play to save your streak',
    body: 'Think your survivor is going home? Play your Shot in the Dark before the episode airs. If they do get voted out, you keep your streak bonus when you pick a new player. You only get one per league, use it wisely.',
    customizable: 'Your league can enable or disable Shot in the Dark. It requires survival streaks to be active.',
    tag: 'NEW',
  },
  {
    icon: PlaygroundIcon,
    accentIcon: ArrowLeftRight,
    color: 'fill-cyan-500',
    stroke: 'stroke-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    badgeColor: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30',
    title: 'Switch Your Pick',
    subtitle: 'Swap before it\'s too late',
    body: 'You can change your main survivor at any time before they\'re eliminated. But be careful: once you drop them, someone else can scoop them up.',
    customizable: 'Your league controls whether voluntary switches preserve your streak or reset it to zero.',
  },
  {
    icon: TorchIcon,
    accentIcon: Rocket,
    color: 'fill-primary',
    stroke: 'stroke-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    badgeColor: 'bg-primary/15 text-primary border-primary/30',
    title: 'Survivors Ready...',
    subtitle: 'Time to outwatch, outpredict, outscore',
    body: 'Join a league, draft your survivor, and start competing. May the best fantasy player win.',
    cta: true,
  },
];

interface TutorialCarouselProps {
  onComplete?: () => void;
  showCustomization?: boolean;
}

export default function TutorialCarousel({ onComplete, showCustomization = true }: TutorialCarouselProps) {
  const { api, setApi, current, count } = useCarouselProgress();
  const progress = count > 0 ? (current / (count - 1)) * 100 : 0;

  return (
    <Carousel setApi={setApi} opts={{ watchDrag: true }}>
      {/* Progress bar */}
      <span className='flex w-full items-end gap-4 px-2 mb-1'>
        <CarouselPrevious className='static translate-y-0 border-2 border-primary/30 hover:bg-primary/10' />
        <div className='space-y-2 grow'>
          {count > 0 && (
            <p className='w-full text-center text-sm font-bold uppercase tracking-wider text-muted-foreground'>
              {current + 1} of {count}
            </p>
          )}
          <Progress className='w-full h-2' value={progress} />
        </div>
        {/* Spacer to balance the back button */}
        <div className='w-8' />
      </span>

      <CarouselContent className='-ml-14'>
        {SLIDES.map((s, i) => {
          const SlideIcon = s.icon;
          const SlideAccent = s.accentIcon;
          return (
            <CarouselItem key={i} className='pl-14 flex flex-col pt-4'>
              <div className='flex flex-col items-center text-center gap-4 px-4 pb-4 min-h-72'>
                {/* Icon cluster */}
                <div className={cn(
                  'relative flex items-center justify-center w-20 h-20 rounded-2xl border-2',
                  s.bgColor, s.borderColor,
                  'transition-all duration-300'
                )}>
                  <SlideIcon size={40} className={s.color} strokeWidth={s.iconStrokeWidth} />
                  <div className={cn(
                    'absolute -bottom-2 -right-2 flex items-center justify-center',
                    'w-7 h-7 rounded-full border-2 bg-card',
                    s.borderColor
                  )}>
                    <SlideAccent className={cn('w-3.5 h-3.5', s.stroke)} />
                  </div>
                </div>

                {/* Tag badge */}
                {s.tag && (
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold uppercase tracking-wider border',
                    s.badgeColor
                  )}>
                    {s.tag}
                  </span>
                )}

                {/* Title */}
                <div className='space-y-1'>
                  <h3 className='text-xl font-black uppercase tracking-tight'>
                    {s.title}
                  </h3>
                  <p className={cn('text-sm font-semibold', s.color)}>
                    {s.subtitle}
                  </p>
                </div>

                {/* Body */}
                <p className='text-base text-muted-foreground leading-relaxed max-w-sm'>
                  {s.body}
                </p>

                {/* Customizable callout */}
                {showCustomization && s.customizable && (
                  <div className={cn(
                    'bg-accent/50 flex items-start gap-2.5 w-full rounded-lg border-2 border-dashed p-3 text-left',
                    s.borderColor
                  )}>
                    <Settings className={cn('w-4 h-4 shrink-0 mt-0.5', s.stroke)} />
                    <p className='text-sm text-muted-foreground leading-snug'>
                      {s.customizable}
                    </p>
                  </div>
                )}

                {/* Optional detail chips */}
                {s.detail && (
                  <div className={cn(
                    'w-full max-w-xs rounded-lg border-2 p-2 divide-y',
                    s.borderColor, `divide-${s.borderColor.replace('border-', '')}`
                  )}>
                    {s.detail.map((d, j) => (
                      <div key={j} className='flex items-center justify-between py-1.5 px-1'>
                        <span className='text-sm text-muted-foreground'>{d.label}</span>
                        <span className={cn('text-sm font-bold', s.color)}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {/* Next button (not on last slide) */}
      <div className='flex justify-center px-6 pb-2'>
        {/* CTA on last slide */}
        {api?.canScrollNext() ? (
          <Button
            className='w-full max-w-xs font-bold uppercase text-sm tracking-wider'
            onClick={() => api.scrollNext()}>
            Next
          </Button>
        ) : (
          <Button
            className='w-full max-w-xs font-bold uppercase text-sm tracking-wider'
            onClick={onComplete}>
            Go!
          </Button>
        )}
      </div>
    </Carousel>
  );
}
