'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormLabel } from '~/components/ui/form';
import { ColorZod, DisplayNameZod, type LeagueMember } from '~/server/db/defs/leagueMembers';
import { updateMemberDetails } from '~/app/api/leagues/actions';
import { useEffect } from 'react';
import { useLeague } from '~/hooks/useLeague';
import { LeagueMemberFields } from '~/components/leagues/joinLeague';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

const formSchema = z.object({
  displayName: DisplayNameZod,
  color: ColorZod,
}).transform(data => ({
  ...data,
  displayName: data.displayName.trim(),
}));

interface MemberEditFormProps {
  className?: string;
}

export default function MemberEditForm({ className }: MemberEditFormProps) {
  const {
    league: {
      leagueHash,
      members: {
        loggedIn,
        list: memberColors
      }
    },
    refresh
  } = useLeague();

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      displayName: loggedIn?.displayName ?? '',
      color: loggedIn?.color ?? '',
    },
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    reactForm.setValue('displayName', loggedIn?.displayName ?? '');
  }, [loggedIn, reactForm]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      if (!loggedIn) return;

      const member: LeagueMember = {
        ...loggedIn,
        displayName: data.displayName,
        color: data.color,
      };

      await updateMemberDetails(leagueHash, member);
      await refresh();
      alert('Successfully updated member details');
    } catch (error) {
      console.error(error);
      alert('Failed to join league');
    }
  });

  return (
    <Form {...reactForm}>
      <form className={cn(
        'flex flex-col p-2 gap-2 bg-card rounded-lg w-96',
        className
      )} action={() => handleSubmit()}>
        <FormLabel className='text-lg font-bold text-card-foreground'>Edit Member Details</FormLabel>
        <LeagueMemberFields
          memberColors={memberColors
            .filter((m) => m.memberId !== loggedIn?.memberId)
            .map((m) => m.color)} />
        <Button
          disabled={!reactForm.formState.isDirty}
          type='submit'>Save</Button>
      </form>
    </Form>
  );
}
