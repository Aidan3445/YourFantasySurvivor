'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { DISPLAY_NAME_MAX_LENGTH, type NewLeagueMember } from '~/server/db/defs/leagueMembers';
import Swatch from '@uiw/react-color-swatch';
import { hsvaToHex, getContrastingColor } from '@uiw/color-convert';
import { twentyColors } from '~/lib/colors';
import { Check } from 'lucide-react';
import { joinLeague } from '~/app/api/leagues/actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  displayName: z.string().min(2).max(DISPLAY_NAME_MAX_LENGTH),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
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
      <form className=' flex flex-col gap-2 bg-card p-2 rounded-lg w-96' action={() => handleSubmit()}>
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
                  placeholder='Choose a display name'
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
