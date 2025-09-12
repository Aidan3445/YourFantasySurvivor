import DraftCastaways from '~/components/leagues/draft/draftCastaways';
import { type LeaguePageProps } from '~/app/leagues/[hash]/layout';
import DraftTracker from '~/components/leagues/draft/draftTracker';
import { DynamicTabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';

// import { leaguesService as QUERIES } from '~/services/leagues';
// import LeagueChatCard from '~/components/leagues/chat/card';

/*
export default async function DraftPage({ params }: LeaguePageProps) {
  const { hash } = await params;
  const chatHistory = await QUERIES.getChatHistory(hash);

  return (
    <main className='flex gap-6 md:w-[calc(100svw-var(--sidebar-width))] md:p-2 pb-0 md:h-auto'>
      <DynamicTabs
        className='w-full shadow-lg md:bg-secondary rounded-3xl md:border md:h-[calc(100svh-5rem)] md:overflow-hidden'
        defaultValue='draft'
        rules={[{ tabName: 'chat', maxWidth: '1024px' }]}>
        <TabsList className='sticky top-10 md:static flex w-full px-10 rounded-none z-50'>
          <TabsTrigger className='flex-1' value='draft'>Draft</TabsTrigger>
          <TabsTrigger className='flex-1' value='castaways'>Castaways</TabsTrigger>
          <TabsTrigger className='flex-1 lg:hidden' value='chat'>Chat</TabsTrigger>
        </TabsList>
        <ScrollArea className='md:h-full h-[calc(100svh-7.5rem)] overflow-y-visible @container/tabs-content'>
          <TabsContent value='draft' className='mt-0'>
            <DraftTracker hash={hash} />
          </TabsContent>
          <TabsContent value='castaways' className='m-4'>
            <DraftCastaways hash={hash} />
          </TabsContent>
          <TabsContent value='chat' className='m-2 mt-0'>
            <LeagueChatCard className='w-full px-2 h-[calc(100svh-8.5rem)]' chatHistory={chatHistory} defaultOpen />
          </TabsContent>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </DynamicTabs>
      <LeagueChatCard className='hidden lg:block' chatHistory={chatHistory} defaultOpen />
    </main>
  );
}
*/

export default async function DraftPage({ params }: LeaguePageProps) {
  const { hash } = await params;
  // const chatHistory = await QUERIES.getChatHistory(hash);

  return (
    <main className='flex gap-6 md:w-[calc(100svw-var(--sidebar-width))] md:p-2 pb-0 md:h-auto'>
      <DynamicTabs
        className='w-full shadow-lg md:bg-secondary rounded-3xl md:border md:h-[calc(100svh-5rem)] md:overflow-hidden'
        defaultValue='draft'
        rules={[
          //{ tabName: 'chat', maxWidth: '1024px' }
          ]}>
        <TabsList className='sticky top-10 md:static flex w-full px-10 rounded-none z-50'>
          <TabsTrigger className='flex-1' value='draft'>Draft</TabsTrigger>
          <TabsTrigger className='flex-1' value='castaways'>Castaways</TabsTrigger>
          {/*
            <TabsTrigger className='flex-1 lg:hidden' value='chat'>Chat</TabsTrigger> 
          */}
        </TabsList>
        <ScrollArea className='md:h-full h-[calc(100svh-7.5rem)] overflow-y-visible @container/tabs-content'>
          <TabsContent value='draft' className='mt-0'>
            <DraftTracker hash={hash} />
          </TabsContent>
          <TabsContent value='castaways' className='m-4'>
            <DraftCastaways hash={hash} />
          </TabsContent>
          {/* 
            <TabsContent value='chat' className='m-2 mt-0'>
              <LeagueChatCard className='w-full px-2 h-[calc(100svh-8.5rem)]' chatHistory={chatHistory} defaultOpen /> 
            </TabsContent>
          */}
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </DynamicTabs>
      {/* 
        <LeagueChatCard className='hidden lg:block' chatHistory={chatHistory} defaultOpen /> 
      */}
    </main>
  );
}
