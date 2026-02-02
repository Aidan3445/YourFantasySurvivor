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
import updateDraftOrder from '~/actions/updateDraftOrder';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { Card, CardHeader } from '~/components/common/card';
import { Separator } from '~/components/common/separator';
import { usePendingMembers } from '~/hooks/leagues/usePendingMembers';
import Link from 'next/link';

const SHUFFLE_DURATION = 500;
const SHUFFLE_LOOPS = 4;

interface DraftOrderProps {
  overrideHash?: string;
  scrollHeight?: string;
  goToSettings?: () => void;
  className?: string;
}

export default function DraftOrder({ overrideHash, scrollHeight, goToSettings, className }: DraftOrderProps) {
  const queryClient = useQueryClient();
  const { data: league } = useLeague(overrideHash);
  const { data: leagueMembers } = useLeagueMembers(overrideHash);
  const { data: pendingMembers } = usePendingMembers(overrideHash);

  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor));
  const [locked, setLocked] = useState(true);

  const dbOrder = useMemo(() => leagueMembers?.members.map(m => ({ ...m, id: m.memberId })) ?? [], [leagueMembers?.members]);
  const [order, setOrder] = useState(dbOrder);

  useEffect(() => {
    if (!overrideHash && league?.status !== 'Predraft' && league?.hash) router.push(`/leagues/${league.hash}/draft`);
  }, [league, overrideHash, router]);

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
    const swaps: { from: number; to: number }[] = [];
    const tempOrder = [...order];

    for (let loop = 0; loop < SHUFFLE_LOOPS; loop++) {
      for (let i = tempOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        swaps.push({ from: i, to: j });
      }
    }

    // Animate swaps one by one
    let swapIndex = 0;
    const interval = setInterval(() => {
      if (swapIndex < swaps.length) {
        const { from, to } = swaps[swapIndex]!;
        setOrder((items) =>
          arrayMove(items, from, to)
            .map((item, index) => ({ ...item, index }))
        );
        swapIndex++;
      } else {
        clearInterval(interval);
      }
    }, SHUFFLE_DURATION / swaps.length);
  };

  const orderLocked = locked || league?.status !== 'Predraft';

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
    <Card className={cn(
      'border-2 border-primary/20 shadow-lg shadow-primary/10',
      className
    )}>
      {/* Header */}
      <CardHeader className='flex items-center justify-between mb-2 px-4'>
        <div className='flex items-center gap-3 h-8'>
          <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
          <h2 className='md:text-xl font-black uppercase tracking-tight leading-none text-nowrap'>
            Draft Order
          </h2>
        </div>

        <span className='flex items-center gap-2'>
          {!orderLocked && (
            <>
              <button
                onClick={shuffleOrderWithAnimation}
                className='p-1 bg-primary/10 border-2 border-primary/30 rounded-lg hover:bg-primary/20 hover:border-primary/40 transition-all'>
                <Shuffle className='w-4 h-4 text-primary' />
              </button>
              <Button
                type='button'
                size='sm'
                disabled={!orderChanged}
                variant='outline'
                className='px-1 font-bold uppercase text-xs tracking-wider border-destructive/40 text-destructive hover:bg-destructive/10'
                onClick={() => { setOrder(dbOrder); setLocked(true); }}>
                Cancel
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={!orderChanged}
                className='px-1 font-bold uppercase text-xs tracking-wider shadow-lg hover:shadow-xl transition-all'
                onClick={handleSubmit}>
                Save
              </Button>
            </>
          )}
          {leagueMembers.members.length > 1 && leagueMembers.loggedIn?.role === 'Owner' && (
            orderLocked ? (
              <Lock
                className='w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary active:stroke-secondary/75 transition-all'
                onClick={() => setLocked(false)}
              />
            ) : (
              <LockOpen
                className='w-8 h-8 cursor-pointer stroke-primary hover:stroke-secondary active:stroke-secondary/75 transition-all'
                onClick={() => { setLocked(true); setOrder(dbOrder); }}
              />
            )
          )}
        </span>
      </CardHeader>

      {scrollHeight && (
        <div className='px-4'>
          <Separator />
        </div>
      )}

      {/* Order List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToParentElement]}
        onDragEnd={(event) => handleDragEnd(event, setOrder)}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ScrollArea className={cn('flex flex-col', scrollHeight && `overflow-y-auto ${scrollHeight}`)}>
            <div className='py-1 px-4 pb-4 space-y-2'>
              {leagueMembers.loggedIn?.role !== 'Member' && pendingMembers && pendingMembers.members.length > 0 && (
                <ColorRow
                  color='#D4AC2B'
                  className='rounded-lg border-2 border-dashed'>
                  <span className='flex items-center gap-3 w-full text-inherit'>
                    <span
                      className='inline-flex items-center justify-center w-8 h-8 rounded-md font-black text-sm shrink-0'
                      style={{
                        backgroundColor: '#D4AC2B40',
                        border: '2px solid #D4AC2B66'
                      }}>
                      !
                    </span>
                    <span className='text-xl font-bold text-inherit'>
                      {pendingMembers.members.length} Pending
                    </span>
                    <Link
                      href={league ? `/leagues/${league.hash}/predraft#manage-members` : '#'}
                      onClick={goToSettings}
                      className='ml-auto hover:underline font-medium text-inherit hover:text-primary'>
                      Go to league settings to manage
                    </Link>
                  </span>
                </ColorRow>
              )}
              {order.map((member, index) => {
                return (
                  <SortableItem
                    key={member.memberId}
                    id={member.memberId}
                    className='group'
                    disabled={orderLocked}>
                    <ColorRow
                      color={member.color}
                      loggedIn={leagueMembers.loggedIn?.memberId === member.memberId}
                      className='rounded-lg border-2 transition-all hover:border-primary/40'>
                      <span className='flex items-center gap-3 w-full text-inherit'>
                        {/* Order Badge */}
                        <span
                          className='inline-flex items-center justify-center w-8 h-8 rounded-md font-black text-sm shrink-0'
                          style={{
                            backgroundColor: `${member.color}40`,
                            border: `2px solid ${member.color}66`
                          }}>
                          {index + 1}
                        </span>

                        {/* Name */}
                        <span className='text-xl font-bold text-inherit'>
                          {member.displayName}
                        </span>

                        {/* Drag Handle */}
                        {!orderLocked && (
                          <GripVertical
                            className='ml-auto cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity shrink-0'
                            color={getContrastingColor(member.color)}
                          />
                        )}
                      </span>
                    </ColorRow>
                  </SortableItem>
                );
              })}
            </div>
            <ScrollBar className='pb-2 pt-1' forceMount />
          </ScrollArea>
        </SortableContext>
      </DndContext>
    </Card >
  );
}
