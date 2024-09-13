'use client';
import { z } from 'zod';
import { type ComponentProps } from '~/lib/utils';
import { type SeasonEventRuleType } from '~/server/db/schema/seasonEvents';
import { PredictionCard } from '../../_components/settings/predictionCard';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/app/_components/commonUI/select';
import { type Tribe } from '~/server/db/schema/tribes';
import { type Member } from '~/server/db/schema/members';
import { type CastawayDetails } from '~/server/db/schema/castaways';
import { type FormState, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/app/_components/commonUI/form';
import { Button } from '~/app/_components/commonUI/button';
import { MemberRow as ColorRow } from '../../_components/members';
import { getContrastingColor } from '@uiw/color-convert';
import { useState } from 'react';

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
  pickCount = 2;

  const draftSchema = z.object({
    firstPick: z.string(),
    secondPick: z.string().refine((value) => value || pickCount === 1),
    castaway: z.array(z.string()),
    tribe: z.array(z.string()),
    member: z.array(z.string())
  });
  type Data = z.infer<typeof draftSchema>;

  const form = useForm<Data>({
    resolver: zodResolver(draftSchema),
  });

  const submitPicks = async (data: Data) => {
    console.log('success', data);
  };

  return (
    <Form {...form}>
      <form className={className} onSubmit={form.handleSubmit(submitPicks)}>
        <MainPicks pickCount={pickCount} options={castawaysByTribe} formState={form.formState} />
        {castaway &&
          <div>
            <br />
            <FormLabel className='text-2xl'>Castaway Predictions</FormLabel>
            <div className='flex flex-col gap-1'>
              {castaway?.map((c, index) => (
                <PredictionCard key={index} className='flex flex-col justify-center' prediction={c} parity={index % 2 === 0}>
                  <FormItem className='justify-center flex flex-col rounded-md my-0'>
                    <FormControl>
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
                    </FormControl>
                    <FormMessage className='text-left pl-12'>{form.formState.errors.castaway?.[index]?.message}</FormMessage>
                  </FormItem>
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
                  <FormItem className='justify-center flex flex-col rounded-md my-0'>
                    <FormControl>
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
                                  <ColorRow color={pick.color} className='w-52'>
                                    <h3 style={{ color: getContrastingColor(pick.color) }}>{pick.name}</h3>
                                  </ColorRow>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )} />
                    </FormControl>
                    <FormMessage className='text-left pl-12'>{form.formState.errors.tribe?.[index]?.message}</FormMessage>
                  </FormItem>
                </PredictionCard>
              ))}
            </div>
          </div>}
        {member &&
          <div>
            <br />
            <h2 className='text-2xl text-center font-semibold'>Member Predictions</h2>
            <div className='flex flex-col gap-1'>
              {member?.map((m, index) => (
                <PredictionCard key={index} className='flex flex-col justify-center' prediction={m} parity={index % 2 === 0}>
                  <FormItem className='justify-center flex flex-col rounded-md my-0'>
                    <FormControl>
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
                                    <ColorRow color={pick.color} className='w-52'>
                                      <h3 style={{ color: getContrastingColor(pick.color) }}>{pick.displayName}</h3>
                                    </ColorRow>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        )} />
                    </FormControl>
                    <FormMessage className='text-left pl-12'>{form.formState.errors.member?.[index]?.message}</FormMessage>
                  </FormItem>
                </PredictionCard>
              ))}
            </div>
          </div>}
        <Button type='submit' className='mt-4'>Submit Draft</Button>
      </form >
    </Form >
  );
}

interface PicksProps {
  pickCount: number;
  options: Record<string, CastawayDetails[]>;
  formState: FormState<{ firstPick: string; secondPick?: string; }>;
}

function MainPicks({ pickCount, options, formState }: PicksProps) {
  const [pick1, setPick1] = useState<string | undefined>();
  const [pick2, setPick2] = useState<string | undefined>();

  return (
    <div className='flex flex-col gap-1'>
      <FormLabel className='text-2xl'> Pick your Survivor{pickCount > 1 ? 's' : ''}</FormLabel>
      <FormField
        name='firstPick'
        render={({ field }) => (
          <FormItem className='justify-center flex flex-col rounded-md bg-b4/70 p-2 my-0'>
            <FormControl>
              <Select onValueChange={(val) => { setPick1(val); field.onChange(val); }} {...field}>
                <SelectTrigger>
                  <SelectValue placeholder='First Pick' />
                </SelectTrigger>
                <SelectCastawaysByTribe castawaysByTribe={options} otherChoices={[pick2]} />
              </Select>
            </FormControl>
            <FormMessage className='text-left pl-12'>{formState.errors.firstPick?.message}</FormMessage>
          </FormItem>)} />
      {pickCount > 1 &&
        <FormField
          name='secondPick'
          render={({ field }) => (
            <FormItem className='justify-center flex flex-col rounded-md bg-b3/80 p-2 my-0'>
              <FormControl>
                <Select onValueChange={(val) => { setPick2(val); field.onChange(val); }} {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder='Second Pick' />
                  </SelectTrigger>
                  <SelectCastawaysByTribe castawaysByTribe={options} otherChoices={[pick1]} />
                </Select>
              </FormControl>
              <FormMessage className='text-left pl-12'>{formState.errors.secondPick?.message}</FormMessage>
            </FormItem >)
          } />}
    </div>
  );
}

interface SelectCastawaysByTribeProps {
  castawaysByTribe: Record<string, CastawayDetails[]>;
  otherChoices?: (string | undefined)[];
}

function SelectCastawaysByTribe({ castawaysByTribe, otherChoices }: SelectCastawaysByTribeProps) {
  return (
    <SelectContent>
      {Object.entries(castawaysByTribe).map(([tribe, castaways]) => (
        <SelectGroup key={tribe}>
          <SelectLabel>
            <ColorRow color={castaways[0]!.startingTribe.color} className='w-56 -mx-4 px-4 italic'>
              <h3 style={{ color: getContrastingColor(castaways[0]!.startingTribe.color) }}>{tribe}</h3>
            </ColorRow>
          </SelectLabel>
          {castaways
            .filter((castaway) => !otherChoices?.includes(castaway.name)) // Filter out selected choices
            .map((castaway) => (
              <SelectItem key={castaway.name} value={castaway.name}>
                <ColorRow color={castaway.startingTribe.color} className='w-52'>
                  <h3 style={{ color: getContrastingColor(castaway.startingTribe.color) }}>{castaway.name}</h3>
                </ColorRow>
              </SelectItem>
            ))}
        </SelectGroup>
      ))}
    </SelectContent>
  );
}
