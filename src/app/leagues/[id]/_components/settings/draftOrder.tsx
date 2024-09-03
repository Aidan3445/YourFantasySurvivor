'use client';
import { type ComponentProps } from '~/lib/utils';
import { MemberRow } from '../members';
import { getContrastingColor } from '@uiw/color-convert';
import { useState } from 'react';
import { Button } from '~/app/_components/commonUI/button';
import { updateDraftOrder } from '~/app/api/leagues/[id]/settings/actions';
import { useRouter } from 'next/navigation';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, type UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import SortableItem, { handleDragEnd } from '~/app/_components/commonUI/sortableItem';
import { GripVertical } from 'lucide-react';

interface DraftOrderProps extends ComponentProps {
  leagueId: number;
  draftOrder: { name: string, color: string }[];
  ownerLoggedIn: boolean;
}

const SUFFLE_DURATION = 500;
const SHUFFLE_LOOPS = 2;

export default function DraftOrder({ leagueId, draftOrder, ownerLoggedIn, className }: DraftOrderProps) {
  const [order, setOrder] = useState(draftOrder
    .map((member) => ({ ...member, id: member.name as UniqueIdentifier })));
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const router = useRouter();

  const shuffleOrderWithAnimation = () => {
    // shuffle order by swapping items one by one
    let i = 0;
    const interval = setInterval(() => {
      if (++i < order.length * SHUFFLE_LOOPS) {
        const randomIndex = Math.floor(Math.random() * order.length);
        setOrder((items) => {
          return arrayMove(items, i % order.length, randomIndex)
            .map((item, index) => ({ ...item, index }));
        });
      } else {
        clearInterval(interval);
      }
    }, SUFFLE_DURATION / (order.length * SHUFFLE_LOOPS));
  };

  const saveOrder = () => {
    const update = updateDraftOrder.bind(null, leagueId, order.map((member) => member.name));

    update()
      .then(() => router.refresh())
      .catch((e) => console.error(e));
  };

  return (
    <section className={className}>
      {ownerLoggedIn && <span className='w-full grid grid-cols-2 gap-1'>
        <Button onClick={shuffleOrderWithAnimation}>Shuffle</Button>
        <form action={saveOrder}>
          <Button className='w-full' type='submit'>Save</Button>
        </form>
      </span>}
      <article className='flex flex-col gap-1'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToParentElement]}
          onDragEnd={(event) => handleDragEnd(event, setOrder)}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {order.map((member, index) =>
              <SortableItem key={member.name} id={member.id} disabled={!ownerLoggedIn}>
                <MemberRow color={member.color}>
                  <h3 style={{ color: getContrastingColor(member.color) }}>{index + 1} - {member.name}</h3>
                  {ownerLoggedIn &&
                    <GripVertical
                      className='cursor-row-resize ml-auto'
                      color={getContrastingColor(member.color)} />}
                </MemberRow>
              </SortableItem>)}
          </SortableContext>
        </DndContext>
      </article>
    </section>
  );
}
