'use client';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/app/_components/commonUI/button';
import { Form, FormControl, FormField, FormItem } from '~/app/_components/commonUI/form';
import { Input } from '~/app/_components/commonUI/input';
import { useToast } from '~/app/_components/commonUI/use-toast';
import { joinLeague } from '~/app/api/leagues/join/actions';

const joinSchema = z.object({
  displayName: z.string(),
});

export default function AutoJoin() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const password = searchParams.get('password');

  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
  });

  const joinAction = () => {
    if (!name || !password) return;
    const join = joinLeague.bind(null, name, password, form.getValues().displayName);

    join()
      .then((leagueId) => {
        router.push(`/leagues/${leagueId}`);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast({
            title: 'Failed to join league',
            description: error.message,
            variant: 'error',
          });
        }
      });
  };

  return (
    <>
      <SignedOut>
        <SignInButton>
          <Button className='mt-20 scale-150 flex gap-1 pb-1' >
            <div className='animate-bounce inline'> Sign </div>
            <div className='animate-bounce inline delay-100'> in </div>
            <div className='animate-bounce inline delay-200'> to </div>
            <div className='animate-bounce inline delay-300'> join </div>
            <div className='animate-bounce inline delay-400'> the </div>
            <div className='animate-bounce inline delay-500'> league </div>
          </Button >
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Form {...form}>
          <form className='grid gap-2' action={joinAction}>
            <h3 className='text-2xl font-bold'>Join the League</h3>
            <FormField
              name='displayName'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type='text' placeholder='Display Name' {...field} />
                  </FormControl>
                </FormItem>
              )} />
            <Button type='submit'>Join</Button>
          </form>
        </Form>
      </SignedIn>
    </>
  );
}
