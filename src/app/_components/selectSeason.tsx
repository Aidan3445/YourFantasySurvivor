'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/app/_components/commonUI/select';
import { cn } from '~/lib/utils';

export interface SelectSeasonProps {
  className?: string;
}

export default function SelectSeason({ className }: SelectSeasonProps) {
  const [seasons, setSeasons] = useState<string[]>([]);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    fetch('/api/seasons')
      .then((res) => res.json())
      .then((data: string[]) => {
        setSeasons(data);
        if (!params.has('season')) router.push(`?season=${data[0]}`, { scroll: false });
      })
      .catch((err) => console.error(err));
  }, [router, params]);

  const season = params.get('season')!;

  const updateSeason = (newSeason: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('season', newSeason);
    router.push(url.search, { scroll: false });
  };

  return (
    <Select defaultValue={season} value={season} onValueChange={(value) => updateSeason(value)}>
      <SelectTrigger className={cn('self-center m-2 w-3/4 font-semibold hs-in', className)}>
        <br />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className='border-black bg-b4'>
        {seasons?.map((s) => <SelectItem className='hover:bg-b3' key={s} value={s}>{s}</SelectItem>)}
      </SelectContent>
    </Select >
  );
}
