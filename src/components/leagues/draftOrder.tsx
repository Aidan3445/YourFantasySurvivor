'use client';

import { useLeague } from '~/hooks/useLeague';
import { getContrastingColor } from '@uiw/color-convert';
import { useMemo, useState, type ReactNode } from 'react';
import { closestCenter, DndContext, PointerSensor, type UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '~/lib/utils';
import { GripVertical, Shuffle } from 'lucide-react';
import SortableItem from '../ui/sortableItem';
import { handleDragEnd } from '~/hooks/useSortableItem';
import { updateDraftOrder } from '~/app/api/leagues/actions';
import { Button } from '../ui/button';

const SUFFLE_DURATION = 500;
const SHUFFLE_LOOPS = 5;

export default function DraftOrder() {
  const {
    league: {
      leagueHash,
      members,
      settings: {
        draftOrder,
        draftOver,
      }
    }
  } = useLeague();
  const sensors = useSensors(useSensor(PointerSensor));

  const initialOrder = draftOrder.map((memberId) => {
    const member = members.list.find((m) => m.memberId === memberId);
    return member;
  }).filter((member) => !!member)
    .map((member) => ({ ...member, id: member.memberId as UniqueIdentifier }));

  const [order, setOrder] = useState(initialOrder);
  const orderChaged = useMemo(() => {
    return order.some((member, index) => member.memberId !== draftOrder[index]);
  }, [order, draftOrder]);

  const shuffleOrderWithAnimation = () => {
    // shuffle order by swapping items one by one
    let i = 0;
    const interval = setInterval(() => {
      if (++i < order.length * SHUFFLE_LOOPS) {
        const randomIndex = Math.floor(2 * order.length);
        setOrder((items) => {
          return arrayMove(items, i % order.length, randomIndex)
            .map((item, index) => ({ ...item, index }));
        });
      } else {
        clearInterval(interval);
      }
    }, SUFFLE_DURATION / (order.length * SHUFFLE_LOOPS));
  };

  const orderLocked = draftOver || members.loggedIn?.role === 'member';

  const saveOrder = async () => {
    try {
      await updateDraftOrder(leagueHash, order.map((member) => member.memberId));
      alert('Draft order saved');
    } catch (error) {
      console.error(error);
      alert('Failed to save draft order');
    }
  };

  return (
    <article className='flex flex-col w-full p-2 bg-card rounded-xl'>
      <span className='flex gap-4 items-center mb-4 w-full'>
        <h2 className='text-lg font-bold text-card-foreground'>Draft Order</h2>
        {!orderLocked && <>
          <Shuffle
            className='cursor-pointer stroke-primary mr-2'
            size={24}
            onClick={shuffleOrderWithAnimation} />
          <span className='flex gap-2 ml-auto'>
            <form action={() => saveOrder()}>
              <Button disabled={!orderChaged} onClick={saveOrder}>Save</Button>
            </form>
            <Button disabled={!orderChaged} variant='destructive' onClick={() => setOrder(initialOrder)}>Reset</Button>
          </span>
        </>}
      </span>
      <DndContext
        id='draftOrderDnd'
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToParentElement]}
        onDragEnd={(event) => handleDragEnd(event, setOrder)}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className='flex flex-col gap-2'>
            {order.map((member, index) => {
              return (
                <SortableItem
                  key={member.memberId}
                  id={member.id}
                  className='grid col-span-3 grid-cols-subgrid'
                  disabled={orderLocked}>
                  <ColorRow
                    color={member.color}
                    loggedIn={members.loggedIn?.memberId === member.memberId}>
                    <h3
                      className='text-lg'
                      style={{ color: getContrastingColor(member.color) }}>
                      {index + 1}
                    </h3>
                    <h2
                      className='text-3xl font-semibold'
                      style={{ color: getContrastingColor(member.color) }}>
                      {member.displayName}
                    </h2>
                    {!orderLocked &&
                      <GripVertical className='ml-auto cursor-row-resize' color={getContrastingColor(member.color)} />}
                  </ColorRow>
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </article>
  );
}

interface ColorRowProps {
  color: string;
  loggedIn: boolean;
  children: ReactNode;
}

function ColorRow({ color, loggedIn, children }: ColorRowProps) {
  return (
    <span
      className={cn(
        'px-4 gap-4 rounded border border-black flex items-center text-nowrap',
        loggedIn && 'border-none ring-2 ring-white'
      )}
      style={{ backgroundColor: color, color: getContrastingColor(color) }}>
      {children}
    </span>
  );
}

