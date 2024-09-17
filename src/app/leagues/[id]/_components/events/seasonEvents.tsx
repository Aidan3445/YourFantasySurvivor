'use client';
import { CopyPlus, SquareX } from 'lucide-react';
import { Input } from '~/app/_components/commonUI/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { cn, type ComponentProps } from '~/lib/utils';
import { useState } from 'react';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { Textarea } from '~/app/_components/commonUI/textArea';
import { Separator } from '~/app/_components/commonUI/separator';
import { type EventsProps } from './eventForm';
import { Label } from '~/app/_components/commonUI/label';

export default function SeasonEvents({ className, form, freeze, setUnsaved }: EventsProps) {
  const seasonEvents = form.watch('season');

  const updateEvent = (
    event: SeasonEventRuleType,
    action: 'copy' | 'delete' | 'update',
    eventIndex: number) => {
    const newEvents = [...seasonEvents];

    switch (action) {
      case 'copy':
        newEvents.push({ ...event, id: undefined, name: '' });
        break;
      case 'delete':
        newEvents.splice(eventIndex, 1);
        break;
      case 'update':
        newEvents[eventIndex] = event;
        break;
    }

    form.setValue('season', newEvents);
  };

  const newEvent = (value: keyof typeof SeasonTemplates) => {
    form.setValue('season', [...seasonEvents, { ...SeasonTemplates[value] }]);
    setUnsaved && setUnsaved();
  };

  return (
    <article className={cn('light-scroll h-96 pb-16', className)}>
      <section className='flex flex-col'>
        {seasonEvents.map((event, index) => (
          <SeasonEvent key={index} event={event} eventIndex={index} updateEvent={freeze ? undefined : updateEvent} />
        ))}
        {seasonEvents.length === 0 && <h4 className='text-lg font-normal text-gray-700'>No season events</h4>}
      </section>
      {!freeze &&
        <Select value='' onValueChange={newEvent}>
          <SelectTrigger>
            <SelectValue placeholder='New Season Event' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='new'>New</SelectItem>
            <SelectGroup>
              <SelectLabel>Examples</SelectLabel>
              <SelectItem value='soleSurvivor'>Sole Survivor</SelectItem>
              <SelectItem value='firstBoot'>First Boot</SelectItem>
              <SelectItem value='firstLoser'>First Loser</SelectItem>
              <SelectItem value='tribeBeast'>Beast Tribe</SelectItem>
              <SelectItem value='individualBeast'>Beast Castaway</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>}
    </article>
  );
}

interface SeasonEventProps extends ComponentProps {
  event: SeasonEventRuleType;
  eventIndex: number;
  updateEvent?: (
    event: SeasonEventRuleType,
    action: 'copy' | 'delete' | 'update',
    eventIndex: number) => void;
}

export function SeasonEvent({ event, eventIndex, updateEvent, className }: SeasonEventProps) {
  const [newEvent, setNewEvent] = useState(event);

  const updateReferenceType = (value: string): SeasonEventRuleType => {
    if (value === 'castaway' || value === 'tribe' || value === 'member') {
      return { ...newEvent, referenceType: value };
    }

    return newEvent;
  };

  const saveEvent = (changedEvent: SeasonEventRuleType) => {
    updateEvent?.(changedEvent, 'update', eventIndex);
    setNewEvent(changedEvent);
  };

  const deleteEvent = () => {
    updateEvent?.(newEvent, 'delete', eventIndex);
  };

  const copyEvent = () => {
    updateEvent?.(newEvent, 'copy', eventIndex);
  };

  return (
    <article className={cn('flex flex-col gap-2 mr-2', className, updateEvent ?? 'pointer-events-none')}>
      <span className='flex gap-2 items-center'>
        <div className='w-full'>
          <Label>Event Name</Label>
          <Input
            type='text'
            placeholder='Event Name'
            value={newEvent.name}
            onChange={(e) => saveEvent({ ...newEvent, name: e.target.value })} />
        </div>
        {updateEvent &&
          <span className='flex gap-2'>
            <CopyPlus className='inline-flex mt-6 align-middle rounded-md' size={24} onClick={copyEvent} />
            <SquareX className='inline-flex mt-6 align-middle rounded-md' size={24} onClick={deleteEvent} />
          </span>}
      </span>
      <span className='flex gap-2 items-center'>
        <div>
          <Label>Points</Label>
          <Input
            type='number'
            placeholder='Points'
            value={newEvent.points}
            onChange={(e) => saveEvent({ ...newEvent, points: parseInt(e.target.value) })} />
        </div>
        <div className='w-full'>
          <Label>Reference Type</Label>
          <Select value={event.referenceType} onValueChange={(value) => saveEvent(updateReferenceType(value))}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Vote for</SelectLabel>
                <SelectItem value='castaway'>Castaway</SelectItem>
                <SelectItem value='tribe'>Tribe</SelectItem>
                <SelectItem value='member'>Member</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </span>
      <div>
        <Label>Timing</Label>
        <Select value={event.timing ?? ''} onValueChange={(value) => saveEvent({ ...newEvent, timing: value as 'premiere' | 'merge' | 'finale' })}>
          <SelectTrigger className='mt-0 w-full'>
            <SelectValue placeholder='Timing' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Timing</SelectLabel>
              <SelectItem value='premiere'>Premiere</SelectItem>
              <SelectItem value='merge'>Merge</SelectItem>
              <SelectItem value='finale'>Finale</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          className='w-full'
          placeholder='Description (Optional)'
          value={newEvent.description}
          onChange={(e) => saveEvent({ ...newEvent, description: e.target.value })} />
      </div>
      <Separator className='mb-2' />
    </article >
  );
}

// example event templates below
const blankEvent: SeasonEventRuleType = {
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway',
  timing: 'premiere',
};

const soleSurvivor: SeasonEventRuleType = {
  name: 'Sole Survivor',
  points: 10,
  description: 'Predict the winner of the season.',
  referenceType: 'castaway',
  timing: 'merge',
};

const firstBoot: SeasonEventRuleType = {
  name: 'First Boot',
  points: 5,
  description: 'Predict the first boot of the season.',
  referenceType: 'castaway',
  timing: 'premiere',
};

const firstLoser: SeasonEventRuleType = {
  name: 'First Loser',
  points: 5,
  description: 'Predict the first league member to have their castaway eliminated.',
  referenceType: 'member',
  timing: 'premiere',
};

const tribeBeast: SeasonEventRuleType = {
  name: 'Beast Tribe',
  points: 5,
  description: 'Predict the tribe that wins the most challenges.',
  referenceType: 'tribe',
  timing: 'premiere',
};

const individualBeast: SeasonEventRuleType = {
  name: 'Beast Castaway',
  points: 5,
  description: 'Predict the castaway that wins the most individual challenges.',
  referenceType: 'castaway',
  timing: 'merge',
};

const SeasonTemplates = {
  new: blankEvent,
  soleSurvivor,
  firstBoot,
  firstLoser,
  tribeBeast,
  individualBeast,
};

