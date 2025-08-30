'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import { type LeagueMemberColor } from '~/types/leagueMembers';
import Swatch, { type SwatchRectRenderProps } from '@uiw/react-color-swatch';
import { type HsvaColor, getContrastingColor, hexToHsva, hexToRgba, hsvaToHex, rgbaToHex } from '@uiw/color-convert';
import { twentyColors } from '~/lib/colors';
import { Check } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useMemo } from 'react';

interface LeagueMemberFieldsProps {
  memberColors?: LeagueMemberColor[];
}

export default function LeagueMemberFields({ memberColors = [] }: LeagueMemberFieldsProps) {
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
    <section className='mx-2 flex flex-wrap gap-4 justify-center w-full'>
      <FormField
        name='displayName'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormDescription className='mt-2 text-sm text-left'>
              Choose your name and color for this league. This is the name that will be at the top
              of the leaderboard when you destroy the competition.
              <br />
              You can update this at any time, both must be unique within the league.
            </FormDescription>
            <FormLabel className='text-lg'>Display Name</FormLabel>
            <FormControl>
              <Input
                className='w-full h-12 indent-2 placeholder:italic'
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
            <FormControl>
              <div className='flex justify-center'>
                <Swatch
                  className='pb-4'
                  onChange={(color) => ensureNewColor(color, field.onChange)}
                  colors={availableColors}
                  color={field.value as string}
                  rectRender={(props: SwatchRectRenderProps) => {
                    return (
                      <div
                        className={cn(
                          'border border-primary flex justify-center items-center',
                          !ensureNewColor(hexToHsva(props.color)) ? 'cursor-not-allowed!' : '')}
                        {...props}>
                        <Point color={props.color} checked={props.checked} />
                      </div>
                    );
                  }}
                  rectProps={{
                    style: {
                      width: '50px',
                      height: '50px',
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

