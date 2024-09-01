'use client';
import { type ComponentProps } from '~/lib/utils';
import { MemberRow } from '../members';
import { getContrastingColor } from '@uiw/color-convert';
import { createSwapy } from 'swapy';
import { useEffect, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { Button } from '~/app/_components/commonUI/button';
import { updateDraftOrder } from '~/app/api/leagues/[id]/settings/actions';
import { useRouter } from 'next/navigation';

interface DraftOrderProps extends ComponentProps {
  leagueId: number;
  draftOrder: { name: string, color: string }[];
  ownerLoggedIn: boolean;
}

export default function DraftOrder({ leagueId, draftOrder, ownerLoggedIn, className }: DraftOrderProps) {
  const [order, setOrder] = useState(draftOrder);
  const router = useRouter();

  useEffect(() => {
    const container = document.getElementById('swapy-draft-container');

    const swapy = createSwapy(container, {
      animation: 'spring',
    });
    swapy.onSwap(({ data }) => {
      console.log(data.array);
      const newOrder = data.array
        .map((item) => order
          .find((member) => member.name === item.item))
        .filter((member) => member !== undefined);
      setOrder(newOrder);
    });
    swapy.enable(true);

    return () => swapy.enable(false);
  }, [order]);

  /* const shuffleOrder = () => {
    const shuffledOrder = [...order]
      .sort(() => Math.random() - 0.5);
    setOrder(shuffledOrder);
  };*/

  const saveOrder = () => {
    const update = updateDraftOrder.bind(null, leagueId, order.map((member) => member.name));

    update()
      .then(() => router.refresh())
      .catch((e) => console.error(e));
  };

  return (
    <section id='swapy-draft-container' className={className}>
      {ownerLoggedIn && <span className='w-full grid grid-cols-2 gap-1'>
        {/*<Button onClick={shuffleOrder}>Shuffle</Button>*/}
        <form action={saveOrder}>
          <Button className='w-full' type='submit'>Save</Button>
        </form>
      </span>}
      {draftOrder.map((member, index) =>
        <span key={`swapy-${index}`} data-swapy-slot={`swapy-${index}`}>
          <MemberRow color={member.color} dataSwapyItem={`${member.name}`}>
            <h3 style={{ color: getContrastingColor(member.color) }}>{index + 1} - {member.name}</h3>
            {ownerLoggedIn && <GripVertical size={24} className='cursor-ns-resize ml-auto' data-swapy-handle />}
          </MemberRow>
        </span>)}
    </section>
  );
}
