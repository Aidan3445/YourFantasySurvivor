'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { Input } from '~/components/common/input';
import Swatch, { type SwatchRectRenderProps } from '@uiw/react-color-swatch';
import { type HsvaColor, getContrastingColor, hexToHsva, hexToRgba, hsvaToHex, rgbaToHex } from '@uiw/color-convert';
import { twentyColors } from '~/lib/colors';
import { Check } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useMemo } from 'react';

interface LeagueMemberFieldsProps {
  formPrefix?: string;
  memberColors?: string[];
  currentColor?: string;
}

export default function LeagueMemberFields({ formPrefix, memberColors = [], currentColor }: LeagueMemberFieldsProps) {
  const availableColors = useMemo(() => twentyColors.map((color) => {
    if (color !== currentColor && memberColors.some((memberColor) => memberColor === color)) {
      const rgb = hexToRgba(color);
      const avg = Math.round((rgb.r + rgb.g + rgb.b) / 3);
      return rgbaToHex({ r: avg, g: avg, b: avg, a: 1 });
    }
    return color;
  }), [memberColors, currentColor]);

  const ensureNewColor = (color: HsvaColor, setColor?: (_value: string) => void) => {
    if (color.s === 0) {
      if (setColor) alert('This color is taken by another member');
      return false;
    }
    setColor?.(hsvaToHex(color));
    return true;
  };

  return (
    <section className='flex flex-wrap gap-4 justify-center w-full'>
      <FormField
        name={formPrefix ? `${formPrefix}.displayName` : 'displayName'}
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormDescription className='mt-2 text-sm text-left'>
              Choose your name and color for this league. This is the what will be at the top
              of the leaderboard when you destroy the competition.
              <br />
            </FormDescription>
            <FormLabel className='text-lg'>Display Name</FormLabel>
            <FormControl>
              <Input
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
        name={formPrefix ? `${formPrefix}.color` : 'color'}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className='flex justify-center'>
                <Swatch
                  onChange={(color) => ensureNewColor(color, field.onChange)}
                  colors={availableColors}
                  color={field.value as string}
                  rectRender={(props: SwatchRectRenderProps) => {
                    return (
                      <div
                        className={cn(
                          'border border-primary flex justify-center items-center',
                          !ensureNewColor(hexToHsva(props.color)) ? 'cursor-not-allowed!' : '')}
                        {...(props as React.HTMLAttributes<HTMLDivElement>)}>
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
        )} />
      <i className='text-xs text-muted-foreground w-full text-center mb-2'>
        {'Don\'t worry you can always change your name and color later!'}
        <br />
        Colors that are greyed out are already taken by another member.
      </i>
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

