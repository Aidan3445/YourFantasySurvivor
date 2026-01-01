'use client';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/common/form';
import { useForm } from 'react-hook-form';
import { Button } from '~/components/common/button';
import { Input } from '~/components/common/input';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useRouter } from 'next/navigation';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import deleteLeague from '~/actions/deleteLeague';
import { useQueryClient } from '@tanstack/react-query';

export default function DeleteLeague() {
  const queryClient = useQueryClient();
  const { data: leagueMembers } = useLeagueMembers();
  const { data: league } = useLeague();
  const router = useRouter();

  const reactForm = useForm({
    defaultValues: {
      confirmName: '',
    },
  });

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league || league.status === 'Inactive') return;

    if (data.confirmName !== league.name) {
      alert('League name does not match. Please type the league name exactly to confirm deletion.');
      return;
    }

    try {
      const success = await deleteLeague(league.hash);
      if (!success) {
        alert('Failed to delete league. Please try again later.');
        return;
      }
      alert(`League ${league.name} has been deleted.`);
      await queryClient.invalidateQueries({ queryKey: ['league', league.hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagues'] });
      router.push('/leagues');
    }
    catch (error) {
      console.error('Failed to delete league', error);
      alert('An error occurred while deleting the league.');
    }
  });

  if (leagueMembers?.loggedIn?.role !== 'Owner') {
    return null;
  }

  return (
    <Form {...reactForm}>
      <form
        action={() => handleSubmit()}
        className='flex flex-col gap-4 h-66 bg-card p-2 justify-between rounded-xl min-w-sm'>
        <h3 className='text-lg font-bold text-card-foreground text-center cursor-default'>
          Delete League
        </h3>
        <p className='text-sm text-muted-foreground'>
          Deleting a league is permanent and cannot be undone. All data associated with the league will be lost.
          Please type the league name to confirm deletion.
        </p>
        <div className='flex flex-col gap-2'>
          <FormField
            control={reactForm.control}
            name='confirmName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>League Name</FormLabel>
                <FormDescription>Type the league name to confirm deletion</FormDescription>
                <FormControl>
                  <Input
                    placeholder={`Enter "${league?.name ?? 'League Name'}" to confirm`}
                    {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='mt-auto'
            variant='destructive'
            disabled={league?.status === 'Inactive' || reactForm.watch('confirmName') !== league?.name}>
            Delete League
          </Button>
          {league?.status === 'Inactive' && (
            <p className='text-sm text-red-600'>
              This league is already inactive and cannot be deleted.
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}

