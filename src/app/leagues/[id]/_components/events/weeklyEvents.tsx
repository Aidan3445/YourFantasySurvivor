'use client';

import { CopyPlus, SquareX } from 'lucide-react';
import { Input } from '~/app/_components/commonUI/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { cn } from '~/lib/utils';
import { useEffect, useState } from 'react';
import { type WeeklyEventRuleType } from '~/server/db/schema/weeklyEvents';
import { Textarea } from '~/app/_components/commonUI/textArea';
import { Separator } from '~/app/_components/commonUI/separator';
import { type EventsProps } from './eventForm';


export default function WeeklyEvents({ className, form }: EventsProps) {
  const [weeklyEvents, setWeeklyEvents] = useState(form.getValues().weekly);

  const updateEvent = (event: WeeklyEventRuleType | null, eventId: number | null) => {
    const newEvents = [...weeklyEvents];

    if (eventId === null && !event) return;
    else if (eventId === null && event) newEvents.push(event);
    else if (!event) newEvents.splice(eventId!, 1);
    else newEvents[eventId!] = event;

    setWeeklyEvents(newEvents);
  };

  useEffect(() => {
    form.setValue('weekly', [...weeklyEvents]);
  }, [form, weeklyEvents]);

  const newEvent = (value: string) => {
    let event: WeeklyEventRuleType;

    switch (value) {
      case 'confessional':
        event = confessionalEvent;
        break;
      case 'challengeMVP':
        event = challengeMVPEvent;
        break;
      case 'blindside':
        event = orchestrateBlindsideEvent;
        break;
      default:
        event = blankEvent;
    }

    setWeeklyEvents([...weeklyEvents, event]);
  };

  return (
    <article className={cn('light-scroll h-96 pb-16', className)}>
      <section className='flex flex-col'>
        {weeklyEvents.map((event, index) => (
          <WeeklyEvent key={index} event={event} eventId={index} updateEvent={updateEvent} />
        ))}
      </section>
      <Select value='' onValueChange={newEvent}>
        <SelectTrigger>
          <SelectValue placeholder='New Weekly Event' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='vote'>New Vote</SelectItem>
          <SelectItem value='prediction'>New Prediction</SelectItem>
          <SelectItem value='confessional'>Confessional</SelectItem>
          <SelectItem value='challengeMVP'>Challenge MVP</SelectItem>
          <SelectItem value='blindside'>Orchestrate Blindside</SelectItem>
        </SelectContent>
      </Select>
    </article>
  );
}

interface WeeklyEventProps {
  event: WeeklyEventRuleType;
  eventId: number;
  updateEvent: (event: WeeklyEventRuleType | null, eventId: number | null) => void;
}

function WeeklyEvent({ event, eventId, updateEvent }: WeeklyEventProps) {
  const [newEvent, setNewEvent] = useState(event);

  const updateReferenceType = (value: string): WeeklyEventRuleType => {
    if (value === 'castaway' || value === 'tribe' || value === 'member') {
      return { ...newEvent, referenceType: value };
    }

    return newEvent;
  };

  const saveEvent = (changedEvent: WeeklyEventRuleType) => {
    updateEvent(changedEvent, eventId);
    setNewEvent(changedEvent);
  };

  const deleteEvent = () => {
    updateEvent(null, eventId);
  };

  const copyEvent = () => {
    updateEvent(newEvent, null);
  };

  return (
    <article className='flex flex-col mr-2'>
      <span className='flex gap-2 items-center'>
        <Input
          className='w-3/4'
          type='text'
          placeholder='Event Name'
          value={newEvent.name}
          onChange={(e) => saveEvent({ ...newEvent, name: e.target.value })} />
        <SquareX className='inline-flex align-middle ml-auto rounded-md' size={24} onClick={deleteEvent} />
        <CopyPlus className='inline-flex align-middle rounded-md' size={24} onClick={copyEvent} />
      </span>
      <span className='flex gap-2 items-center'>
        <Input
          className='w-3/4'
          type='number'
          placeholder='Points'
          value={newEvent.points}
          onChange={(e) => saveEvent({ ...newEvent, points: parseInt(e.target.value) })} />
        <Select value={event.referenceType} onValueChange={(value) => saveEvent(updateReferenceType(value))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='castaway'>Castaway</SelectItem>
            <SelectItem value='tribe'>Tribe</SelectItem>
            <SelectItem value='member'>Member</SelectItem>
          </SelectContent>
        </Select>
      </span>
      <Textarea
        className='w-full'
        placeholder='Description'
        value={newEvent.description}
        onChange={(e) => saveEvent({ ...newEvent, description: e.target.value })} />
      <Separator className='my-2' />
    </article >
  );
}

// example event templates below
const blankEvent: WeeklyEventRuleType = {
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway'
};

const confessionalEvent: WeeklyEventRuleType = {
  name: 'Confessional',
  points: 1,
  description: 'A castaway records a confessional.',
  referenceType: 'castaway'
};

const challengeMVPEvent: WeeklyEventRuleType = {
  name: 'Challenge MVP',
  points: 2,
  description: 'A castaway is the most valuable player in a challenge.',
  referenceType: 'castaway'
};

const orchestrateBlindsideEvent: WeeklyEventRuleType = {
  name: 'Orchestrate Blindside',
  points: 3,
  description: 'A castaway orchestrates a blindside.',
  referenceType: 'castaway'
};
