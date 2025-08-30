'use client';

import * as React from 'react';
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

interface ComboboxProps {
  seasons: { value: string; label: string }[];
  value: string;
  setValue: (value: string) => void;
}

export default function SelectSeason({ seasons, value, setValue }: ComboboxProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Ellipsis className='absolute top-3 right-2 h-5 w-5 cursor-pointer' aria-expanded={open} />
      </PopoverTrigger>
      <PopoverContent className='p-0'>
        <Command>
          <CommandInput placeholder='Search seasons...' />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
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
              <CommandItem onSelect={() => router.push('/playground')}>
                <span className='mx-auto text-xs py-0.5'>
                  View All Seasons
                </span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
