'use client';

import { Button } from '../common/button';
import { importContestants, importEpisode } from '~/app/api/sys/actions';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Image from 'next/image';
import { Input } from '../common/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../common/form';
import { DateTimePicker } from '../common/dateTimePicker';
import { type NewCastaway } from '~/server/db/defs/castaways';
import { type NewTribe } from '~/server/db/defs/tribes';
import { Circle } from 'lucide-react';

const formSchema = z.object({
  seasonName: z.string(),
  premiereDate: z.date(),
});

export default function Import() {
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      seasonName: '',
    },
    resolver: zodResolver(formSchema),
  });

  const [castaways, setCastaways] = useState<NewCastaway[]>([]);
  const [tribes, setTribes] = useState<NewTribe[]>([]);
  const [premiere, setPremiere] = useState<{ episodeNumber: number, episodeTitle: string, episodeAirDate: string }>();
  const [episodes, setEpisodes] = useState<{ episodeNumber: number, episodeTitle: string, episodeAirDate: string }[]>([]);

  const handleClick = async () => {
    const { castaways, tribes, episodes, premiere } = (await fetch(`/api/sys?seasonName=${reactForm.getValues().seasonName}`, {
      method: 'GET',
    })
      .then(res => res.json())) as {
        castaways: NewCastaway[],
        tribes: NewTribe[],
        episodes: { episodeNumber: number, episodeTitle: string, episodeAirDate: string }[],
        premiere?: { episodeNumber: number, episodeTitle: string, episodeAirDate: string },
      };

    if (castaways.length === 0) {
      alert('No season found');
      return;
    }

    setCastaways(castaways);
    setTribes(tribes);
    setEpisodes(episodes);
    if (premiere) {
      reactForm.setValue('premiereDate', new Date(premiere.episodeAirDate));
      setPremiere(premiere);
    }
  };

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!reactForm.watch('premiereDate') || !premiere) return;
    try {
      await importContestants({ ...data, premiereTitle: premiere?.episodeTitle }, castaways, tribes);
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
          className='flex gap-4 bg-card p-8 rounded-full justify-center'
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
          <FormField
            name='premiereDate'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DateTimePicker
                    date={field.value as Date}
                    setDate={field.onChange}
                    side='bottom' />
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
          </div>
        </div>
      ))}
    </span>
  );
}

interface ImportEpisodeProps {
  episodeNumber: number;
  episodeTitle: string;
  episodeAirDate: string;
  seasonName: string;
}

function ImportEpisode({ seasonName: seasonId, episodeNumber, episodeTitle, episodeAirDate }: ImportEpisodeProps) {
  const handleSubmit = async () => {
    try {
      await importEpisode(seasonId, {
        episodeNumber,
        episodeTitle,
        episodeAirDate: new Date(episodeAirDate).toUTCString()
      });
      alert('Episode imported successfully');
    } catch (error) {
      console.error('Error importing episode', error);
      alert('Error importing episode');
    }
  };

  return (
    <div className='items-center bg-card rounded-lg p-4'>
      <h2 className='font-bold'>Episode {episodeNumber}</h2>
      <p>{episodeTitle}</p>
      <p>{new Date(episodeAirDate).toLocaleString()}</p>
      <form action={() => handleSubmit()}>
        <Button type='submit'>Import Episode</Button>
      </form>
    </div>
  );
}
