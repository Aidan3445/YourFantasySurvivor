'use client';
import { CopyPlus, SquareX } from 'lucide-react';
import { Input } from '~/app/_components/commonUI/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { cn, type ComponentProps } from '~/lib/utils';
import { useEffect, useState } from 'react';
import { CustomEventRule, type CustomEventRuleType } from '~/server/db/schema/customEvents';
import { Textarea } from '~/app/_components/commonUI/textArea';
import { Separator } from '~/app/_components/commonUI/separator';
import { type EventsProps } from './eventForm';
import { Label } from '~/app/_components/commonUI/label';

export default function CustomEvents({ className, form }: EventsProps) {
  const [customEvents, setCustomEvents] = useState(form.getValues().custom);

  const updateEvent = (event: CustomEventRuleType | null, eventCount: number | null) => {
    const newEvents = [...customEvents];

    if (eventCount === null && !event) return;
    else if (eventCount === null && event) newEvents.push({ ...event, id: undefined });
    else if (!event) newEvents.splice(eventCount!, 1);
    else newEvents[eventCount!] = event;

    form.setValue('custom', [...newEvents]);
  };

  const watch = form.watch('custom');
  useEffect(() => {
    setCustomEvents(form.getValues().custom);
  }, [watch, form]);

  const newEvent = (value: string) => {
    let event: CustomEventRuleType;

    switch (value) {
      case 'confessional':
        event = confessionalEvent;
        break;
      case 'liveTribal':
        event = liveTribalCouncilEvent;
        break;
      case 'blindside':
        event = orchestrateBlindsideEvent;
        break;
      default:
        event = blankEvent;
    }

    form.setValue('custom', [...customEvents, event]);
  };

  return (
    <article className={cn('light-scroll h-96 pb-16', className)}>
      <section className='flex flex-col'>
        {customEvents.map((event, index) => (
          <CustomEvent key={index} event={event} eventCount={index} updateEvent={updateEvent} />
        ))}
      </section>
      <Select value='' onValueChange={newEvent}>
        <SelectTrigger>
          <SelectValue placeholder='New Custom Event' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='new'>New</SelectItem>
          <SelectGroup>
            <SelectLabel>Examples</SelectLabel>
            <SelectItem value='confessional'>Confessional</SelectItem>
            <SelectItem value='liveTribal'>Live Tribal Council</SelectItem>
            <SelectItem value='blindside'>Orchestrate Blindside</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </article>
  );
}

export interface CustomEventProps extends ComponentProps {
  event: CustomEventRuleType;
  eventCount: number;
  updateEvent: (event: CustomEventRuleType | null, eventCount: number | null) => void;
}

function CustomEvent({ event, eventCount, updateEvent, className }: CustomEventProps) {
  const [newEvent, setNewEvent] = useState(event);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    setNewEvent(event);
  }, [event]);

  const updateReferenceType = (value: string): CustomEventRuleType => {
    if (value === 'castaway' || value === 'tribe' || value === 'member') {
      return { ...newEvent, referenceType: value };
    }

    return newEvent;
  };

  const update = (changedEvent: CustomEventRuleType) => {
    // validate change and update error message
    try {
      CustomEventRule.parse(changedEvent);
      setNameError('');
    } catch (error) {
      if (error instanceof Error) {
        const [res] = JSON.parse(error.message) as { message: string }[];
        setNameError(res!.message);
      }
    }

    updateEvent(changedEvent, eventCount);
    setNewEvent(changedEvent);
  };

  const deleteEvent = () => {
    updateEvent(null, eventCount);
  };

  const copyEvent = () => {
    updateEvent(newEvent, null);
  };

  return (
    <article className={cn('flex flex-col gap-2 mr-2', className)}>
      {event.id}-{eventCount}
      <span className='flex gap-2 items-center'>
        <div className='w-3/4 mr-4'>
          <Label>Event Name</Label>
          <Input
            type='text'
            placeholder='Event Name'
            value={newEvent.name}
            onChange={(e) => update({ ...newEvent, name: e.target.value })} />
        </div>
        <CopyPlus className='inline-flex align-middle rounded-md mt-6' size={24} onClick={copyEvent} />
        <SquareX className='inline-flex align-middle rounded-md mt-6' size={24} onClick={deleteEvent} />
      </span>
      <span className='flex gap-2 items-center'>
        <div>
          <Label>Points</Label>
          <Input
            type='number'
            placeholder='Points'
            value={newEvent.points}
            onChange={(e) => update({ ...newEvent, points: parseInt(e.target.value) })} />
        </div>
        <div className='w-full'>
          <Label>Points for</Label>
          <Select value={event.referenceType} onValueChange={(value) => update(updateReferenceType(value))}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Points for</SelectLabel>
                <SelectItem value='castaway'>Castaway</SelectItem>
                <SelectItem value='tribe'>Tribe</SelectItem>
                <SelectItem value='member'>Member</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </span>
      <div>
        <Label>Description</Label>
        <Textarea
          className='w-full'
          placeholder='Description (Optional)'
          value={newEvent.description}
          onChange={(e) => update({ ...newEvent, description: e.target.value })} />
      </div>
      {nameError && <h4 className='text-xs font-normal text-red-700'>{nameError}</h4>}
      <Separator className='mb-2' />
    </article >
  );
}

// example event templates below
const blankEvent: CustomEventRuleType = {
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway'
};

const confessionalEvent: CustomEventRuleType = {
  name: 'Confessional',
  points: 1,
  description: 'A castaway records a confessional.',
  referenceType: 'castaway'
};

const liveTribalCouncilEvent: CustomEventRuleType = {
  name: 'Live Tribal Council',
  points: 1,
  referenceType: 'tribe',
  description: 'Tribal council erupts into chaos (A.K.A. live tribal).'
};

const orchestrateBlindsideEvent: CustomEventRuleType = {
  name: 'Orchestrate Blindside',
  points: 3,
  description: 'A castaway orchestrates a blindside.',
  referenceType: 'castaway'
};

