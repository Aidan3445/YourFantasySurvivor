'use client';

import { getContrastingColor } from '@uiw/color-convert';
import { useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '~/lib/utils';
import { GripVertical, Lock, LockOpen, Shuffle } from 'lucide-react';
import SortableItem from '~/components/common/sortableItem';
import { handleDragEnd } from '~/hooks/ui/useSortableItem';
import { Button } from '~/components/common/button';
import { useRouter } from 'next/navigation';
import ColorRow from '~/components/shared/colorRow';
import { useQueryClient } from '@tanstack/react-query';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useLeagueSettings } from '~/hooks/leagues/useLeagueSettings';
import updateDraftOrder from '~/actions/updateDraftOrder';

const SUFFLE_DURATION = 500;
const SHUFFLE_LOOPS = 4;

interface DraftOrderProps {
  overrideHash?: string;
  className?: string;
}

export default function DraftOrder({ overrideHash, className }: DraftOrderProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague(overrideHash);
  const { data: leagueMembers } = useLeagueMembers(overrideHash);
  const { data: settings } = useLeagueSettings(overrideHash);

  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor));
  const [locked, setLocked] = useState(true);

  const dbOrder = useMemo(() => leagueMembers?.members.map(m => ({ ...m, id: m.memberId })) ?? [], [leagueMembers?.members]);
  const [order, setOrder] = useState(dbOrder);

  useEffect(() => {
    if (league?.status !== 'Predraft' && league?.hash) router.push(`/leagues/${league.hash}/draft`);
  }, [league, router]);

  useEffect(() => {
    if (!leagueMembers?.members) return;

    setOrder(leagueMembers.members.map(m => ({ ...m, id: m.memberId })));
  }, [leagueMembers?.members]);

  const orderChanged = useMemo(() => {
    if (!leagueMembers?.members || !order) return false;
    return leagueMembers.members.some((member, index) => member.memberId !== order[index]?.memberId);
  }, [leagueMembers?.members, order]);

  if (!leagueMembers) return null;

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
    league?.status !== 'Predraft' ||
    (!!settings?.draftDate && Date.now() > settings.draftDate.getTime());

  const handleSubmit = async () => {
    if (!league || !orderChanged || !leagueMembers) return;

    try {
      await updateDraftOrder(league?.hash, order.map((member) => member.memberId));
      await queryClient.invalidateQueries({ queryKey: ['leagueMembers', league.hash] });
      alert('Draft order saved');
      setLocked(true);
    } catch (error) {
      console.error(error);
      alert('Failed to save draft order');
    }
  };

  return (
    <article className={cn('flex flex-col w-full p-2 bg-card rounded-xl relative', className)}>
      {leagueMembers.loggedIn?.role === 'Owner' && (orderLocked ?
        <Lock
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => setLocked(false)} /> :
        <LockOpen
          className='absolute top-2 right-2 w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary transition-all'
          onClick={() => { setLocked(true); setOrder(dbOrder); }} />)}
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
                    loggedIn={leagueMembers.loggedIn?.memberId === member.memberId}>
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
