'use client';

import { useRouter } from 'next/navigation';
import { Button } from '~/app/_components/commonUI/button';
import { updateDraftOrder } from '~/app/api/leagues/[id]/settings/actions';
import { type ComponentProps } from '~/lib/utils';
import { type Settings } from '~/server/db/schema/leagues';

interface DraftSettingsProps extends ComponentProps {
  leagueId: number;
  settings: Settings;
}

export default function DraftSettings({ leagueId, settings, className }: DraftSettingsProps) {
  const router = useRouter();

  const shuffleOrder = () => {
    const order = settings.draftOrder;
    const shuffledOrder = [...order]
      .sort(() => Math.random() - 0.5)
      .map(member => member.name);
    const update = updateDraftOrder.bind(null, leagueId, shuffledOrder);

    update()
      .then(() => router.refresh())
      .catch((e) => console.error(e));
  };

  return (
    <form className={className} action={shuffleOrder}>
      <Button type='submit'>Shuffle Draft Order</Button>
    </form>
  );
}
