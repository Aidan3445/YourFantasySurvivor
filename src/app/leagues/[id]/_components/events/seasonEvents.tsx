'use client';
import { CopyPlus, SquareX } from 'lucide-react';
import { Input } from '~/app/_components/commonUI/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { cn } from '~/lib/utils';
import { useEffect, useState } from 'react';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { Textarea } from '~/app/_components/commonUI/textArea';
import { Separator } from '~/app/_components/commonUI/separator';
import { type EventsProps } from './eventForm';

export default function SeasonEvents({ className, form }: EventsProps) {
  const [seasonEvents, setSeasonEvents] = useState(form.getValues().season);

  const updateEvent = (event: SeasonEventRuleType | null, eventId: number | null) => {
    const newEvents = [...seasonEvents];

    if (eventId === null && !event) return;
    else if (eventId === null && event) newEvents.push(event);
    else if (!event) newEvents.splice(eventId!, 1);
    else newEvents[eventId!] = event;

    setSeasonEvents(newEvents);
  };

  useEffect(() => {
    form.setValue('season', [...seasonEvents]);
  }, [form, seasonEvents]);

  const newEvent = (value: string) => {
    let event: SeasonEventRuleType;

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

    setSeasonEvents([...seasonEvents, event]);
  };

  return (
    <article className={cn('light-scroll h-96 pb-16', className)}>
      <section className='flex flex-col'>
        {seasonEvents.map((event, index) => (
          <SeasonEvent key={index} event={event} eventId={index} updateEvent={updateEvent} />
        ))}
      </section>
      <Select value='' onValueChange={newEvent}>
        <SelectTrigger>
          <SelectValue placeholder='New Season Event' />
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
      </Select>
    </article>
  );
}

interface SeasonEventProps {
  event: SeasonEventRuleType;
  eventId: number;
  updateEvent: (event: SeasonEventRuleType | null, eventId: number | null) => void;
}

function SeasonEvent({ event, eventId, updateEvent }: SeasonEventProps) {
  const [newEvent, setNewEvent] = useState(event);

  const updateReferenceType = (value: string): SeasonEventRuleType => {
    if (value === 'castaway' || value === 'tribe' || value === 'member') {
      return { ...newEvent, referenceType: value };
    }

    return newEvent;
  };

  const saveEvent = (changedEvent: SeasonEventRuleType) => {
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
          className='w-3/4 mr-4'
          type='text'
          placeholder='Event Name'
          value={newEvent.name}
          onChange={(e) => saveEvent({ ...newEvent, name: e.target.value })} />
        <CopyPlus className='inline-flex align-middle rounded-md' size={24} onClick={copyEvent} />
        <SquareX className='inline-flex align-middle rounded-md' size={24} onClick={deleteEvent} />
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
      <Separator className='my-2' />
    </article >
  );
}

// example event templates below
const blankEvent = (type: 'vote' | 'predict'): SeasonEventRuleType => ({
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway',
});

const challengeMVPEvent: SeasonEventRuleType = {
  name: 'Challenge MVP',
  points: 2,
  description: 'A castaway is the most valuable player in a challenge.',
  referenceType: 'castaway',
};

const bestGCMemeEvent: SeasonEventRuleType = {
  name: 'Best GC Meme',
  points: 1,
  description: 'Which league member sent the best meme in the group chat this week?',
  referenceType: 'member',
};

const nextBootEvent: SeasonEventRuleType = {
  name: 'Next Boot',
  points: 2,
  description: 'Predict the next castaway to be voted off.',
  referenceType: 'castaway',
};
