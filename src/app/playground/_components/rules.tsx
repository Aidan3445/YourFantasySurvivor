import { defaultRules, type BaseEventRules } from '~/server/db/schema/leagues';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Control } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/app/_components/commonUI/form';
import { Input } from '~/app/_components/commonUI/input';
import { Button } from '~/app/_components/commonUI/button';
import CardContainer from '~/app/_components/cardContainer';
import { SecondPlaceInfo } from '~/app/_components/stats/challengesPodium';
import { Separator } from '~/app/_components/commonUI/separator';

interface RulesProps {
    rules?: BaseEventRules;
    setRules: (rules: BaseEventRules) => void;
    className?: string;
}

const numberRange = z.coerce.number()
  .max(512, { message: 'Points must not exceed +/-512' })
  .min(-512, { message: 'Points must not exceed +/-512' });

const formSchema = z.object({
  advFound: numberRange,
  advPlay: numberRange,
  badAdvPlay: numberRange,
  advElim: numberRange,
  spokeEpTitle: numberRange,
  tribe1st: numberRange,
  tribe2nd: numberRange,
  indivWin: numberRange,
  indivReward: numberRange,
  finalists: numberRange,
  fireWin: numberRange,
  soleSurvivor: numberRange,
});

export default function Rules({ setRules, className }: RulesProps) {

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: defaultRules,
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setRules(data);
  };

  const onReset = () => {
    setRules(defaultRules);
    form.reset();
  };

  return (
    <CardContainer className={className}>
      <Form {...form}>
        <form
          className='grid grid-cols-1 md:grid-cols-3 gap-2 p-4 text-black'
          onSubmit={form.handleSubmit(onSubmit)}>
          <Challenges control={form.control} />
          <Advantages control={form.control} />
          <OtherRules control={form.control} />
          <Separator className='w-full my-1 col-span-3' decorative />
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
              onClick={onReset}>
              Reset
            </Button>
          </span>
        </form>
      </Form>
    </CardContainer >
  );
}

interface FieldProps {
    control?: Control<z.infer<typeof formSchema>>;
}

function Challenges({ control }: FieldProps) {
  return (
    <section>
      <FormLabel className='text-2xl'>Challenges</FormLabel>
      <FormField
        control={control}
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
        )}
      />
      <FormField
        control={control}
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
        )}
      />
      <FormField
        control={control}
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
        )}
      />
      <FormField
        control={control}
        name='tribe2nd'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tribe 2nd Place
              <SecondPlaceInfo />
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
        )}
      />
    </section>
  );
}

function Advantages({ control }: FieldProps) {
  return (
    <section>
      <FormLabel className='text-2xl'>Advantages</FormLabel>
      <FormField
        control={control}
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
        )}
      />
      <FormField
        control={control}
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
        )}
      />
      <FormField
        control={control}
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
        )}
      />
      <FormField
        control={control}
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
        )}
      />
    </section>
  );
}

function OtherRules({ control }: FieldProps) {
  return (
    <section>
      <FormLabel className='text-2xl'>Other Rules</FormLabel>
      <FormField
        control={control}
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
        )}
      />
      <FormField
        control={control}
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
        )}
      />
      <FormField
        control={control}
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
        )}
      />
      <FormField
        control={control}
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
        )}
      />
    </section>
  );
}
