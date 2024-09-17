import CardContainer from '~/app/_components/cardContainer';
import { Popover, PopoverCenter, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import { getLeagueSettings } from '~/app/api/leagues/[id]/settings/query';
import { cn } from '~/lib/utils';
import { type LeagueOwnerProps } from '../leagueDetails';
import { Button } from '~/app/_components/commonUI/button';
import Countdown from '~/app/_components/countdown';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import DraftOrder from './draftOrder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';
import { PredictionCard } from './predictionCard';

export default async function DraftInfo({ league, ownerLoggedIn, className }: LeagueOwnerProps) {
  const [settings, { season, weekly }] = await Promise.all([
    getLeagueSettings(league.id),
    getRules(league.id)
  ]);

  //if (settings.draftOver) return null;

  const preseasonPredictions = [
    ...season.filter((rule) => rule.timing === 'premiere'),
    ...weekly.filter((rule) => rule.type === 'predict')];

  const orderLocked = !ownerLoggedIn || settings.draftDate < new Date();

  return (
    <Popover>
      <PopoverCenter />
      <PopoverTrigger className={cn(className, 'hs-in p-1 rounded-md')}>
        Draft
      </PopoverTrigger>
      <PopoverContent>
        <CardContainer className='flex flex-col gap-1 p-6 transition-all'>
          <h2 className='text-2xl font-semibold text-center'>Draft Info</h2>
          <Tabs defaultValue='order'>
            <TabsList className='grid grid-flow-col auto-cols-fr w-full'>
              <TabsTrigger value='order'>Order</TabsTrigger>
              <TabsTrigger value='predictions'>Predictions</TabsTrigger>
            </TabsList>
            <TabsContent value='order'>
              <DraftOrder leagueId={league.id} draftOrder={settings.draftOrder} orderLocked={orderLocked} className='flex flex-col gap-1 w-full' />
            </TabsContent>
            <TabsContent value='predictions'>
              <section className='flex flex-col gap-1 h-80 light-scroll'>
                {preseasonPredictions.map((rule, index) => (
                  <PredictionCard key={index} prediction={rule} parity={index % 2 === 0} />
                ))}
              </section>
            </TabsContent>
          </Tabs>
          <Countdown className='p-1 text-center rounded-md cursor-default bg-b4' endDate={settings.draftDate}>
            <a href={`/leagues/${league.id}/draft`}>
              <Button className='w-full'>Go To Draft</Button>
            </a>
          </Countdown>
        </CardContainer>
      </PopoverContent>
    </Popover>
  );
}

