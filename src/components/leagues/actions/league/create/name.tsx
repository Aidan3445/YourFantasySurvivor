'use client';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { useEffect, useState } from 'react';

const placeholderOptions = [
  'Jeff Probst Fan Club',
  'Torch Snuffers',
  'Jury\'s Out'
];

export default function LeagueNameField() {
  const [placeholder, setPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) => (prev + 1) % placeholderOptions.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [setPlaceholder]);

  return (
    <section className='mx-2'>
      <FormField
        name='leagueName'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-lg'>League Name</FormLabel>
            <FormControl>
              <Input
                className='w-full h-12 indent-2 placeholder:italic'
                type='text'
                autoComplete='off'
                autoCapitalize='on'
                placeholder={placeholderOptions[placeholder]}
                {...field} />
            </FormControl>
            <FormDescription className='text-sm text-left'>
              Pick a fun or creative name for your league!
              This is how your league will appear to members.
              {' Don\'t worry, you can change this later.'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}
