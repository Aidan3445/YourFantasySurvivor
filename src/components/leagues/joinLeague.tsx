'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { ColorZod, DisplayNameZod, type LeagueMemberColor, type NewLeagueMember } from '~/server/db/defs/leagueMembers';
import Swatch, { type SwatchRectRenderProps } from '@uiw/react-color-swatch';
import { type HsvaColor, getContrastingColor, hexToHsva, hexToRgba, hsvaToHex, rgbaToHex } from '@uiw/color-convert';
import { twentyColors } from '~/lib/colors';
import { Check } from 'lucide-react';
import { joinLeague } from '~/app/api/leagues/actions';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { useYfsUser } from '~/hooks/useYfsUser';
import { cn } from '~/lib/utils';

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
  const [memberColors, setMemberColors] = useState<LeagueMemberColor[]>([]);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const { addLeague } = useYfsUser();

  useEffect(() => {
    reactForm.setValue('displayName', user?.username ?? '');
  }, [user, reactForm]);

  useEffect(() => {
    async function fetchMemberColors() {
      await fetch(`/api/leagues/${leagueHash}/join`)
        .then(res => res.json())
        .then(({ memberColors }: { memberColors: LeagueMemberColor[] }) => {
          setMemberColors(memberColors);
        });
    }

    void fetchMemberColors();
  }, [leagueHash, setMemberColors]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const member: NewLeagueMember = {
        displayName: data.displayName,
        color: data.color,
        role: 'Member',
      };

      const leagueInfo = await joinLeague(leagueHash, member);
      addLeague(leagueInfo);
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
  memberColors?: LeagueMemberColor[];
}

export function LeagueMemberFields({ memberColors = [] }: LeagueMemberFieldsProps) {
  const availableColors = useMemo(() => twentyColors.map((color) => {
    if (memberColors.some((memberColor) => memberColor === color)) {
      const rgb = hexToRgba(color);
      const avg = Math.round((rgb.r + rgb.g + rgb.b) / 3);
      return rgbaToHex({ r: avg, g: avg, b: avg, a: 1 });
    }
    return color;
  }), [memberColors]);

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
                placeholder='Choose a display name for yourself in this league'
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
                        className={cn(
                          'border border-primary',
                          !ensureNewColor(hexToHsva(props.color)) ? '!cursor-not-allowed' : '')}
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
