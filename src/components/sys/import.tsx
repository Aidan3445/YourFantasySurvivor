'use client';

import { Button } from '~/components/common/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Image from 'next/image';
import { Input } from '~/components/common/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/components/common/form';
import { Circle } from 'lucide-react';
import { type CastawayInsert } from '~/types/castaways';
import { type TribeInsert } from '~/types/tribes';
import createEpisode from '~/actions/sys/createEpisode';
import createTribe from '~/actions/sys/createTribe';
import createCastaway from '~/actions/sys/createCastaway';

const formSchema = z.object({
  seasonName: z.string(),
});

export default function Import() {
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      seasonName: '',
    },
    resolver: zodResolver(formSchema),
  });

  const [castaways, setCastaways] = useState<CastawayInsert[]>([]);
  const [tribes, setTribes] = useState<TribeInsert[]>([]);
  const [episodes, setEpisodes] = useState<{ episodeNumber: number, title: string, airDate: string }[]>([]);

  const handleClick = async () => {
    const { castaways, tribes, episodes } = (await fetch(`/api/sys?seasonName=${reactForm.getValues().seasonName}`, {
      method: 'GET',
    })
      .then(res => res.json())) as {
        castaways: CastawayInsert[],
        tribes: TribeInsert[],
        episodes: { episodeNumber: number, title: string, airDate: string }[],
      };

    if (!castaways || castaways.length === 0) {
      alert('No castaways found');
      return;
    }

    setCastaways(castaways);
    setTribes(tribes);
    setEpisodes(episodes);
  };

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await Promise.all(tribes.map(tribe => createTribe(data.seasonName, tribe)));
      await Promise.all(castaways.map(castaway => createCastaway(data.seasonName, castaway)));

      alert('Contestants imported successfully');
    } catch (error) {
      console.error('Error importing contestants', error);
      alert('Error importing contestants');
    }
  });

  return (
    <span className='w-full space-y-4'>
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
                  <Input
                    type='text'
                    placeholder='Season Name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          <Button type='submit' disabled={castaways.length === 0}>Import Contestants</Button>
        </form>
      </Form>
      <span className='flex gap-4'>
        {tribes.map((tribe, index) => (
          <div key={index} className='flex items-center space-x-4 bg-card rounded-lg p-4'>
            <Circle fill={tribe.tribeColor} />
            <h2 className='font-bold'>{tribe.tribeName}</h2>
          </div>
        ))}
        {episodes.map((episode, index) => (
          <ImportEpisode key={index} {...episode} seasonName={reactForm.watch('seasonName')} />
        ))}
      </span>
      {castaways.map((castaway, index) => (
        <div key={index} className='flex items-center space-x-4 bg-card rounded-lg p-4'>
          <Image
            src={castaway.imageUrl}
            alt={castaway.fullName}
            width={48}
            height={48} />
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
    </span>
  );
}

interface ImportEpisodeProps {
  episodeNumber: number;
  title: string;
  airDate: string;
  seasonName: string;
}

function ImportEpisode({ seasonName: seasonId, episodeNumber, title, airDate }: ImportEpisodeProps) {
  const handleSubmit = async () => {
    try {
      await createEpisode(seasonId, {
        episodeNumber,
        title: title.replaceAll('"', ''),
        airDate: new Date(airDate),
        /*
          airDate: new Date(Date.now() + (1000 * 60 * 16)),
        episodeNumber: 0,
        title: 'TEST EPISODE',
        */
        isMerge: isMerge,
        isFinale,
        runtime,

      });
      alert('Episode imported successfully');
    } catch (error) {
      console.error('Error importing episode', error);
      alert('Error importing episode');
    }
  };

  const [isMerge, setIsMerge] = useState(false);
  const [isFinale, setIsFinale] = useState(false);
  const [runtime, setRuntime] = useState(90);

  return (
    <div className='items-center bg-card rounded-lg p-4'>
      <h2 className='font-bold'>Episode {episodeNumber}</h2>
      <p>{title}</p>
      <p>{new Date(airDate).toDateString()}</p>
      <form action={() => handleSubmit()}>
        <label className='inline-flex items-center space-x-2'>
          <input
            type='checkbox'
            checked={isMerge}
            onChange={() => setIsMerge(!isMerge)} />
          <span>Is Merge</span>
        </label>
        <label className='inline-flex items-center space-x-2 ml-4'>
          <input
            type='checkbox'
            checked={isFinale}
            onChange={() => setIsFinale(!isFinale)} />
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
    </div>
  );
}
