'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ColorZod, DisplayNameZod, type NewLeagueMember } from '~/server/db/defs/leagueMembers';
import Swatch, { type SwatchRectRenderProps } from '@uiw/react-color-swatch';
import { hsvaToHex, hexToHsva, getContrastingColor, hexToRgba, rgbaToHex, type HsvaColor } from '@uiw/color-convert';
import { twentyColors } from '~/lib/colors';
import { Check } from 'lucide-react';
import { joinLeague } from '~/app/api/leagues/actions';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useLeague } from '~/hooks/useLeague';

const formSchema = z.object({
  displayName: DisplayNameZod,
  color: ColorZod,
}).transform(data => ({
  ...data,
  displayName: data.displayName.trim(),
}));

const defaultValues = {
  displayName: '',
  color: ''
};

interface JoinLeagueFormProps {
  leagueHash: string;
}

export default function JoinLeagueForm({ leagueHash }: JoinLeagueFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const {
    league: {
      members: {
        list: memberColors
      }
    },
  } = useLeague();
  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    reactForm.setValue('displayName', user?.username ?? '');
  }, [user, reactForm]);

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
      <form className=' flex flex-col p-2 gap-2 bg-card rounded-lg w-96' action={() => handleSubmit()}>
        <LeagueMemberFields memberColors={memberColors} />
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

interface LeagueMemberFieldsProps {
  memberColors: { color: string }[];
}

export function LeagueMemberFields({ memberColors = [] }: LeagueMemberFieldsProps) {
  const [availableColors, setAvailableColors] = useState(twentyColors);
  useEffect(() => {
    const takenColors = twentyColors.map((color) => {
      if (memberColors.some((member) => member.color === color)) {
        const rgb = hexToRgba(color);
        const avg = Math.round((rgb.r + rgb.g + rgb.b) / 3);
        return rgbaToHex({ r: avg, g: avg, b: avg, a: 1 });
      }
      return color;
    });
    setAvailableColors(takenColors);
  }, [memberColors]);

  const ensureNewColor = (color: HsvaColor, setColor?: (value: string) => void) => {
    if (color.s === 0) {
      if (setColor) alert('This color is taken by another member');
      return false;
    }
    setColor?.(hsvaToHex(color));
    return true;
  };

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
                  onChange={(color) => ensureNewColor(color, field.onChange)}
                  colors={availableColors}
                  color={field.value as string}
                  rectRender={(props: SwatchRectRenderProps) => {
                    return (
                      <div
                        className={!ensureNewColor(hexToHsva(props.color)) ?
                          '!cursor-not-allowed' : ''}
                        {...props}>
                        <Point color={props.color} checked={props.checked} />
                      </div>
                    );
                  }}
                  rectProps={{
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
        )
        } />
    </section >
  );
}

interface SwatchProps {
  color?: string;
  checked?: boolean;
}

function Point({ color, checked }: SwatchProps) {
  if (!checked) return null;

  return (
    <Check className='z-100' color={getContrastingColor(color!)} />
  );
}
