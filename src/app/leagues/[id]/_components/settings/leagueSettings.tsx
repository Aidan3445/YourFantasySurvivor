import CardContainer from '~/app/_components/cardContainer';
import { Popover, PopoverCenter, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import { getLeagueSettings } from '~/app/api/leagues/[id]/settings/query';
import { cn, type ComponentProps } from '~/lib/utils';
import { type LeagueOwnerProps } from '../leagueDetails';
import { Button } from '~/app/_components/commonUI/button';
import Countdown from '~/app/_components/countdown';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import DraftOrder from './draftOrder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { type WeeklyEventRuleType } from '~/server/db/schema/weeklyEvents';

export default async function DraftInfo({ league, ownerLoggedIn, className }: LeagueOwnerProps) {
  const [settings, { season, weekly }] = await Promise.all([
    getLeagueSettings(league.id),
    getRules(league.id)
  ]);

  const preseasonPredictions = [
    ...season.filter((rule) => rule.timing === 'premiere'),
    ...weekly.filter((rule) => rule.type === 'predict')];

  console.log(preseasonPredictions);

  const orderLocked = !ownerLoggedIn || settings.draftDate < new Date();

  return (
    <Popover>
      <PopoverCenter />
      <PopoverTrigger className={cn(className, 'hs-in p-1 rounded-md')}>
        Draft
      </PopoverTrigger>
      <PopoverContent>
        <CardContainer className='flex flex-col gap-1 p-6 transition-all'>
          <h2 className='text-2xl text-center font-semibold'>Draft Info</h2>
          <Tabs defaultValue='order'>
            <TabsList className='w-full grid grid-flow-col auto-cols-fr'>
              <TabsTrigger value='order'>Order</TabsTrigger>
              <TabsTrigger value='predictions'>Predictions</TabsTrigger>
            </TabsList>
            <TabsContent value='order'>
              <DraftOrder leagueId={league.id} draftOrder={settings.draftOrder} orderLocked={orderLocked} className='w-full flex flex-col gap-1' />
            </TabsContent>
            <TabsContent value='predictions'>
              <section className='light-scroll h-80 flex flex-col gap-1'>
                {preseasonPredictions.map((rule, index) => (
                  <PredictionInfo key={index} prediction={rule} parity={index % 2 === 0} />
                ))}
              </section>
            </TabsContent>
          </Tabs>
          <Countdown className='text-center hs-in rounded-md p-1' endDate={settings.draftDate}>
            <Button className='w-full'>Go To Draft</Button>
          </Countdown>
        </CardContainer>
      </PopoverContent>
    </Popover>
  );
}

interface PredictionInfoProps extends ComponentProps {
  prediction: SeasonEventRuleType | WeeklyEventRuleType;
  parity: boolean;
}

function PredictionInfo({ prediction, parity }: PredictionInfoProps) {
  return (
    <div className={cn(parity ? 'bg-b4/80' : 'bg-b3/80', 'p-2 rounded-md')}>
      <p>Predict {prediction.name} for {prediction.points} points.</p>
      <p className='text-xs italic'>Choose a {prediction.referenceType}</p>
    </div >
  );
}
