import { type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import AdvantageScoreSettings from '~/components/leagues/customization/events/base/advantages';
import ChallengeScoreSettings from '~/components/leagues/customization/events/base/challenges';
import OtherScoreSettings from '~/components/leagues/customization/events/base/other';

interface BaseEventRuleTabsProps {
  rightSide?: ReactNode;
  locked?: boolean;
}

export default function BaseEventRuleTabs({ rightSide, locked: disabled }: BaseEventRuleTabsProps) {
  return (
    <Tabs defaultValue='challenges' className='h-108 mt-2'>
      <TabsList className='w-full grid grid-cols-3'>
        <TabsTrigger value='challenges'>Challenges</TabsTrigger>
        <TabsTrigger value='advantages'>Advantages</TabsTrigger>
        <TabsTrigger value='other'>Other</TabsTrigger>
      </TabsList>
      <span className='flex'>
        <TabsContent value='challenges'>
          <ChallengeScoreSettings disabled={disabled} />
        </TabsContent>
        <TabsContent value='advantages'>
          <AdvantageScoreSettings disabled={disabled} />
        </TabsContent>
        <TabsContent value='other'>
          <OtherScoreSettings disabled={disabled} />
        </TabsContent>
        {rightSide}
      </span>
    </Tabs>
  );
}
