'use client';

import { Button } from '~/components/common/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Input } from '~/components/common/input';
import { Textarea } from '~/components/common/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/common/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { MultiSelect } from '~/components/common/multiSelect';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '~/components/common/alertDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/common/tooltip';
import { Circle, Check, X, Info } from 'lucide-react';
import { type CastawayInsert, type EnrichedCastaway } from '~/types/castaways';
import { type TribeInsert, type Tribe } from '~/types/tribes';
import { type Episode } from '~/types/episodes';
import { type SeasonInsert } from '~/types/seasons';
import { type EventWithReferences, type BaseEventName } from '~/types/events';
import { BaseEventNames } from '~/lib/events';
import { cn } from '~/lib/utils';
import createEpisode from '~/actions/sys/createEpisode';
import createTribe from '~/actions/sys/createTribe';
import createCastaway from '~/actions/sys/createCastaway';
import createSeason from '~/actions/sys/createSeason';
import createBaseEvent from '~/actions/createBaseEvent';
import { useSeasons } from '~/hooks/seasons/useSeasons';
import { useSeasonsData } from '~/hooks/seasons/useSeasonsData';
import { useQueryClient } from '@tanstack/react-query';

// ── Types matching server-side parsed output ──

type ParsedEvent = {
  eventName: string;
  label: string | null;
  notes: string[];
  references: { type: 'Castaway' | 'Tribe'; name: string }[];
};

type ParsedEpisodeDetails = {
  episodeNumber: number;
  events: ParsedEvent[];
};

type ParsedTribeSwap = {
  type: 'swap' | 'merge';
  episodeNumber: number;
  events: ParsedEvent[];
};

// ── Helpers ──

function resolveReferences(
  refs: { type: 'Castaway' | 'Tribe'; name: string }[],
  castaways: EnrichedCastaway[],
  tribes: Tribe[],
) {
  return refs.map(ref => {
    if (ref.type === 'Tribe') {
      const tribe = tribes.find(t => t.tribeName === ref.name);
      return tribe ? { type: 'Tribe' as const, id: tribe.tribeId, name: ref.name } : null;
    }
    const castaway = castaways.find(c =>
      c.shortName === ref.name || c.fullName === ref.name);
    return castaway ? { type: 'Castaway' as const, id: castaway.castawayId, name: ref.name } : null;
  }).filter((r): r is NonNullable<typeof r> => r !== null);
}

function findMatchingEvent(
  parsed: ParsedEvent,
  resolvedRefs: { type: string; id: number }[],
  existingEvents: Record<number, EventWithReferences> | undefined,
): EventWithReferences | null {
  if (!existingEvents) return null;
  return Object.values(existingEvents).find(existing => {
    if (existing.eventName !== parsed.eventName) return false;
    return resolvedRefs.some(ref =>
      existing.references.some(er => er.type === ref.type && er.id === ref.id));
  }) ?? null;
}

// ── Form schema ──

const formSchema = z.object({
  seasonName: z.string(),
});

// ── Main Import Page ──

export default function Import() {
  const queryClient = useQueryClient();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: { seasonName: '' },
    resolver: zodResolver(formSchema),
  });

  const [season, setSeason] = useState<SeasonInsert | null>(null);
  const [castaways, setCastaways] = useState<CastawayInsert[]>([]);
  const [tribes, setTribes] = useState<TribeInsert[]>([]);
  const [episodes, setEpisodes] = useState<{ episodeNumber: number; title: string; airDate: string }[]>([]);
  const [episodeDetails, setEpisodeDetails] = useState<ParsedEpisodeDetails[]>([]);
  const [tribeSwaps, setTribeSwaps] = useState<ParsedTribeSwap[]>([]);

  // Look up existing season data from DB
  const { data: allSeasons } = useSeasons(true);
  const seasonId = useMemo(() => {
    if (!allSeasons || !season) return null;
    const found = allSeasons.find(s => s.name === season.name);
    return found?.seasonId ?? null;
  }, [allSeasons, season]);

  const { data: seasonsData } = useSeasonsData(true, seasonId ?? undefined);
  const seasonData = seasonsData?.[0];

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ['seasons'] });
  };

  const handleClick = async () => {
    const data = (await fetch(
      `/api/sys?seasonName=${reactForm.getValues().seasonName}`,
      { method: 'GET' },
    ).then(res => res.json())) as {
      season: SeasonInsert;
      castaways: CastawayInsert[];
      tribes: TribeInsert[];
      episodes: { episodeNumber: number; title: string; airDate: string }[];
      episodeDetails: ParsedEpisodeDetails[];
      tribeSwaps: ParsedTribeSwap[];
    };

    if (!data.castaways || data.castaways.length === 0) {
      alert('No castaways found');
      return;
    }

    setSeason(data.season);
    setCastaways(data.castaways);
    setTribes(data.tribes);
    setEpisodes(data.episodes);
    setEpisodeDetails(data.episodeDetails);
    setTribeSwaps(data.tribeSwaps ?? []);
  };

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!season) {
      alert('No season data found');
      return;
    }
    try {
      await createSeason(data.seasonName, season.premiereDate, season.finaleDate ?? undefined);
      await Promise.all(tribes.map(tribe => createTribe(data.seasonName, tribe)));
      await Promise.all(castaways.map(castaway => createCastaway(data.seasonName, castaway)));
      await invalidateAll();
      alert('Contestants imported successfully');
    } catch (error) {
      console.error('Error importing contestants', error);
      alert('Error importing contestants');
    }
  });

  // Merge tribeSwap events into episode event lists
  const mergedEpisodeDetails = useMemo(() => {
    const map = new Map<number, ParsedEvent[]>();
    for (const ep of episodeDetails) {
      map.set(ep.episodeNumber, [...ep.events]);
    }
    for (const swap of tribeSwaps) {
      const existing = map.get(swap.episodeNumber);
      if (existing) {
        existing.push(...swap.events);
      } else if (swap.episodeNumber > 0) {
        map.set(swap.episodeNumber, [...swap.events]);
      }
    }
    return map;
  }, [episodeDetails, tribeSwaps]);

  // Unmatched swaps (episodeNumber = 0)
  const unmatchedSwaps = tribeSwaps.filter(s => s.episodeNumber === 0);

  return (
    <div className='w-full space-y-4'>
      <Form {...reactForm}>
        <form
          className='flex gap-4 bg-card p-8 rounded-full justify-center items-end'
          action={() => handleSubmit()}>
          <Button type='button' onClick={handleClick}>Fetch Data</Button>
          <FormField
            name='seasonName'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='text' placeholder='Season Name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          <Button type='submit' disabled={castaways.length === 0}>Import</Button>
        </form>
      </Form>

      {season && (
        <div className='flex items-center space-x-4 bg-card rounded-lg p-4'>
          <h2 className='font-bold'>Season: {season.name}</h2>
          <p>Premiere Date: {new Date(season.premiereDate).toDateString()}</p>
          {season.finaleDate && <p>Finale Date: {new Date(season.finaleDate).toDateString()}</p>}
          {seasonId
            ? <span className='text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full'>DB ID: {seasonId}</span>
            : <span className='text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-full'>Not in DB</span>}
          {tribeSwaps.length > 0 && (
            <div className='flex gap-2 flex-wrap'>
              {tribeSwaps.map((swap, i) => (
                <span key={i} className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  swap.episodeNumber > 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-destructive/20 text-destructive',
                )}>
                  {swap.type === 'merge' ? 'Merge' : `Swap ${i + 1}`}
                  {swap.episodeNumber > 0 ? ` → Ep ${swap.episodeNumber}` : ' → Episode unknown'}
                  {' '}({swap.events.length} events)
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <span className='flex gap-4 flex-wrap'>
        {tribes.map((tribe, index) => (
          <div key={index} className='flex items-center space-x-4 bg-card rounded-lg p-4'>
            <Circle fill={tribe.tribeColor} />
            <h2 className='font-bold'>{tribe.tribeName}</h2>
          </div>
        ))}
      </span>

      <div className='overflow-x-scroll flex gap-4 pb-2'>
        {episodes.map((episode, index) => (
          <ImportEpisode
            key={index}
            {...episode}
            seasonName={reactForm.watch('seasonName')}
            parsedEvents={mergedEpisodeDetails.get(episode.episodeNumber) ?? []}
            seasonData={seasonData ?? null}
            allDbEpisodes={seasonData?.episodes ?? []}
            onImported={invalidateAll} />
        ))}
      </div>

      {unmatchedSwaps.length > 0 && (
        <div className='bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-2'>
          <h3 className='font-bold text-destructive'>Unmatched Tribe Events (episode unknown)</h3>
          <p className='text-xs text-muted-foreground'>
            These tribe swap/merge events couldn&apos;t be auto-matched to an episode.
            They will appear in the episode event dialog once you assign them manually.
          </p>
          {unmatchedSwaps.flatMap(swap => swap.events).map((event, i) => (
            <div key={i} className='text-sm bg-card rounded p-2'>
              <span className='font-mono text-xs bg-muted px-1 rounded'>{event.eventName}</span>
              {' '}{event.label} — {event.references.map(r => `${r.name} (${r.type})`).join(', ')}
            </div>
          ))}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {castaways.map((castaway, index) => (
          <div key={index} className='flex items-center space-x-4 bg-card rounded-lg p-4'>
            <Image src={castaway.imageUrl} alt={castaway.fullName} width={48} height={48} />
            <div>
              <h2 className='font-bold'>{castaway.fullName}</h2>
              <p>shortName: {castaway.shortName}</p>
              <p>age: {castaway.age}</p>
              <p>residence: {castaway.residence}</p>
              <p>occupation: {castaway.occupation}</p>
              <p>imageUrl: {castaway.imageUrl}</p>
              <p>tribe: {castaway.tribe}</p>
              <p>previouslyOn: {castaway.previouslyOn?.join(', ') ?? 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Import Episode Card ──

interface ImportEpisodeProps {
  episodeNumber: number;
  title: string;
  airDate: string;
  seasonName: string;
  parsedEvents: ParsedEvent[];
  seasonData: {
    castaways: EnrichedCastaway[];
    tribes: Tribe[];
    baseEvents: Record<number, Record<number, EventWithReferences>>;
    episodes: Episode[];
  } | null;
  allDbEpisodes: Episode[];
  onImported: () => Promise<void>;
}

function ImportEpisode({
  seasonName, episodeNumber, title, airDate,
  parsedEvents, seasonData, allDbEpisodes, onImported,
}: ImportEpisodeProps) {
  const [isMerge, setIsMerge] = useState(false);
  const [isFinale, setIsFinale] = useState(false);
  const [runtime, setRuntime] = useState(90);

  const dbEpisode = seasonData?.episodes.find(ep => ep.episodeNumber === episodeNumber);
  const existingEvents = dbEpisode
    ? seasonData?.baseEvents[episodeNumber]
    : undefined;

  const handleSubmit = async () => {
    try {
      await createEpisode(seasonName, {
        episodeNumber,
        title: title.replaceAll('"', ''),
        airDate: new Date(airDate),
        isMerge,
        isFinale,
        runtime,
      });
      await onImported();
      alert('Episode imported successfully');
    } catch (error) {
      console.error('Error importing episode', error);
      alert('Error importing episode');
    }
  };

  return (
    <div className='items-center bg-card rounded-lg p-4 min-w-[280px]'>
      <h2 className='font-bold'>Episode {episodeNumber}</h2>
      <p>{title}</p>
      <p>{new Date(airDate).toDateString()}</p>
      {dbEpisode && (
        <span className='text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full'>
          DB ID: {dbEpisode.episodeId}
        </span>
      )}
      <form action={() => handleSubmit()}>
        <label className='inline-flex items-center space-x-2'>
          <input type='checkbox' checked={isMerge} onChange={() => setIsMerge(!isMerge)} />
          <span>Is Merge</span>
        </label>
        <label className='inline-flex items-center space-x-2 ml-4'>
          <input type='checkbox' checked={isFinale} onChange={() => setIsFinale(!isFinale)} />
          <span>Is Finale</span>
        </label>
        <label className='inline-flex items-center space-x-2 ml-4'>
          <span>Runtime (minutes):</span>
          <input
            type='number'
            value={runtime}
            onChange={(e) => setRuntime(parseInt(e.target.value, 10))}
            className='w-16 text-right rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50' />
        </label>
        <Button type='submit'>Import Episode</Button>
      </form>

      {parsedEvents.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='outline'
              className='mt-2 w-full'
              disabled={!dbEpisode}>
              Events ({parsedEvents.length})
              {!dbEpisode && <span className='text-xs ml-1'>(import episode first)</span>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className='max-w-4xl max-h-[85vh] overflow-y-auto' customOverlay>
            <AlertDialogHeader>
              <AlertDialogTitle>Episode {episodeNumber}: {title}</AlertDialogTitle>
              <AlertDialogDescription>
                {parsedEvents.length} parsed events — import individually or edit before importing
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel className='absolute top-2 right-2 h-min p-1'>
              <X stroke='white' />
            </AlertDialogCancel>
            {dbEpisode && (
              <div className='space-y-3'>
                {parsedEvents.map((event, i) => (
                  <ImportEventRow
                    key={i}
                    event={event}
                    defaultEpisodeId={dbEpisode.episodeId}
                    allDbEpisodes={allDbEpisodes}
                    castaways={seasonData?.castaways ?? []}
                    tribes={seasonData?.tribes ?? []}
                    existingEvents={existingEvents}
                    onImported={onImported} />
                ))}
              </div>
            )}
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

// ── Import Event Row ──

interface ImportEventRowProps {
  event: ParsedEvent;
  defaultEpisodeId: number;
  allDbEpisodes: Episode[];
  castaways: EnrichedCastaway[];
  tribes: Tribe[];
  existingEvents: Record<number, EventWithReferences> | undefined;
  onImported: () => Promise<void>;
}

function ImportEventRow({
  event, defaultEpisodeId, allDbEpisodes,
  castaways, tribes, existingEvents, onImported,
}: ImportEventRowProps) {
  const autoResolved = useMemo(
    () => resolveReferences(event.references, castaways, tribes),
    [event.references, castaways, tribes]);

  const unresolvedRefs = event.references.filter(ref => {
    if (ref.type === 'Tribe') return !tribes.find(t => t.tribeName === ref.name);
    return !castaways.find(c => c.shortName === ref.name || c.fullName === ref.name);
  });

  const [episodeId, setEpisodeId] = useState(defaultEpisodeId);
  const [eventName, setEventName] = useState(event.eventName);
  const [label, setLabel] = useState(event.label ?? '');
  const [notes, setNotes] = useState<string[]>(event.notes);
  const [references, setReferences] = useState<{ type: 'Castaway' | 'Tribe'; id: number }[]>(
    autoResolved.map(r => ({ type: r.type, id: r.id })));
  const [imported, setImported] = useState(false);
  const [clearCounter] = useState(0);

  const matchingEvent = useMemo(
    () => findMatchingEvent(event, references, existingEvents),
    [event, references, existingEvents]);

  const refOptions = useMemo(() => [
    ...tribes.map(t => ({ value: `Tribe-${t.tribeId}`, label: t.tribeName })),
    ...castaways.map(c => ({ value: `Castaway-${c.castawayId}`, label: c.shortName })),
  ], [tribes, castaways]);

  const defaultRefValues = useMemo(
    () => autoResolved.map(r => `${r.type}-${r.id}`),
    [autoResolved]);

  const handleRefChange = (values: string[]) => {
    setReferences(values.map(v => {
      const parts = v.split('-');
      return { type: parts[0] as 'Castaway' | 'Tribe', id: parseInt(parts[1]!) };
    }));
  };

  const handleImport = async () => {
    try {
      await createBaseEvent({
        episodeId,
        eventName: eventName as BaseEventName,
        label: label || null,
        notes: notes.length > 0 ? notes : null,
        references,
      });
      setImported(true);
      await onImported();
    } catch (e) {
      console.error('Failed to import event', e);
      alert('Failed to import event');
    }
  };

  const tooltipData = {
    resolvedRefs: autoResolved.map(r => ({ type: r.type, id: r.id, name: r.name })),
    unresolvedRefs: unresolvedRefs.map(r => ({ type: r.type, name: r.name })),
    match: matchingEvent ? {
      eventId: matchingEvent.eventId,
      eventName: matchingEvent.eventName,
      label: matchingEvent.label,
      refs: matchingEvent.references,
    } : null,
    episodeId,
  };

  return (
    <TooltipProvider>
      <div className={cn(
        'flex flex-col gap-2 p-3 rounded-lg border',
        imported && 'bg-green-500/10 border-green-500/30',
        matchingEvent && !imported && 'border-destructive/30',
      )}>
        {/* Row 1: Episode override, Event name, label, actions */}
        <div className='flex items-center gap-2'>
          <Select
            value={String(episodeId)}
            onValueChange={v => setEpisodeId(Number(v))}>
            <SelectTrigger className='w-24 shrink-0 text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allDbEpisodes.map(ep => (
                <SelectItem key={ep.episodeId} value={String(ep.episodeId)}>
                  Ep {ep.episodeNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eventName} onValueChange={setEventName}>
            <SelectTrigger className='w-36 shrink-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BaseEventNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            className='flex-1'
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder='Label' />

          <div className='flex items-center gap-1 shrink-0'>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type='button' className='p-1 rounded hover:bg-muted'>
                  <Info size={14} className='text-muted-foreground' />
                </button>
              </TooltipTrigger>
              <TooltipContent side='left' className='max-w-sm z-100'>
                <pre className='text-xs whitespace-pre-wrap'>
                  {JSON.stringify(tooltipData, null, 2)}
                </pre>
              </TooltipContent>
            </Tooltip>

            {matchingEvent && (
              <span className='flex items-center gap-1 text-xs text-destructive font-mono bg-destructive/10 px-2 py-1 rounded-full'>
                <Circle className='fill-destructive stroke-destructive' size={8} />
                #{matchingEvent.eventId}
              </span>
            )}
            {imported ? (
              <Check className='text-green-500' size={20} />
            ) : (
              <Button size='sm' onClick={handleImport} disabled={references.length === 0}>
                Import
              </Button>
            )}
          </div>
        </div>

        {unresolvedRefs.length > 0 && (
          <p className='text-xs text-destructive'>
            Unresolved: {unresolvedRefs.map(r => `${r.name} (${r.type})`).join(', ')}
          </p>
        )}

        {/* Row 2: References + Notes */}
        <div className='flex gap-2'>
          <MultiSelect
            className='flex-1'
            options={refOptions}
            defaultValue={defaultRefValues}
            onValueChange={handleRefChange as (_value: (string | number)[]) => void}
            clear={clearCounter}
            placeholder='References'
            maxCount={7}
            modalPopover />

          <Textarea
            className='flex-2 min-h-10 min-w-1/3'
            value={notes.join('\n')}
            onChange={e => setNotes(e.target.value.split('\n'))}
            placeholder='Notes (line separated)' />
        </div>
      </div>
    </TooltipProvider>
  );
}
