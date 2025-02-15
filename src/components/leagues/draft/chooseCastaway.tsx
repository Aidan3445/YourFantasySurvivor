'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form';
import { Button } from '~/components/ui/button';
import { useLeague } from '~/hooks/useLeague';
import { type CastawayDraftInfo } from '~/server/db/defs/castaways';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { chooseCastaway } from '~/app/api/leagues/actions';

interface ChooseCastawayProps {
  castaways: CastawayDraftInfo[];
  onDeck: boolean;
}

const formSchema = z.object({
  castawayId: z.coerce.number({ required_error: 'Please select a castaway' }),
});

export default function ChooseCastaway({ castaways, onDeck }: ChooseCastawayProps) {
  const {
    league: {
      leagueHash
    }
  } = useLeague();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const availableCastaways = castaways.filter(castaway => !castaway.pickedBy);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      await chooseCastaway(leagueHash, data.castawayId, true);
      alert('Castaway chosen successfully');
    } catch (error) {
      alert('Failed to choose castaway');
    }
  });

  return (
    <Form {...reactForm}>
      <form className='bg-card p-1 rounded-lg text-center' action={() => handleSubmit()}>
        <h1 className='text-2xl font-semibold'>
          {onDeck ? 'You\'re on deck!' : 'You\'re on the clock!'}
        </h1>
        <span className='w-full flex justify-between gap-4 items-center p-1'>
          <FormField
            name='castawayId'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select castaway' />
                    </SelectTrigger>
                    <SelectContent className='z-50'>
                      {availableCastaways.map((castaway) => (
                        <SelectItem key={castaway.fullName} value={`${castaway.castawayId}`}>
                          {castaway.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )} />
          <Button
            disabled={!formSchema.safeParse(reactForm.watch())?.success || onDeck}
            type='submit'>
            {onDeck ? 'Almost ready!' : 'Submit Pick!'}
          </Button>
        </span>
      </form>
    </Form>
  );
}

/*
    <AlertDialog defaultOpen>
      <AlertDialogTrigger asChild>
        <Button>Make your pick!</Button>
      </AlertDialogTrigger>
      <AlertDialogContent >
        <AlertDialogHeader>
          <AlertDialogTitle>Choose your castaway!</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          This castaway will earn you points based on their performance in the game.
          <br />
          Additionally you will earn points for each successive episode they
          survive (i.e one point for the first episode, two for the second, etc.)
          {survivalCap ? ` up to a maximum of ${survivalCap} points.` : '.'}
          <br />
          When they are voted out you will select from the remaining castaways.
        </AlertDialogDescription>
            <AlertDialogFooter className='w-full'>
              <AlertDialogAction asChild>
                <Button
                  onClick={() => console.log(formSchema.parse(reactForm.watch()))}
                  //disabled={!formSchema.safeParse(reactForm.watch())?.success}
                  className='w-full'
                  type='submit'>Submit Pick</Button>
              </AlertDialogAction>
            </AlertDialogFooter> 
      </AlertDialogContent>
    </AlertDialog >
*/
