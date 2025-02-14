'use client';

import { Button } from '../ui/button';
import { importContestants } from '~/app/api/sys/actions';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { DateTimePicker } from '../ui/dateTimePicker';
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
      premiereDate: new Date(),
    },
    resolver: zodResolver(formSchema),
  });

  const [castaways, setCastaways] = useState<NewCastaway[]>([]);
  const [tribes, setTribes] = useState<NewTribe[]>([]);
  const [episode, setEpisode] = useState<string>('');

  const handleClick = async () => {
    const { castaways, tribes, episode, premiere } = (await fetch(`/api/sys?seasonName=${reactForm.getValues().seasonName}`, {
      method: 'GET',
    })
      .then(res => res.json())) as {
        castaways: NewCastaway[],
        tribes: NewTribe[],
        episode: string,
        premiere: string
      };

    if (castaways.length === 0) {
      alert('No season found');
      return;
    }

    setCastaways(castaways);
    setTribes(tribes);
    setEpisode(episode);
    reactForm.setValue('premiereDate', new Date(premiere));
  };

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await importContestants({ ...data, premiereTitle: episode }, castaways, tribes);
      alert('Contestants imported successfully');
    } catch (error) {
      console.error('Error importing contestants', error);
      alert('Error importing contestants');
    }
  });

  return (
    <Form {...reactForm}>
      <form
        className='w-full space-y-4'
        action={() => handleSubmit()}>
        <span className='flex gap-4 bg-card p-8 rounded-full justify-center'>
          <Button type='button' onClick={handleClick}>Fetch Contestants</Button>
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
        </span>
        <span className='flex gap-4'>
          {tribes.map((tribe, index) => (
            <div key={index} className='flex items-center space-x-4 bg-card rounded-lg p-4'>
              <Circle fill={tribe.color} />
              <h2 className='font-bold'>{tribe.tribeName}</h2>
            </div>
          ))}
          <div className='flex items-center space-x-4 bg-card rounded-lg p-4'>
            <h2 className='font-bold'>Episode</h2>
            <p>{episode}</p>
          </div>
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
      </form>
    </Form>
  );
}

