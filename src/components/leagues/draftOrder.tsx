'use client';

import { useLeague } from '~/hooks/useLeague';
import { getContrastingColor } from '@uiw/color-convert';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '~/lib/utils';
import { GripVertical, Lock, LockOpen, Shuffle } from 'lucide-react';
import SortableItem from '~/components/ui/sortableItem';
import { handleDragEnd } from '~/hooks/useSortableItem';
import { updateDraftOrder } from '~/app/api/leagues/actions';
import { Button } from '~/components/ui/button';

const SUFFLE_DURATION = 500;
const SHUFFLE_LOOPS = 4;

interface DraftOrderProps {
  className?: string;
}

export default function DraftOrder({ className }: DraftOrderProps) {
  const {
    league: {
      leagueHash,
      members,
      leagueStatus,
      settings: {
        draftOrder,
        draftDate
      }
    },
    refresh
  } = useLeague();
  const sensors = useSensors(useSensor(PointerSensor));
  const [locked, setLocked] = useState(true);

  const dbOrder = useMemo(() => draftOrder.map((memberId) => {
    const member = members.list.find((m) => m.memberId === memberId);
    return member;
  }).filter((member) => !!member)
    .map((member) => ({ ...member, id: member.memberId })),
    [members, draftOrder]);

  const [order, setOrder] = useState(dbOrder);

  useEffect(() => {
    setOrder(dbOrder);
  }, [dbOrder, setOrder]);

  const orderChanged = useMemo(() => {
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

  const orderLocked = locked ||
    leagueStatus !== 'Predraft' ||
    members.loggedIn?.role !== 'Owner' ||
    (!!draftDate && Date.now() > draftDate.getTime());

  const handleSubmit = async () => {
    try {
      await updateDraftOrder(leagueHash, order.map((member) => member.memberId));
      await refresh();
      alert('Draft order saved');
      setLocked(true);
    } catch (error) {
      console.error(error);
      alert('Failed to save draft order');
    }
  };

  return (
    <article className={cn('flex flex-col w-full p-2 bg-card rounded-xl relative', className)}>
      {orderLocked ?
        <Lock
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => setLocked(false)} /> :
        <LockOpen
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => { setLocked(true); setOrder(dbOrder); }} />}
      <span className='flex gap-4 items-center mb-4 w-full'>
        <h2 className='text-lg font-bold text-card-foreground h-9 place-content-center'>Draft Order</h2>
        {!orderLocked && <>
          <Shuffle
            className='cursor-pointer stroke-primary hover:stroke-secondary transition-all mr-2'
            size={24}
            onClick={shuffleOrderWithAnimation} />
          <form className='ml-auto' action={() => handleSubmit()}>
            <span className='grid grid-cols-2 gap-2 mr-12'>
              <Button
                type='button'
                disabled={!orderChanged}
                variant='destructive'
                onClick={() => { setOrder(dbOrder); setLocked(true); }}>
                Cancel
              </Button>
              <Button type='submit' disabled={!orderChanged}>Save</Button>
            </span>
          </form>
        </>}
      </span>
      <DndContext
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
                  id={member.memberId}
                  className='grid col-span-3 grid-cols-subgrid'
                  disabled={orderLocked}>
                  <ColorRow
                    color={member.color}
                    loggedIn={members.loggedIn?.memberId === member.memberId}>
                    <h3 className='text-lg' style={{ color: getContrastingColor(member.color) }}>{index + 1}</h3>
                    <h2 className='text-3xl font-semibold' style={{ color: getContrastingColor(member.color) }}>{member.displayName}</h2>
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

export interface ColorRowProps {
  color?: string;
  loggedIn?: boolean;
  className?: string;
  children: ReactNode;
}

export function ColorRow({ color, loggedIn, className, children }: ColorRowProps) {
  return (
    <span
      className={cn(
        'px-4 gap-4 rounded border border-black flex items-center text-nowrap',
        loggedIn && 'border-none ring-2 ring-white',
        className
      )}
      style={{ backgroundColor: color, color: color ? getContrastingColor(color) : '' }}>
      {children}
    </span>
  );
}

