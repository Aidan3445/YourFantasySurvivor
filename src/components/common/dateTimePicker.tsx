'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from '~/components/common/button';
import { Calendar } from '~/components/common/calendar';
import { Input } from '~/components/common/input';
import { Label } from '~/components/common/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/common/popover';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (_date: Date) => void;
  rangeStart?: Date;
  rangeEnd?: Date;
}

export function DateTimePicker({ value, onChange, rangeStart, rangeEnd }: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);

  return (
    <div className='flex gap-4'>
      <div className='flex flex-col gap-3'>
        <Label htmlFor='date-picker' className='px-1'>
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='accent'
              id='date-picker'
              className='w-32 justify-between font-normal'>
              {date ? date.toLocaleDateString() : 'Select date'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0 z-51' align='start'>
            <Calendar
              mode='single'
              selected={date}
              captionLayout='dropdown'
              onSelect={(date) => {
                setDate(date);
                if (date && onChange) onChange(date);
                setOpen(false);
              }}
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
          </PopoverContent>
        </Popover>
      </div>
      <div className='flex flex-col gap-3'>
        <Label htmlFor='time-picker' className='px-1'>
          Time
        </Label>
        <Input
          type='time'
          id='time-picker'
          step='1'
          value={date ? date.toTimeString().split(' ')[0] : ''}
          className='appearance-none rounded-md [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
          onChange={(e) => {
            if (date) {
              const [hours, minutes, seconds] = e.target.value.split(':').map(Number);
              const newDate = new Date(date);
              newDate.setHours(hours!, minutes, seconds);
              setDate(newDate);
              if (onChange) onChange(newDate);
            }
          }}
        />
      </div>
    </div>
  );
}

