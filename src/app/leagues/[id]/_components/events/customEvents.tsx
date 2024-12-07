'use client';
import { CopyPlus, SquareX } from 'lucide-react';
import { Input } from '~/app/_components/commonUI/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { cn, type ComponentProps } from '~/lib/utils';
import { useState } from 'react';
import { CustomEventRule, type CustomEventRuleType } from '~/server/db/schema/customEvents';
import { Textarea } from '~/app/_components/commonUI/textArea';
import { Separator } from '~/app/_components/commonUI/separator';
import { type EventsProps } from './eventForm';
import { Label } from '~/app/_components/commonUI/label';

type CustomTemplatesType = Omit<CustomEventRuleType, 'id'>;

export default function CustomEvents({ className, form, freeze, setUnsaved }: EventsProps) {
  const customEvents = form.watch('custom');

  const updateEvent = (
    event: CustomTemplatesType,
    action: 'copy' | 'delete' | 'update',
    eventIndex: number) => {
    const newEvents = [...customEvents] as CustomTemplatesType[];

    switch (action) {
      case 'copy':
        newEvents.push({ ...event, name: '' });
        break;
      case 'delete':
        newEvents.splice(eventIndex, 1);
        break;
      case 'update':
        newEvents[eventIndex] = event;
        break;
    }

    form.setValue('custom', newEvents as CustomEventRuleType[]);
  };

  const newEvent = (value: keyof typeof CustomTemplates) => {
    form.setValue('custom', [...customEvents, { ...CustomTemplates[value] } as CustomEventRuleType]);
    setUnsaved && setUnsaved();
  };

  return (
    <article className={cn('light-scroll h-96 pb-16', className)}>
      <section className='flex flex-col'>
        {customEvents.map((event, index) => (
          <CustomEvent key={index} event={event} eventIndex={index} updateEvent={freeze ? undefined : updateEvent} />
        ))}
        {customEvents.length === 0 && <h4 className='text-lg font-normal text-gray-700'>No custom events</h4>}
      </section>
      {!freeze &&
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
        </Select>}
    </article>
  );
}

export interface CustomEventProps extends ComponentProps {
  event: CustomTemplatesType;
  eventIndex: number;
  updateEvent?: (
    event: CustomTemplatesType,
    action: 'copy' | 'delete' | 'update',
    eventIndex: number) => void;
}

function CustomEvent({ event, eventIndex, updateEvent, className }: CustomEventProps) {
  const [newEvent, setNewEvent] = useState(event);
  const [nameError, setNameError] = useState('');

  const updateReferenceType = (value: string): CustomTemplatesType => {
    if (value === 'castaway' || value === 'tribe' || value === 'member') {
      return { ...newEvent, referenceType: value };
    }
    return newEvent;
  };

  const update = (changedEvent: CustomTemplatesType) => {
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
            onChange={(e) => update({ ...newEvent, name: e.target.value })} />
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
            onChange={(e) => update({ ...newEvent, points: parseInt(e.target.value) })} />
        </div>
        <div className='w-full'>
          <Label>Reference Type</Label>
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
const blankEvent: CustomTemplatesType = {
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway'
};

const confessionalEvent: CustomTemplatesType = {
  name: 'Confessional',
  points: 1,
  description: 'A castaway records a confessional.',
  referenceType: 'castaway'
};

const liveTribalCouncilEvent: CustomTemplatesType = {
  name: 'Live Tribal Council',
  points: 1,
  referenceType: 'tribe',
  description: 'Tribal council erupts into chaos (A.K.A. live tribal).'
};

const orchestrateBlindsideEvent: CustomTemplatesType = {
  name: 'Orchestrate Blindside',
  points: 3,
  description: 'A castaway orchestrates a blindside.',
  referenceType: 'castaway'
};

const CustomTemplates = {
  new: blankEvent,
  confessional: confessionalEvent,
  liveTribal: liveTribalCouncilEvent,
  blindside: orchestrateBlindsideEvent
};

