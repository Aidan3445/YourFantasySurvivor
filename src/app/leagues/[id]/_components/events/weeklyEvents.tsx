import { CopyPlus, SquareX } from 'lucide-react';
import { Input } from '~/app/_components/commonUI/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { cn, type ComponentProps } from '~/lib/utils';
import { WeeklyEventRule, type WeeklyEventRuleType } from '~/server/db/schema/weeklyEvents';
import { Textarea } from '~/app/_components/commonUI/textArea';
import { Separator } from '~/app/_components/commonUI/separator';
import { type EventsProps } from './eventForm';
import { useState } from 'react';
import { Label } from '~/app/_components/commonUI/label';

type WeeklyTemplatesType = Omit<WeeklyEventRuleType, 'id'>;

export default function WeeklyEvents({ className, form, freeze, setUnsaved }: EventsProps) {
  const weeklyEvents = form.watch('weekly');

  const updateEvent = (
    event: WeeklyEventRuleType,
    action: 'copy' | 'delete' | 'update',
    eventIndex: number) => {
    const newEvents = [...weeklyEvents] as WeeklyTemplatesType[];

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

    form.setValue('weekly', newEvents as WeeklyEventRuleType[]);
  };

  const newEvent = (value: keyof typeof WeeklyTemplates) => {
    form.setValue('weekly', [...weeklyEvents, { ...WeeklyTemplates[value] } as WeeklyEventRuleType]);
    setUnsaved && setUnsaved();
  };

  return (
    <article className={cn('light-scroll h-96 pb-16', className)}>
      <section className='flex flex-col'>
        {weeklyEvents.map((event, index) => (
          <WeeklyEvent key={index} event={event} eventIndex={index} updateEvent={freeze ? undefined : updateEvent} />
        ))}
        {weeklyEvents.length === 0 && <h4 className='text-lg font-normal text-gray-700'>No weekly events</h4>}
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

interface WeeklyEventProps extends ComponentProps {
  event: WeeklyEventRuleType;
  eventIndex: number;
  updateEvent?: (
    event: WeeklyEventRuleType,
    action: 'copy' | 'delete' | 'update',
    eventIndex: number) => void;
}

function WeeklyEvent({ event, updateEvent, eventIndex, className }: WeeklyEventProps) {
  const [newEvent, setNewEvent] = useState(event);
  const [nameError, setNameError] = useState('');

  const updateReferenceType = (value: string): WeeklyEventRuleType => {
    if (value === 'castaway' || value === 'tribe' || value === 'member') {
      return { ...newEvent, referenceType: value };
    }

    return newEvent;
  };

  const update = (changedEvent: WeeklyEventRuleType) => {
    // validate change and update error message
    try {
      WeeklyEventRule.parse(changedEvent);
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
          <Select value={event.referenceType} onValueChange={(value) =>
            update(updateReferenceType(value))}>
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
      <span className='grid gap-2 grid-cols-2'>
        <div>
          <Label>Type</Label>
          <Select value={event.type} onValueChange={(value) =>
            update({ ...newEvent, type: value as 'vote' | 'predict' })}>
            <SelectTrigger className='mt-0 w-full'>
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
        </div>
        <div>
          <Label>Timing</Label>
          <Select value={event.timing} onValueChange={(value) =>
            update({ ...newEvent, timing: value as 'fullSeason' | 'preMerge' | 'postMerge' })}>
            <SelectTrigger className='mt-0 w-full'>
              <SelectValue placeholder='Timing' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Timing</SelectLabel>
                <SelectItem value='fullSeason'>Full Season</SelectItem>
                <SelectItem value='preMerge'>Pre-Merge</SelectItem>
                <SelectItem value='postMerge'>Post-Merge</SelectItem>
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
const blankVoteEvent: WeeklyTemplatesType = {
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway',
  type: 'vote',
  timing: 'fullSeason'
};

const blankPredictEvent: WeeklyTemplatesType = {
  name: '',
  points: 0,
  description: '',
  referenceType: 'castaway',
  type: 'predict',
  timing: 'fullSeason'
};

const challengeMVPEvent: WeeklyTemplatesType = {
  name: 'Challenge MVP',
  points: 2,
  description: 'A castaway is the most valuable player in a challenge.',
  referenceType: 'castaway',
  type: 'vote',
  timing: 'preMerge'
};

const bestGCMemeEvent: WeeklyTemplatesType = {
  name: 'Best GC Meme',
  points: 1,
  description: 'Which league member sent the best meme in the group chat this week?',
  referenceType: 'member',
  type: 'vote',
  timing: 'fullSeason'
};

const nextBootEvent: WeeklyTemplatesType = {
  name: 'Next Boot',
  points: 2,
  description: 'Predict the next castaway to be voted off.',
  referenceType: 'castaway',
  type: 'predict',
  timing: 'fullSeason'
};

const WeeklyTemplates = {
  vote: blankVoteEvent,
  predict: blankPredictEvent,
  challengeMVP: challengeMVPEvent,
  bestGCMeme: bestGCMemeEvent,
  nextBoot: nextBootEvent
};
