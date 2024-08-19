'use client';
import { SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm, type Control } from 'react-hook-form';
import { z } from 'zod';
import CardContainer from '~/app/_components/cardContainer';
import { Button } from '~/app/_components/commonUI/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/app/_components/commonUI/form';
import { Input } from '~/app/_components/commonUI/input';
import { Label } from '~/app/_components/commonUI/label';
import { useToast } from '~/app/_components/commonUI/use-toast';
import { cn } from '~/lib/utils';
import { type LeagueInsert } from '~/server/db/schema/leagues';

const formSchema = z.object({
  name: z.string()
    .min(3, { message: 'League name must be between 3 and 64 characters' })
    .max(64, { message: 'League name must be between 3 and 64 characters' }),
  password: z.string().min(5).max(64).or(z.literal('')),
  passwordConfirmation: z.string(),
  pickCount: z.literal(1).or(z.literal(2)),
  uniquePicks: z.boolean(),
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation']
}).transform(data => {
  data.passwordConfirmation = '';
  return data;
});

const defaultValues = {
  name: '',
  password: '',
  passwordConfirmation: '',
  pickCount: 1,
  uniquePicks: true,
} as z.infer<typeof formSchema>;

interface CreateLeagueFormProps {
  className?: string;
  closePopup?: () => void;
  subtitle?: string;
}

export default function CreateLeagueForm({ className, subtitle, closePopup }: CreateLeagueFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();

  const onSubmit = form.handleSubmit(async (data: z.infer<typeof formSchema>) => {
    const latestSeason = await fetch(
      '/api/seasons/latest',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    ).then(res => res.json() as Promise<number>);

    const newLeague: LeagueInsert = {
      ...data,
      season: latestSeason,
    };

    await fetch(
      '/api/leagues/create',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newLeague, displayName: user?.username })
      })
      .then(async res => {
        const status = res.status;
        const data = await (res.json() as Promise<number | { message: string }>);

        if (typeof data === 'number') {
          closePopup?.();
          router.push(`/leagues/${data}`);
        } else if (status === 401) throw new Error('Must be signed in to join a league');
        else if (status === 409) form.setError('name', { type: 'manual', message: 'A league already exists with this name' });
        else throw new Error(data.message);
      }).catch((e) => {
        if (e instanceof Error) {
          toast({
            title: 'Error creating league',
            description: e.message,
            variant: 'error',
          });
        }
      });
  });

  return (
    <CardContainer className={className}>
      <SignedOut>
        <SignInButton>
          <Button className='absolute inset-y-1/2 z-10 place-self-center font-medium text-md'>
            Sign in to create a league
          </Button>
        </SignInButton>
      </SignedOut>
      <Form {...form}>
        <form
          className={cn('flex flex-col gap-4', isSignedIn ? '' : 'blur pointer-events-none')}
          onSubmit={onSubmit}>
          <section className='flex flex-col gap-0'>
            <Label className='text-2xl font-medium'>Create League</Label>
            <FormDescription>{subtitle}</FormDescription>
          </section>
          <NameAndPassword control={form.control} disabled={!isSignedIn} />
          <span className='flex gap-4 justify-end'>
            <Button className='w-2/3' type='submit'>
              Create
            </Button>
            <Button
              className='w-1/3'
              type='reset'
              onClick={() => form.reset()}>
              Reset
            </Button>
          </span>
        </form>
      </Form >
    </CardContainer >
  );
}

interface FieldProps {
  control?: Control<z.infer<typeof formSchema>>;
  form?: ReturnType<typeof useForm<z.infer<typeof formSchema>>>
  disabled?: boolean;
}

function NameAndPassword({ control }: FieldProps) {
  return (
    <section>
      <FormField
        control={control}
        name='name'
        render={({ field }) => (
          <FormItem>
            <FormLabel>League Name</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-32'
                  type='text'
                  placeholder='League Name'
                  autoComplete='off'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The name of your league
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        control={control}
        name='password'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password (optional)</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-32'
                  type='text'
                  placeholder='Password'
                  autoComplete='off'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Password to join the league
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        control={control}
        name='passwordConfirmation'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <Input
                  className='w-32'
                  type='password'
                  placeholder='Confirm'
                  autoComplete='off'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Confirm your password
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}

/*
function Settings({ control, form }: FieldProps) {
  return (
    <section>
      <FormField
        control={control}
        name='pickCount'
        render={() => (
          <FormItem>
            <FormLabel>Pick Count</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <span className='grid grid-cols-3 place-items-center'>
                  <Label className='text-sm'>1</Label>
                  <Switch
                    checked={form?.getValues('pickCount') === 2}
                    onCheckedChange={() => {
                      form?.setValue('pickCount', form?.getValues('pickCount') === 2 ? 1 : 2);
                    }} />
                  <Label className='text-sm'>2</Label>
                </span>
              </FormControl>
              <FormDescription>
                Number of main castaway picks
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
      <FormField
        control={control}
        name='uniquePicks'
        render={() => (
          <FormItem>
            <FormLabel>Unique Picks</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <span className='grid grid-cols-3 place-items-center'>
                  <Label className='text-sm'>Off</Label>
                  <Switch
                    checked={form?.getValues('uniquePicks')}
                    onCheckedChange={() => {
                      form?.setValue('uniquePicks', !form?.getValues('uniquePicks'));
                    }} />
                  <Label className='text-sm'>On</Label>
                </span>
              </FormControl>
              <FormDescription>
                Allow duplicate picks
              </FormDescription>
            </span>
            <FormMessage />
          </FormItem>
        )} />
    </section>
  );
}
*/
