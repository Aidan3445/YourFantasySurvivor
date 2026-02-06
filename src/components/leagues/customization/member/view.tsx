'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormLabel } from '~/components/common/form';
import { useEffect } from 'react';
import LeagueMemberFields from '~/components/leagues/customization/member/formFields';
import { Button } from '~/components/common/button';
import { cn } from '~/lib/utils';
import { type LeagueMemberInsert, LeagueMemberInsertZod } from '~/types/leagueMembers';
import { useQueryClient } from '@tanstack/react-query';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import updateMemberDetails from '~/actions/updateMemberDetails';
import { Card } from '~/components/common/card';
import LeaveLeague from '~/components/leagues/customization/member/leaveLeague';

interface MemberEditFormProps {
  className?: string;
}

export default function MemberEditForm({ className }: MemberEditFormProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague();
  const { data: leagueMembers } = useLeagueMembers();

  const reactForm = useForm<LeagueMemberInsert>({
    defaultValues: {
      displayName: leagueMembers?.loggedIn?.displayName ?? '',
      color: leagueMembers?.loggedIn?.color ?? '',
    },
    resolver: zodResolver(LeagueMemberInsertZod),
  });

  useEffect(() => {
    reactForm.setValue('displayName', leagueMembers?.loggedIn?.displayName ?? '');
    reactForm.setValue('color', leagueMembers?.loggedIn?.color ?? '');
  }, [leagueMembers?.loggedIn, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    if (!league || !leagueMembers?.loggedIn) return;

    try {
      await updateMemberDetails(league.hash, data);
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', league.hash] });
      alert('Successfully updated member details');
    } catch (error) {
      console.error(error);
      alert('Failed to update member details. Please try again.');
    }
  });

  return (
    <Card className={cn(
      'flex flex-col gap-3 p-4 bg-card rounded-lg border-2 border-primary/20 shadow-lg shadow-primary/10 w-full items-center',
      className
    )}>
      <Form {...reactForm}>
        <form action={() => handleSubmit()}>
          <div className='flex w-full items-center justify-start gap-3 h-8'>
            <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
            <FormLabel className='text-base md:text-xl font-black uppercase tracking-tight leading-none text-nowrap'>
              Edit Member Details
            </FormLabel>
          </div>
          <LeagueMemberFields
            memberColors={leagueMembers?.members.map(m => m.color) ?? []}
            currentColor={leagueMembers?.loggedIn?.color} />
          <div className='flex gap-4'>
            <Button
              disabled={!reactForm.formState.isDirty}
              type='submit'
              className='flex-1 font-bold uppercase text-xs tracking-wider'>
              Save
            </Button>
            {league?.status !== 'Inactive' && (
              <LeaveLeague member={leagueMembers?.loggedIn} />
            )}
          </div>
        </form>
      </Form>
    </Card>
  );
}
