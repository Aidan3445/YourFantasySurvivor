'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '~/components/common/form';
import { Button } from '~/components/common/button';
import { ColorZod, DisplayNameZod, type LeagueMemberColor, type NewLeagueMember } from '~/types/leagueMembers';
import { joinLeague } from '~/services/leagues/settings/leagueActions';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useYfsUser } from '~/hooks/useYfsUser';
import LeagueMemberFields from '~/components/leagues/customization/member/formFields';

const formSchema = z.object({
  displayName: DisplayNameZod,
  color: ColorZod,
}).transform(data => ({
  ...data,
  displayName: data.displayName.trim(),
}));

const defaultValues = {
  displayName: '',
  color: ''
};

interface JoinLeagueFormProps {
  leagueHash: string;
}

export default function JoinLeagueForm({ leagueHash }: JoinLeagueFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [memberColors, setMemberColors] = useState<LeagueMemberColor[]>([]);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });
  const { addLeague } = useYfsUser();

  useEffect(() => {
    reactForm.setValue('displayName', user?.username ?? '');
  }, [user, reactForm]);

  useEffect(() => {
    async function fetchMemberColors() {
      await fetch(`/api/leagues/${leagueHash}/join`)
        .then(res => res.json())
        .then(({ memberColors }: { memberColors: LeagueMemberColor[] }) => {
          setMemberColors(memberColors);
        });
    }

    void fetchMemberColors();
  }, [leagueHash, setMemberColors]);

  const handleSubmit = reactForm.handleSubmit(async (data) => {
    try {
      const member: NewLeagueMember = {
        displayName: data.displayName,
        color: data.color,
        role: 'Member',
      };

      const leagueInfo = await joinLeague(leagueHash, member);
      addLeague(leagueInfo);
      alert('Successfully joined league');
      router.push(`/leagues/${leagueHash}`);
    } catch (error) {
      console.error(error);
      alert('Failed to join league');
    }
  });

  return (
    <Form {...reactForm}>
      <form className=' flex flex-col p-2 gap-2 bg-card rounded-lg w-96' action={() => handleSubmit()}>
        <LeagueMemberFields memberColors={memberColors} />
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
