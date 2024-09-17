import { Popover, PopoverCenter, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import CardContainer from '~/app/_components/cardContainer';
import { cn } from '~/lib/utils';
import { type LeagueOwnerProps } from '../leagueDetails';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import { Tabs, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';
import EventsForm from './eventForm';

interface LeagueScoringProps extends LeagueOwnerProps {
  openDefault?: boolean;
}

export default async function LeagueScoring({ league, ownerLoggedIn, className, openDefault }: LeagueScoringProps) {
  const rules = await getRules(league.id);

  return (
    <Popover defaultOpen={openDefault}>
      <PopoverCenter />
      <PopoverTrigger className={cn(className, 'hs-in px-2 rounded-md')}>
        Scoring
        {openDefault && <span className='inline-flex ml-2 align-middle rounded-full bg-b2 animate-pulse w-2 h-2' />}
      </PopoverTrigger>
      <PopoverContent>
        <CardContainer className='flex flex-col gap-1 p-6 pb-0 transition-all'>
          <h2 className='text-2xl text-center font-semibold'>League Event Scoring</h2>
          <Tabs defaultValue='base'>
            <TabsList className='w-full grid grid-flow-col md:auto-cols-fr'>
              <TabsTrigger value='base'>Base</TabsTrigger>
              <TabsTrigger value='custom'>Custom</TabsTrigger>
              <TabsTrigger value='weekly'>Weekly</TabsTrigger>
              <TabsTrigger value='season'>Season</TabsTrigger>
            </TabsList>
            <EventsForm leagueId={league.id} rules={rules} ownerLoggedIn={ownerLoggedIn} />
          </Tabs>
        </CardContainer>
      </PopoverContent>
    </Popover>
  );
}

