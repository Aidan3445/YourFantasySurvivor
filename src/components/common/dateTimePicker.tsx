import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '~/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { ScrollArea, ScrollBar } from './scrollArea';

interface DateTimePickerProps {
  defaultValue?: Date;
  date?: Date;
  setDate: (date: Date) => void;
  disabled?: boolean;
  side?: 'top' | 'bottom';
  placeholder?: string;
  rangeStart?: Date;
  rangeEnd?: Date;
}



export function DateTimePicker({ defaultValue, date, setDate, disabled, side, placeholder, rangeStart, rangeEnd }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);


  React.useEffect(() => {
    if (defaultValue) {
      setDate(defaultValue);
    }
  }, [defaultValue, setDate]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (date) {
        selectedDate.setHours(date.getHours());
        selectedDate.setMinutes(date.getMinutes());
      }
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (
    type: 'hour' | 'minute' | 'ampm',
    value: string
  ) => {
    if (date) {
      const newDate = new Date(date);
      if (type === 'hour') {
        newDate.setHours(
          (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
        );
      } else if (type === 'minute') {
        newDate.setMinutes(parseInt(value));
      } else if (type === 'ampm') {
        const currentHours = newDate.getHours();
        newDate.setHours(
          value === 'PM' ? currentHours + 12 : currentHours - 12
        );
      }
      setDate(newDate);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal rounded-full',
            !date && 'text-muted-foreground h-12'
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? (
            format(date, 'MM/dd/yyyy hh:mm aa')
          ) : (
            <span>{placeholder ?? 'Select date and time'}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' side={side}>
        <div className='sm:flex'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(checkDate) => {
              if (rangeStart && checkDate < rangeStart) {
                return true;
              }
              if (rangeEnd && checkDate > rangeEnd) {
                return true;
              }
              return false;
            }}
          />
          <div className='flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x'>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex sm:flex-col p-2'>
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size='icon'
                    variant={
                      date && date.getHours() % 12 === hour % 12
                        ? 'default'
                        : 'ghost'
                    }
                    className='sm:w-full shrink-0 aspect-square'
                    onClick={() => handleTimeChange('hour', hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex sm:flex-col p-2'>
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size='icon'
                    variant={
                      date && date.getMinutes() === minute
                        ? 'default'
                        : 'ghost'
                    }
                    className='sm:w-full shrink-0 aspect-square'
                    onClick={() =>
                      handleTimeChange('minute', minute.toString())
                    }
                  >
                    {minute}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
            <ScrollArea className=''>
              <div className='flex sm:flex-col p-2'>
                {['AM', 'PM'].map((ampm) => (
                  <Button
                    key={ampm}
                    size='icon'
                    variant={
                      date &&
                        ((ampm === 'AM' && date.getHours() < 12) ||
                          (ampm === 'PM' && date.getHours() >= 12))
                        ? 'default'
                        : 'ghost'
                    }
                    className='sm:w-full shrink-0 aspect-square'
                    onClick={() => handleTimeChange('ampm', ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
