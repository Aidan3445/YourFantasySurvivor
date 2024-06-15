'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CardContainer from '~/app/_components/cardContainer';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/app/_components/commonUI/form';
import { Input } from '~/app/_components/commonUI/input';
import { Label } from '~/app/_components/commonUI/label';
import { formSchema as rulesSchema } from '~/app/playground/_components/rules';
import { defaultRules } from '~/server/db/schema/leagues';

const formSchema = rulesSchema.extend({
  name: z.string()
    .min(3, { message: 'League name must be between 3 and 64 characters' })
    .max(64, { message: 'League name must be between 3 and 64 characters' }),
  password: z.string().min(8).max(64).optional(),
  passwordConfirmation: z.string().optional(),
  settings: z.object({
    pickCount: z.number().int().min(1).max(2),
    uniquePicks: z.boolean(),
  }),
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Passwords do not match',
  path: ['passwordConfirmation']
}).transform(data => {
  delete data.passwordConfirmation;
  return data;
});

const defaultValues = {
  ...defaultRules,
  settings: {
    pickCount: 1,
    uniquePicks: true,
  },
};

export default function CreateLeagueForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    router.replace(`/leagues/create?name=${data.name}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContainer className='p-5'>
          <Label className='text-2xl font-semibold'>Create League</Label>
          <FormField
            control={form.control}
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
        </CardContainer>
      </form>
    </Form >
  );
}
