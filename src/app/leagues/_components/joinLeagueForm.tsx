'use client';
import { SignInButton, useUser } from '@clerk/nextjs';
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
import { cn } from '~/lib/utils';

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
  closePopup?: () => void;
}

export default function JoinLeagueForm({ className, closePopup }: JoinLeagueFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();

  const onSubmit = form.handleSubmit(async (data: z.infer<typeof formSchema>) => {
    await fetch('/api/leagues/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, displayName: user?.username }),
    })
      .then(async res => {
        const status = res.status;
        const data = await (res.json() as Promise<number | { message: string }>);

        if (typeof data === 'number') {
          router.push(`/leagues/${data}`);
          closePopup?.();
        } else if (status === 401) throw new Error('Must be signed in to join a league');
        else if (status === 403) form.setError('password', { type: 'manual', message: 'Invalid league name or password' });
        else if (status === 409) throw new Error('You are already a member of this league');
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
  });

  return (
    <CardContainer className={className}>
      <Form {...form}>
        {!isSignedIn &&
          <SignInButton>
            <Button className='absolute inset-y-1/2 z-10 place-self-center font-medium text-md'>
              Sign in to create a league
            </Button>
          </SignInButton>}
        <form
          className={cn('flex flex-col gap-4 h-full', isSignedIn ? '' : 'blur pointer-events-none')}
          onSubmit={onSubmit}>
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
            )} />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password (optional)</FormLabel>
                <Input
                  className='w-32'
                  type='password'
                  placeholder='Password'
                  autoComplete='off'
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )} />
          <Button className='w-full' type='submit'>Join</Button>
        </form>
      </Form>
    </CardContainer>
  );
}
