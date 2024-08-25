'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/app/_components/commonUI/select';

export interface SelectSeasonProps {
  className?: string;
  selectDefault?: boolean;
}

export default function SelectSeason({ className, selectDefault = false }: SelectSeasonProps) {
  const [seasons, setSeasons] = useState<string[]>([]);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    fetch('/api/seasons')
      .then((res) => res.json())
      .then((data: string[]) => {
        setSeasons(data);
      })
      .catch((err) => console.error(err));
  }, [router, params]);

  const updateSeason = (newSeason: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('season', newSeason);
    router.push(url.search, { scroll: false });
  };

  let season = params.get('season') ?? '';
  // if select default then set the first season as default
  if (selectDefault && !season) {
    season = seasons[0] ?? '';
  }

  return (
    <Select defaultValue={season} value={season} onValueChange={(value) => updateSeason(value)}>
      <SelectTrigger className={className}>
        <br />
        <SelectValue placeholder='Select Season' defaultValue={'fdfdf'} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Select Season</SelectLabel>
          {seasons?.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select >
  );
}
