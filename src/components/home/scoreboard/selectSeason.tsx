'use client';
import { CheckIcon, Ellipsis } from 'lucide-react';

import { cn } from '~/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/common/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/common/popover';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ComboboxProps {
  seasons: { value: string; label: string }[];
  value: string;
  setValue: (value: string) => void;
  someHidden?: boolean;
}

export default function SelectSeason({ seasons, value, setValue, someHidden }: ComboboxProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Ellipsis className='absolute top-3 right-2 h-5 w-5 cursor-pointer' aria-expanded={open} />
      </PopoverTrigger>
      <PopoverContent className='p-0'>
        <Command>
          <CommandInput placeholder='Search seasons...' />
          <CommandList>
            <CommandEmpty>No seasons found.</CommandEmpty>
            <CommandGroup>
              {seasons.map((seasons) => (
                <CommandItem
                  key={seasons.value}
                  value={`${seasons.value}`}
                  onSelect={(currentValue) => {
                    setValue(currentValue === `${value}` ? '' : currentValue);
                    setOpen(false);
                  }}>
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === seasons.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {seasons.label}
                </CommandItem>
              ))}
              {someHidden !== undefined && (
                <CommandItem onSelect={() => router.push('/playground')} className='bg-accent/50'>
                  <span className='mx-auto text-xs py-0.5'>
                    {someHidden ? 'See all seasons' : 'Try scoring playground'}
                  </span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
