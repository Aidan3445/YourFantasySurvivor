import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/app/_components/commonUI/select';

interface SelectSeasonProps {
  season: string;
  setSeason: (season: string) => void;
}

export default function SelectSeason({ season, setSeason }: SelectSeasonProps) {
  const [seasons, setSeasons] = useState<string[]>([]);

  useEffect(() => {
    'use client';

    fetch('/api/seasons')
      .then((res) => res.json())
      .then((data: string[]) => {
        setSeasons(data);
        setSeason(data[0] ?? '');
      })
      .catch((err) => console.error(err));
  }, [setSeason]);

  return (
    <Select defaultValue={season} value={season} onValueChange={setSeason}>
      <SelectTrigger className='self-center m-2 w-3/4 font-semibold hs-in'>
        <br />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className='border-black bg-b4'>
        {seasons?.map((s) => <SelectItem className='hover:bg-b3' key={s} value={s}>{s}</SelectItem>)}
      </SelectContent>
    </Select >
  );
}
