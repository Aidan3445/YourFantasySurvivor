'use client';
import { z } from 'zod';
import { type ComponentProps } from '~/lib/utils';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { PredictionCard } from '../../_components/settings/predictionCard';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { type Tribe } from '~/server/db/schema/tribes';
import { type Member } from '~/server/db/schema/members';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { Circle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/app/_components/commonUI/form';
import { Button } from '~/app/_components/commonUI/button';
import { MemberRow } from '../../_components/members';
import { getContrastingColor } from '@uiw/color-convert';

export interface DraftFormProps extends ComponentProps {
  pickCount: number;
  castaway?: SeasonEventRuleType[];
  tribe?: SeasonEventRuleType[];
  member?: SeasonEventRuleType[];
  picks: {
    castaways: CastawayDetails[];
    tribes: Tribe[];
    members: Member[];
  };
}

export default function DraftForm({
  pickCount,
  castaway,
  tribe,
  member,
  picks,
  className
}: DraftFormProps) {
  const castawaysByTribe: Record<string, CastawayDetails[]> = picks.castaways.reduce((acc, c) => {
    if (!acc[c.startingTribe.name]) acc[c.startingTribe.name] = [];
    acc[c.startingTribe.name]!.push(c);
    return acc;
  }, {} as Record<string, CastawayDetails[]>);

  const draftSchema = z.object({
    firstPick: z.string(),
    secondPick: z.string().optional(),
    castaway: z.array(z.string()),
    tribe: z.array(z.string()),
    member: z.array(z.string())
  }).refine((data) => (pickCount == 1 && !data.secondPick) || (pickCount == 2 && data.secondPick)
    , { message: 'You must make a second pick', })
    .refine((data) => !castaway || data.castaway.filter((c) => c).length === castaway.length,
      { message: 'You must make all castaway predictions', })
    .refine((data) => !tribe || data.tribe.filter((t) => t).length === tribe.length,
      { message: 'You must make all tribe predictions', })
    .refine((data) => !member || data.member.filter((m) => m).length === member.length,
      { message: 'You must make all member predictions', });

  const form = useForm<z.infer<typeof draftSchema>>({
    resolver: zodResolver(draftSchema),
  });

  return (
    <Form {...form}>
      <form className={className} onSubmit={(e) => {
        e.preventDefault();
        console.log(form.getValues());
        console.log(draftSchema.parse(form.getValues()));
      }
      }>
        <MainPicks pickCount={pickCount} options={castawaysByTribe} />
        {castaway &&
          <div>
            <br />
            <FormLabel className='text-2xl'>Castaway Predictions</FormLabel>
            <div className='flex flex-col gap-1'>
              {castaway?.map((c, index) => (
                <PredictionCard key={index} className='flex flex-col justify-center' prediction={c} parity={index % 2 === 0}>
                  <FormField
                    name={`castaway[${index}]`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} {...field}>
                        <SelectTrigger>
                          <SelectValue placeholder='Choose a Castaway' />
                        </SelectTrigger>
                        <SelectCastawaysByTribe castawaysByTribe={castawaysByTribe} />
                      </Select>
                    )}
                  />
                </PredictionCard>
              ))}
            </div>
          </div>}
        {tribe &&
          <div>
            <br />
            <FormLabel className='text-2xl'>Tribe Predictions</FormLabel>
            <div className='flex flex-col gap-1'>
              {tribe?.map((t, index) => (
                <PredictionCard key={index} className='flex flex-col justify-center' prediction={t} parity={index % 2 === 0}>
                  <FormField
                    name={`tribe[${index}]`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} {...field}>
                        <SelectTrigger>
                          <SelectValue placeholder='Choose a Tribe' />
                        </SelectTrigger>
                        <SelectContent>
                          {picks.tribes.map((pick) => (
                            <SelectItem key={pick.name} value={pick.name}>
                              <span className='inline-flex justify-between w-52'>
                                {pick.name}
                                <Circle className='ml-auto' fill={pick.color} color='none' />
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )} />
                </PredictionCard>
              ))}
            </div>
          </div>
        }
        {
          member &&
          <div>
            <br />
            <h2 className='text-2xl text-center font-semibold'>Member Predictions</h2>
            <div className='flex flex-col gap-1'>
              {member?.map((m, index) => (
                <PredictionCard key={index} className='flex flex-col justify-center' prediction={m} parity={index % 2 === 0}>
                  <FormField
                    name={`member[${index}]`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} {...field}>
                        <SelectTrigger>
                          <SelectValue placeholder='Choose a Member' />
                        </SelectTrigger>
                        <SelectContent>
                          {picks.members.map((pick) => {
                            if (pick.loggedIn) return null;
                            return (
                              <SelectItem key={pick.displayName} value={pick.displayName}>
                                <MemberRow color={pick.color} className='w-52'>
                                  <h3 style={{ color: getContrastingColor(pick.color) }}>{pick.displayName}</h3>
                                </MemberRow>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )} />
                </PredictionCard>
              ))}
            </div>
          </div>
        }
        <FormMessage />
        <Button type='submit' className='mt-4'>Submit Draft</Button>
      </form >
    </Form >
  );
}

interface PicksProps {
  pickCount: number;
  options: Record<string, CastawayDetails[]>;
}

function MainPicks({ pickCount, options }: PicksProps) {
  return (<>
    <FormLabel className='text-2xl'> Pick your Survivor{pickCount > 1 ? 's' : ''}</FormLabel>
    <FormField
      name='firstPick'
      render={({ field }) => (
        <FormItem className='justify-center flex flex-col rounded-md bg-b4/70 p-2 my-0'>
          <FormControl>
            <Select onValueChange={field.onChange} {...field}>
              <SelectTrigger>
                <SelectValue placeholder='First Pick' />
              </SelectTrigger>
              <SelectCastawaysByTribe castawaysByTribe={options} />
            </Select>
          </FormControl>
        </FormItem>)} />
    {pickCount > 1 &&
      <FormField
        name='secondPick'
        render={({ field }) => (
          <FormItem className='justify-center flex flex-col rounded-md bg-b3/80 p-2 my-0'>
            <FormControl>
              <Select onValueChange={field.onChange} {...field}>
                <SelectTrigger>
                  <SelectValue placeholder='Second Pick' />
                </SelectTrigger>
                <SelectCastawaysByTribe castawaysByTribe={options} />
              </Select>
            </FormControl>
          </FormItem >)
        } />}
  </>);
}

interface SelectCastawaysByTribeProps {
  castawaysByTribe: Record<string, CastawayDetails[]>;
}

function SelectCastawaysByTribe({ castawaysByTribe }: SelectCastawaysByTribeProps) {
  return (
    <SelectContent>
      {Object.entries(castawaysByTribe).map(([tribe, castaways]) => (
        <SelectGroup key={tribe}>
          <SelectLabel>{tribe}</SelectLabel>
          {castaways.map((castaway) => (
            <SelectItem key={castaway.name} value={castaway.name}>
              {castaway.name}
            </SelectItem>
          ))}
        </SelectGroup>
      ))}
    </SelectContent>
  );
}
