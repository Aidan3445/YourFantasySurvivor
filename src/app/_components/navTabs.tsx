'use client';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from './commonUI/tabs';

export default function NavTabs() {
  const pathname = usePathname().split('/')[1];

  return (
    <Tabs defaultValue={pathname}>
      <TabsList>
        <a href='/'>
          <TabsTrigger
            value=''>
            Home
          </TabsTrigger>
        </a>
        <a href='/leagues'>
          <TabsTrigger
            value='leagues'>
            Leagues
          </TabsTrigger>
        </a>
        <a href='/seasons'>
          <TabsTrigger
            value='seasons'>
            Seasons
          </TabsTrigger>
        </a>
        <a href='/playground'>
          <TabsTrigger
            value='playground'>
            Playground
          </TabsTrigger>
        </a>
      </TabsList>
    </Tabs>
  );
}
