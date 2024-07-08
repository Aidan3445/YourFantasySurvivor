'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CardContainer from '~/app/_components/cardContainer';
import { Button } from '~/app/_components/commonUI/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '~/app/_components/commonUI/form';
import { Input } from '~/app/_components/commonUI/input';
import { Label } from '~/app/_components/commonUI/label';

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const id = await fetch('/api/leagues/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json() as Promise<number>);

    console.log(id);

    if (id === 0) {
      form.setError('password', { type: 'manual', message: 'Invalid league name or password' });
      return;
    }

    router.push(`/leagues/?id=${id}`);
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
