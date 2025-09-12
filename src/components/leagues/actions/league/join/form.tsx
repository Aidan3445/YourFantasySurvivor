'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import LeagueMemberFields from '~/components/leagues/customization/member/formFields';
import { type LeagueMemberInsert, LeagueMemberInsertZod } from '~/types/leagueMembers';
import joinLeague from '~/actions/joinLeague';
import { useQueryClient } from '@tanstack/react-query';

const defaultValues = {
  displayName: '',
  color: ''
};

interface JoinLeagueFormProps {
  hash: string;
  colors: string[];
}

export default function JoinLeagueForm({ hash, colors }: JoinLeagueFormProps) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const router = useRouter();

  const reactForm = useForm<LeagueMemberInsert>({
    defaultValues,
    resolver: zodResolver(LeagueMemberInsertZod),
  });

  useEffect(() => {
    reactForm.setValue('displayName', user?.username ?? '');
  }, [user, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const member: LeagueMemberInsert = {
        displayName: data.displayName,
        color: data.color,
      };

      await joinLeague(hash, member);
      await queryClient.invalidateQueries({ queryKey: ['leagues'] });
      alert('Successfully joined league');
      router.push(`/leagues/${hash}`);
    } catch (error) {
      console.error(error);
      alert('Failed to join league');
    }
  });

  return (
    <Form {...reactForm}>
      <form className='p-2 gap-2 bg-card rounded-lg w-96' action={() => handleSubmit()}>
        <LeagueMemberFields memberColors={colors} />
        <Button
          className='w-full'
          type='submit'
          disabled={!reactForm.formState.isValid}>
          Join League
        </Button>
      </form>
    </Form>
  );
}
