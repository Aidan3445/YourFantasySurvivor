'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ColorZod, DisplayNameZod, type NewLeagueMember } from '~/server/db/defs/leagueMembers';
import Swatch from '@uiw/react-color-swatch';
import { hsvaToHex, getContrastingColor } from '@uiw/color-convert';
import { twentyColors } from '~/lib/colors';
import { Check } from 'lucide-react';
import { joinLeague } from '~/app/api/leagues/actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  displayName: DisplayNameZod,
  color: ColorZod,
}).transform(data => ({
  ...data,
  displayName: data.displayName.trim(),
}));

const defaultValues: z.infer<typeof formSchema> = {
  displayName: '',
  color: '',
};

interface JoinLeagueFormProps {
  leagueHash: string;
}

export default function JoinLeagueForm({ leagueHash }: JoinLeagueFormProps) {
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues, resolver: zodResolver(formSchema)
  });
  const router = useRouter();

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const member: NewLeagueMember = {
        displayName: data.displayName,
        color: data.color,
        role: 'member',
      };

      await joinLeague(leagueHash, member);
      alert('Successfully joined league');
      router.push(`/leagues/${leagueHash}`);
    } catch (error) {
      console.error(error);
      alert('Failed to join league');
    }
  });

  return (
    <Form {...reactForm}>
      <form className=' flex flex-col gap-2 bg-card rounded-lg w-96' action={() => handleSubmit()}>
        <LeagueMemberFields />
        <Button
          className='w-full'
          type='submit'
          disabled={!reactForm.formState.isValid}>
          Join League
        </Button>
      </form>
    </Form>
  );
}

export function LeagueMemberFields() {
  return (
    <section className='mx-2'>
      <FormField
        name='displayName'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display Name</FormLabel>
            <FormControl>
              <Input
                className='w-full'
                type='text'
                autoComplete='off'
                autoCapitalize='on'
                placeholder='Choose a display name for your league profile'
                {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='color'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display Color</FormLabel>
            <FormControl>
              <div className='flex w-full justify-center'>
                <Swatch
                  className='gap-1 justify-center'
                  onChange={(color) => field.onChange(hsvaToHex(color))}
                  colors={twentyColors}
                  color={field.value as string}
                  rectProps={{
                    children: <Point />,
                    style: {
                      width: '65px',
                      height: '65px',
                      margin: '0px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  }} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}

interface SwatchProps {
  color?: string;
  checked?: boolean;
}

function Point({ color, checked }: SwatchProps) {
  if (!checked) return null;

  return (
    <Check color={getContrastingColor(color!)} />
  );
}
