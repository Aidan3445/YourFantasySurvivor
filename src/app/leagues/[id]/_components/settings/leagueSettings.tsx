import CardContainer from '~/app/_components/cardContainer';
import { Popover, PopoverCenter, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import { getLeagueSettings } from '~/app/api/leagues/[id]/settings/query';
import { cn } from '~/lib/utils';
import { type LeagueOwnerProps } from '../leagueDetails';
import { Button } from '~/app/_components/commonUI/button';
import Countdown from '~/app/_components/countdown';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import DraftOrder from './draftOrder';

export default async function DraftInfo({ league, ownerLoggedIn, className }: LeagueOwnerProps) {
  const [settings, { season, weekly }] = await Promise.all([
    getLeagueSettings(league.id),
    getRules(league.id)
  ]);

  const preseasonPredictions = {
    season: season.filter((rule) => rule.timing === 'premiere'),
    weekly: weekly.filter((rule) => rule.type === 'predict')
  };

  console.log(preseasonPredictions);

  return (
    <Popover>
      <PopoverCenter />
      <PopoverTrigger className={cn(className, 'hs-in px-2 rounded-md')}>
        Draft
      </PopoverTrigger>
      <PopoverContent>
        <CardContainer className='flex flex-col gap-1 p-6 transition-all'>
          <h2 className='text-2xl text-center font-semibold'>Draft Info</h2>
          <DraftOrder leagueId={league.id} draftOrder={settings.draftOrder} ownerLoggedIn={ownerLoggedIn} className='w-full flex flex-col gap-1' />
          <Countdown className='text-center hs-in rounded-md p-1' endDate={settings.draftDate}>
            <Button className='w-full'>Go To Draft</Button>
          </Countdown>
        </CardContainer>
      </PopoverContent>
    </Popover>
  );
}
