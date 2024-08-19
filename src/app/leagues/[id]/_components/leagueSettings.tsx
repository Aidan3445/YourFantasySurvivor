import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import CardContainer from '~/app/_components/cardContainer';
import { cn } from '~/lib/utils';
import { type LeagueOwnerProps } from './leagueDetails';
import { getSettings } from '~/app/api/leagues/query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';
import { type ReactNode } from 'react';

export default async function LeagueSettings({ league, ownerLoggedIn, className }: LeagueOwnerProps) {
  const settings = await getSettings(league.id);

  const openDefault = !settings.base || !settings.draft;

  return (
    <Popover defaultOpen={openDefault}>
      <PopoverTrigger className={cn(className, 'hs-in p-1 rounded-md')}>
        Settings
      </PopoverTrigger>
      <PopoverContent>
        <CardContainer className='flex flex-col gap-1 p-6 transition-all'>
          <h2 className='text-lg text-center font-semibold'>League Settings</h2>
          <Tabs defaultValue='base'>
            <TabsList className='w-full grid grid-cols-5'>
              <TabsTrigger value='base'>Base</TabsTrigger>
              <TabsTrigger value='custom'>Custom</TabsTrigger>
              <TabsTrigger value='weekly'>Weekly</TabsTrigger>
              <TabsTrigger value='season'>Season</TabsTrigger>
              <TabsTrigger value='draft'>Draft</TabsTrigger>
            </TabsList>
            <Tab value='base'>
              <article>
                BASE EVENTS
              </article>
              <article>
                Base events are added automatically when they
                occur in an episode. You can customize the points
                each event is worth.
                <br />
                If you disagree with the automatic
                event, you can override it in the score entry page.
              </article>
            </Tab>
          </Tabs>
        </CardContainer>
      </PopoverContent>
    </Popover>
  );
}

interface TabProps {
  value: string;
  children: ReactNode;
}

function Tab({ children }: TabProps) {
  return (
    <TabsContent value='base'>
      <section className='flex max-w-screen-sm'>
        {children}
      </section>
    </TabsContent>
  );
}


