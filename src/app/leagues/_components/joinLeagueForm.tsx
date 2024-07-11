'use client';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CardContainer from '~/app/_components/cardContainer';
import { Button } from '~/app/_components/commonUI/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '~/app/_components/commonUI/form';
import { Input } from '~/app/_components/commonUI/input';
import { Label } from '~/app/_components/commonUI/label';
import { useToast } from '~/app/_components/commonUI/use-toast';

const formSchema = z.object({
  name: z.string(),
  password: z.string().or(z.literal('')),
});

const defaultValues = {
  name: '',
  password: '',
} as z.infer<typeof formSchema>;

interface JoinLeagueFormProps {
  className?: string;
}

export default function JoinLeagueForm({ className }: JoinLeagueFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const { toast } = useToast();
  const { user } = useUser();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await fetch('/api/leagues/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, displayName: user?.fullName }),
    })
      .then(async res => {
        const status = res.status;
        const data = await (res.json() as Promise<number | { message: string }>);

        if (typeof data === 'number') router.push(`/leagues/${data}`);
        else if (status === 401) throw new Error('Must be signed in to join a league');
        else if (status === 403) form.setError('password', { type: 'manual', message: 'Invalid league name or password' });
        else throw new Error(data.message);
      }).catch((e) => {
        if (e instanceof Error) {
          toast({
            title: 'Error joining league',
            description: e.message,
            variant: 'error',
          });
        }
      });
  };

  return (
    <CardContainer className={className}>
      <Form {...form}>
        <form
          className='flex flex-col gap-4 h-full'
          onSubmit={form.handleSubmit(onSubmit)}>
          <Label className='text-2xl font-medium'>Join a League</Label>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>League Name</FormLabel>
                <Input
                  className='w-32'
                  type='text'
                  placeholder='League Name'
                  autoComplete='off'
                  {...field}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password (optional)</FormLabel>
                <Input
                  className='w-32'
                  type='text'
                  placeholder='Password'
                  autoComplete='off'
                  {...field}
                />
              </FormItem>
            )}
          />
          <FormMessage>
            {form.formState.errors.password?.message}
          </FormMessage>
          <Button className='w-full mt-auto' type='submit'>Join League</Button>
        </form>
      </Form>
    </CardContainer>
  );
}
