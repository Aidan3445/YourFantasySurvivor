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
      await queryClient.invalidateQueries({ queryKey: ['league', league.hash] });
      await queryClient.invalidateQueries({ queryKey: ['leagues'] });
      router.push('/leagues');
      alert(`League ${league.name} has been deleted.`);
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
    <div className={league?.status === 'Inactive' ? 'pointer-events-none opacity-50' : ''}>
      <Form {...reactForm}>
        <form
          action={() => handleSubmit()}
          className='w-full flex flex-col gap-4 h-full bg-card p-4 justify-between rounded-lg border-2 border-destructive/20 shadow-lg shadow-destructive/10 sm:min-w-sm'>
          <div className='flex items-center gap-3 h-8'>
            <span className='h-4 md:h-6 w-1 bg-destructive rounded-full' />
            <h2 className='md:text-xl font-black uppercase tracking-tight leading-none text-nowrap text-destructive'>
              Delete League
            </h2>
          </div>
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
                  <FormLabel className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>League Name</FormLabel>
                  <FormDescription className='text-xs'>Type the league name to confirm deletion</FormDescription>
                  <FormControl>
                    <Input
                      placeholder={`Enter "${league?.name ?? 'League Name'}" to confirm`}
                      {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <Button
              type='submit'
              className='mt-auto font-bold uppercase text-xs tracking-wider'
              variant='destructive'
              disabled={league?.status === 'Inactive'
                || reactForm.watch('confirmName') !== league?.name
                || reactForm.formState.isSubmitting}>
              {reactForm.formState.isSubmitting ? 'Deleting...' : 'Delete League'}
            </Button>
            {league?.status === 'Inactive' && (
              <p className='text-sm text-red-600'>
                This league is already inactive and cannot be deleted.
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

