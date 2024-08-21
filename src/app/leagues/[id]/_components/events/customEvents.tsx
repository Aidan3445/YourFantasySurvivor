'use client';

import { Ellipsis } from 'lucide-react';
import { Input } from '~/app/_components/commonUI/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { cn, type ComponentProps } from '~/lib/utils';
import { type eventSchema } from './eventForm';
import { type UseFormReturn } from 'react-hook-form';
import { type z } from 'zod';
import { useEffect, useState } from 'react';
import { type AdminEventRuleType } from '~/server/db/schema/adminEvents';
import { Textarea } from '~/app/_components/commonUI/textArea';
import { Separator } from '~/app/_components/commonUI/separator';

interface CustomEventsProps extends ComponentProps {
  form: UseFormReturn<z.infer<typeof eventSchema>>;
}

export default function CustomEvents({ className, form }: CustomEventsProps) {
  const [customEvents, setCustomEvents] = useState(form.getValues().admin);

  const updateEvent = (event: AdminEventRuleType | null, eventId: number) => {
    const newEvents = [...customEvents];

    if (!event) newEvents.splice(eventId, 1);
    else newEvents[eventId] = event;

    setCustomEvents(newEvents);
  };

  useEffect(() => {
    form.setValue('admin', [...customEvents]);
  }, [form, customEvents]);

  const newEvent = (value: string) => {
    let event: AdminEventRuleType;

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

    setCustomEvents([...customEvents, event]);
  };

  return (
    <article className={cn('light-scroll h-96 pb-16', className)}>
      <section className='flex flex-col gap-4'>
        {customEvents.map((event, index) => (
          <CustomEvent key={index} event={event} eventId={index} updateEvent={updateEvent} />
        ))}
      </section>
      <Select value='' onValueChange={newEvent}>
        <SelectTrigger>
          <SelectValue placeholder='New Event' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='custom'>Custom</SelectItem>
          <SelectItem value='confessional'>Confessional</SelectItem>
          <SelectItem value='challengeMVP'>Challenge MVP</SelectItem>
          <SelectItem value='blindside'>Orchestrate Blindside</SelectItem>
        </SelectContent>
      </Select>
    </article>
  );
}

interface CustomEventProps {
  event: AdminEventRuleType;
  eventId: number;
  updateEvent: (event: AdminEventRuleType | null, eventId: number) => void;
}

function CustomEvent({ event, eventId, updateEvent }: CustomEventProps) {
  const [newEvent, setNewEvent] = useState(event);

  const updateReferenceType = (value: string): AdminEventRuleType => {
    if (value === 'castaway' || value === 'tribe' || value === 'member') {
      return { ...newEvent, referenceType: value };
    }

    return newEvent;
  };

  const saveEvent = (changedEvent: AdminEventRuleType) => {
    updateEvent(changedEvent, eventId);
    setNewEvent(changedEvent);
  };

  const deleteEvent = () => {
    updateEvent(null, eventId);
  };

  return (
    <article className='flex flex-col'>
      <span className='flex pr-2 gap-2 items-center'>
        <Input
          className='w-3/4'
          type='text'
          placeholder='Event Name'
          value={newEvent.name}
          onChange={(e) => saveEvent({ ...newEvent, name: e.target.value })} />
        <Ellipsis className='inline-flex align-middle' size={24} onClick={deleteEvent} />
      </span>
      <span className='flex pr-2 gap-2 items-center'>
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
      <Separator className='mt-2' />
    </article >
  );
}

// example event templates below
const blankEvent: AdminEventRuleType = {
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway'
};

const confessionalEvent: AdminEventRuleType = {
  name: 'Confessional',
  points: 1,
  description: 'A castaway records a confessional.',
  referenceType: 'castaway'
};

const challengeMVPEvent: AdminEventRuleType = {
  name: 'Challenge MVP',
  points: 2,
  description: 'A castaway is the most valuable player in a challenge.',
  referenceType: 'castaway'
};

const orchestrateBlindsideEvent: AdminEventRuleType = {
  name: 'Orchestrate Blindside',
  points: 3,
  description: 'A castaway orchestrates a blindside.',
  referenceType: 'castaway'
};
