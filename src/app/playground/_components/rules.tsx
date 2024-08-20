'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { type z } from 'zod';
import { defaultBaseRules, type BaseEventRuleType, BaseEventRule } from '~/server/db/schema/leagues';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/app/_components/commonUI/form';
import { Input } from '~/app/_components/commonUI/input';
import { Button } from '~/app/_components/commonUI/button';
import CardContainer from '~/app/_components/cardContainer';
import { SecondPlaceInfo } from '~/app/_components/stats/challengesPodium';
import { Separator } from '~/app/_components/commonUI/separator';
import { useEffect } from 'react';

interface RulesProps {
  className?: string;

}

export default function Rules({ className }: RulesProps) {
  const form = useForm<z.infer<typeof BaseEventRule>>({
    defaultValues: defaultBaseRules,
    resolver: zodResolver(BaseEventRule),
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // iterate through form schema and set values to any search params
    Object.keys(BaseEventRule.shape).forEach(key => {
      const value = searchParams.get(key);
      if (value) {
        form.setValue(key as keyof BaseEventRuleType, parseInt(value));
      }
    });
  }, [searchParams, form]);

  const onSubmit = form.handleSubmit((data: z.infer<typeof BaseEventRule>) => {
    const url = new URL(pathname, window.location.href);

    // set the season param
    url.searchParams.set('season', searchParams.get('season')!);

    // map through form data and set search params
    Object.entries(data).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });

    // push new search params to router
    router.push(url.pathname + url.search, { scroll: false });
  });

  return (
    <CardContainer className={className}>
      <Form {...form}>
        <form
          className='grid grid-cols-1 gap-2 p-4 text-black md:grid-cols-3'
          onSubmit={onSubmit}>
          <Challenges />
          <Advantages />
          <Other />
          <Separator className='col-span-3 my-1 w-full' decorative />
          <div className='col-span-2 text-sm'>
            <p>
              You can adjust the point values for each event to customize your
              league as you wish.
              <br />
              Below is a scoreboard to see how these rules
              would score in previous seasons.
            </p>
          </div>
          <span className='flex gap-4 justify-end'>
            <Button className='w-2/3' type='submit'>
              Apply
            </Button>
            <Button
              className='w-1/3'
              type='reset'
              onClick={async () => { form.reset(); await onSubmit(); }}>
              Reset
            </Button>
          </span>
        </form>
      </Form>
    </CardContainer >
  );
}

export function Challenges() {
  return (
    <section>
      <FormLabel className='text-2xl'>Challenges</FormLabel>
      <FormField
        name='indivWin'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Individual Immunity</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for winning an individual immunity challenge
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='indivReward'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Individual Reward</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for winning an individual reward challenge
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='tribe1st'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tribe 1st Place</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for winning a tribe challenge
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='tribe2nd'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tribe <SecondPlaceInfo /> Place
            </FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for placing second in a tribe challenge
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}

export function Advantages() {
  return (
    <section>
      <FormLabel className='text-2xl'>Advantages</FormLabel>
      <FormField
        name='advFound'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Advantage Found</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for finding an advantage
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='advPlay'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Advantage Played</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for playing an advantage
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='badAdvPlay'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bad Advantage Played</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points deducted for playing a bad advantage
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='advElim'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Advantage Eliminated</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points deducted for going home with an advantage
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}

export function Other() {
  return (
    <section>
      <FormLabel className='text-2xl'>Other Rules</FormLabel>
      <FormField
        name='spokeEpTitle'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Spoke Episode Title</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for saying the episode title qutote
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='finalists'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Finalists</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for making it to final tribal council
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='fireWin'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fire Making Win</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for winning the fire making challenge
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        name='soleSurvivor'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sole Survivor</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-24 text-black'
                  type='number'
                  placeholder='Points'
                  {...field} />
              </FormControl>
              <FormDescription className='w-56 text-wrap'>
                Points for winning the season
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}
