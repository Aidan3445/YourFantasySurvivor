'use client';
import { CopyPlus, SquareX } from 'lucide-react';
import { Input } from '~/app/_components/commonUI/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { cn } from '~/lib/utils';
import { useEffect, useState } from 'react';
import { type WeeklyEventRuleType } from '~/server/db/schema/weeklyEvents';
import { Textarea } from '~/app/_components/commonUI/textArea';
import { Separator } from '~/app/_components/commonUI/separator';
import { type EventsProps } from './eventForm';

export default function WeeklyEvents({ className, form, freeze }: EventsProps) {
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
      case 'vote':
        event = blankEvent('vote');
        break;
      case 'predict':
        event = blankEvent('predict');
        break;
      case 'challengeMVP':
        event = challengeMVPEvent;
        break;
      case 'bestGCMeme':
        event = bestGCMemeEvent;
        break;
      case 'nextBoot':
        event = nextBootEvent;
        break;
      default:
        event = blankEvent('vote');
    }

    setWeeklyEvents([...weeklyEvents, event]);
  };

  return (
    <article className={cn('light-scroll h-96 pb-16', className)}>
      <section className='flex flex-col'>
        {weeklyEvents.map((event, index) => (
          <WeeklyEvent key={index} event={event} eventId={index} updateEvent={freeze ? undefined : updateEvent} />
        ))}
      </section>
      {!freeze &&
        <Select value='' onValueChange={newEvent}>
          <SelectTrigger>
            <SelectValue placeholder='New Weekly Event' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='vote'>New Vote</SelectItem>
            <SelectItem value='predict'>New Prediction</SelectItem>
            <SelectGroup>
              <SelectLabel>Examples</SelectLabel>
              <SelectItem value='challengeMVP'>Challenge MVP</SelectItem>
              <SelectItem value='bestGCMeme'>Best GC Meme</SelectItem>
              <SelectItem value='nextBoot'>Next Boot</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>}
    </article>
  );
}

interface WeeklyEventProps {
  event: WeeklyEventRuleType;
  eventId: number;
  updateEvent?: (event: WeeklyEventRuleType | null, eventId: number | null) => void;
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
    updateEvent?.(changedEvent, eventId);
    setNewEvent(changedEvent);
  };

  const deleteEvent = () => {
    updateEvent?.(null, eventId);
  };

  const copyEvent = () => {
    updateEvent?.(newEvent, null);
  };

  return (
    <article className='flex flex-col gap-2 mr-2'>
      <span className='flex gap-2 items-center'>
        <div className='w-full'>
          <Input
            type='text'
            placeholder='Event Name'
            value={newEvent.name}
            onChange={(e) => saveEvent({ ...newEvent, name: e.target.value })} />
        </div>
        {updateEvent &&
          <span className='flex gap-2'>
            <CopyPlus className='inline-flex align-middle rounded-md mt-6' size={24} onClick={copyEvent} />
            <SquareX className='inline-flex align-middle rounded-md mt-6' size={24} onClick={deleteEvent} />
          </span>}
      </span>
      <span className='flex gap-2 items-center'>
        <Input
          type='number'
          placeholder='Points'
          value={newEvent.points}
          onChange={(e) => saveEvent({ ...newEvent, points: parseInt(e.target.value) })} />
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
      </span>
      <Select value={event.type} onValueChange={(value) => saveEvent({ ...newEvent, type: value as 'vote' | 'predict' })}>
        <SelectTrigger className='w-full mt-0'>
          <SelectValue placeholder='Type' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Type</SelectLabel>
            <SelectItem value='vote'>Vote</SelectItem>
            <SelectItem value='predict'>Prediction</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Textarea
        className='w-full'
        placeholder='Description (Optional)'
        value={newEvent.description}
        onChange={(e) => saveEvent({ ...newEvent, description: e.target.value })} />
      <Separator className='mb-2' />
    </article >
  );
}

// example event templates below
const blankEvent = (type: 'vote' | 'predict'): WeeklyEventRuleType => ({
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway',
  type
});

const challengeMVPEvent: WeeklyEventRuleType = {
  name: 'Challenge MVP',
  points: 2,
  description: 'A castaway is the most valuable player in a challenge.',
  referenceType: 'castaway',
  type: 'vote'
};

const bestGCMemeEvent: WeeklyEventRuleType = {
  name: 'Best GC Meme',
  points: 1,
  description: 'Which league member sent the best meme in the group chat this week?',
  referenceType: 'member',
  type: 'vote'
};

const nextBootEvent: WeeklyEventRuleType = {
  name: 'Next Boot',
  points: 2,
  description: 'Predict the next castaway to be voted off.',
  referenceType: 'castaway',
  type: 'predict'
};
