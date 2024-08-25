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
      case 'soleSurvivor':
        event = soleSurvivor;
        break;
      case 'firstBoot':
        event = firstBoot;
        break;
      case 'firstLoser':
        event = firstLoser;
        break;
      case 'tribeBeast':
        event = tribeBeast;
        break;
      case 'individualBeast':
        event = individualBeast;
        break;
      default:
        event = blankEvent;
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
    <article className='flex flex-col gap-2 mr-2'>
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
      <Select value={event.timing ?? ''} onValueChange={(value) => saveEvent({ ...newEvent, timing: value as 'premiere' | 'merge' | 'finale' })}>
        <SelectTrigger className='w-full mt-0'>
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
const blankEvent: SeasonEventRuleType = {
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway',
  timing: null,
};

const soleSurvivor: SeasonEventRuleType = {
  name: 'Sole Survivor',
  points: 10,
  description: 'Predict the winner of the season.',
  referenceType: 'castaway',
  timing: null,
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

