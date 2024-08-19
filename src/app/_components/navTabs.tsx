'use client';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from './commonUI/tabs';

export default function NavTabs() {
  const router = useRouter();
  const pathname = usePathname().split('/')[1];

  return (
    <Tabs defaultValue={pathname}>
      <TabsList>
        <TabsTrigger
          value=''
          onClick={() => router.push('/')}>
          Home
        </TabsTrigger>
        <TabsTrigger
          value='leagues'
          onClick={() => router.push('/leagues')}>
          Leagues
        </TabsTrigger>
        <TabsTrigger
          value='playground'
          onClick={() => router.push('/playground')}>
          Playground
        </TabsTrigger>
        <TabsTrigger
          value='seasons'
          onClick={() => router.push('/seasons')}>
          Seasons
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
