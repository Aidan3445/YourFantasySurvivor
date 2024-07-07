'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm, type Control } from 'react-hook-form';
import { z } from 'zod';
import CardContainer from '~/app/_components/cardContainer';
import { Button } from '~/app/_components/commonUI/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/app/_components/commonUI/form';
import { Input } from '~/app/_components/commonUI/input';
import { Label } from '~/app/_components/commonUI/label';
import { Separator } from '~/app/_components/commonUI/separator';
import { Switch } from '~/app/_components/commonUI/switch';

const formSchema = z.object({
  name: z.string()
    .min(3, { message: 'League name must be between 3 and 64 characters' })
    .max(64, { message: 'League name must be between 3 and 64 characters' }),
  password: z.string().min(5).max(64).or(z.literal('')),
  passwordConfirmation: z.string(),
  settings: z.object({
    pickCount: z.number().int().min(1).max(2),
    uniquePicks: z.boolean(),
  }),
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
  settings: {
    pickCount: 1,
    uniquePicks: true,
  },
};

interface CreateLeagueFormProps {
  className?: string;
}

export default function CreateLeagueForm({ className }: CreateLeagueFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    router.replace(`/leagues/create?name=${data.name}`);
    console.log(data.settings.uniquePicks);
  };

  return (
    <CardContainer className={className} >
      <Form {...form}>
        <form
          className='flex flex-col gap-4'
          onSubmit={form.handleSubmit(onSubmit)}>
          <Label className='text-2xl font-semibold'>Create League</Label>
          <NameAndPassword control={form.control} />
          <Separator className='col-span-3 my-1 w-full' decorative />
          <Settings control={form.control} form={form} />
          <span className='flex gap-4 justify-end'>
            <Button className='w-2/3' type='submit'>
              Apply
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
        )}
      />
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
        )}
      />
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
        )}
      />
    </section>
  );
}

function Settings({ control, form }: FieldProps) {
  return (
    <section>
      <FormField
        control={control}
        name='settings.pickCount'
        render={() => (
          <FormItem>
            <FormLabel>Pick Count</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <span className='grid grid-cols-3 place-items-center'>
                  <Label className='text-sm'>1</Label>
                  <Switch
                    checked={form?.getValues('settings.pickCount') === 2}
                    onCheckedChange={() => {
                      form?.setValue('settings.pickCount', form?.getValues('settings.pickCount') === 2 ? 1 : 2);
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
        )}
      />
      <FormField
        control={control}
        name='settings.uniquePicks'
        render={() => (
          <FormItem>
            <FormLabel>Unique Picks</FormLabel>
            <span className='flex gap-4 items-center'>
              <FormControl>
                <span className='grid grid-cols-3 place-items-center'>
                  <Label className='text-sm'>Off</Label>
                  <Switch
                    checked={form?.getValues('settings.uniquePicks')}
                    onCheckedChange={() => {
                      form?.setValue('settings.uniquePicks', !form?.getValues('settings.uniquePicks'));
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
        )}
      />
    </section>
  );
}
