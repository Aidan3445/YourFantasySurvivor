'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { HoverCardArrow } from '@radix-ui/react-hover-card';
import { Check, LogOut, Palette, Pencil, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CardContainer from '~/app/_components/cardContainer';
import { Button } from '~/app/_components/commonUI/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '~/app/_components/commonUI/form';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/app/_components/commonUI/hover';
import { Input } from '~/app/_components/commonUI/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/app/_components/commonUI/popover';
import { updateColor, updateDisplayName } from '~/app/api/leagues/actions';
import Swatch from '@uiw/react-color-swatch';
import { hsvaToHex, getContrastingColor, } from '@uiw/color-convert';

interface MemberEditProps {
  color: string;
}

export default function MemberEdit({ color }: MemberEditProps) {

  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger>
        <Settings2 size={16} color={color} />
      </HoverCardTrigger>
      <HoverCardContent className='text-xs p-0.5 w-min text-center border-black shadow-md bg-b2 shadow-zinc-700 flex gap-2' sideOffset={10} side='top'>
        <HoverCardArrow className='absolute -translate-x-1' />
        <EditName />
        <EditColor />
        <LogOut size={16} />
      </HoverCardContent>
    </HoverCard >
  );
}

const editNameSchema = z.object({
  newName: z.string().min(1).max(64)
});

function EditName() {
  const form = useForm<z.infer<typeof editNameSchema>>({
    resolver: zodResolver(editNameSchema),
  });
  const router = useRouter();

  const [nameOpen, setNameOpen] = useState(false);

  const catchUpdate = () => {
    const update = updateDisplayName.bind(null, form.getValues('newName'));
    update()
      .then(() => {
        setNameOpen(false);
        router.refresh();
      })
      .catch((e: Error) => {
        form.setError('newName', { type: 'manual', message: e.message });
      });
  };

  return (
    <Popover open={nameOpen} onOpenChange={setNameOpen}>
      <PopoverTrigger>
        <Pencil size={16} />
      </PopoverTrigger>
      <PopoverContent>
        <CardContainer className='p-5'>
          <Form {...form}>
            <form className='flex flex-col gap-1 text-center' action={catchUpdate}>
              <FormField
                control={form.control}
                name='newName'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className='w-48'
                        type='text'
                        placeholder='Change Display Name'
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <Button type='submit'>Change</Button>
            </form>
          </Form >
        </CardContainer >
      </PopoverContent>
    </Popover>
  );
}

const editColorSchema = z.object({
  newColor: z.string().length(7)
});

function EditColor() {
  const form = useForm<z.infer<typeof editColorSchema>>({
    resolver: zodResolver(editColorSchema),
  });
  const router = useRouter();

  const [colorOpen, setColorOpen] = useState(false);

  const catchUpdate = () => {
    const update = updateColor.bind(null, form.getValues('newColor'));
    update()
      .then(() => {
        setColorOpen(false);
        router.refresh();
      })
      .catch((e: Error) => {
        form.setError('newColor', { type: 'manual', message: e.message });
      });
  };

  return (
    <Popover defaultOpen open={colorOpen} onOpenChange={setColorOpen}>
      <PopoverTrigger>
        <Palette size={16} />
      </PopoverTrigger>
      <PopoverContent>
        <CardContainer className='p-5'>
          <Form {...form}>
            <form className='flex flex-col gap-1 text-center' action={catchUpdate}>
              <FormField
                control={form.control}
                name='newColor'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Swatch
                        className='justify-center w-28 gap-1 m-2'
                        colors={[
                          '#fc0509', '#fc7805', '#fce305', '#80fc05', '#2fc405',
                          '#ed4954', '#db9b34', '#d6c955', '#97e256', '#52ad39',
                          '#05bafc', '#050afc', '#7a05fc', '#cd04f9', '#fc05f9',
                          '#5c94a8', '#496ced', '#9b49ed', '#b44cd3', '#d157c2',
                        ]}
                        color={field.value}
                        rectProps={{
                          children: <Point />,
                          style: {
                            width: '18px',
                            height: '18px',
                            margin: '0px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        }}
                        onChange={(color) => field.onChange(hsvaToHex(color))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <Button type='submit'>Change</Button>
            </form>
          </Form >
        </CardContainer >
      </PopoverContent>
    </Popover>
  );
}

interface SwatchProps {
  color?: string;
  checked?: boolean;
}

function Point({ color, checked }: SwatchProps) {
  if (!checked) return null;

  return (
    <Check size={12} color={getContrastingColor(color!)} />
  );
}
